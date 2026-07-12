import logging
import os
from typing import Any
from urllib.parse import unquote, urlparse

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth_utils import get_current_user
from ..database import get_db, models, schemas
from .predict import get_supabase_client

logger = logging.getLogger(__name__)
router = APIRouter()


def history_response(record: models.CropImage) -> dict[str, Any]:
    return {
        "id": record.id,
        "user_id": record.user_id,
        "image_url": record.image_url,
        "storage_path": record.storage_path,
        "crop_name": record.crop_name,
        "disease": record.disease_name,
        "confidence": record.confidence,
        "description": record.description,
        "prescription": record.prescription,
        "recommendation": record.prescription,
        "actions": record.actions or [],
        "raw_class": record.raw_class,
        "created_at": record.created_at,
    }


def get_user_history_record(
    history_id: int,
    current_user: models.User,
    db: Session,
) -> models.CropImage:
    record = (
        db.query(models.CropImage)
        .filter(
            models.CropImage.id == history_id,
            models.CropImage.user_id == current_user.id,
        )
        .first()
    )
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="History item not found")
    return record


def storage_path_from_url(image_url: str, bucket_name: str) -> str | None:
    marker = f"/storage/v1/object/public/{bucket_name}/"
    parsed_path = urlparse(image_url).path
    if marker not in parsed_path:
        return None
    return unquote(parsed_path.split(marker, 1)[1])


@router.get("", response_model=list[schemas.PredictionHistoryOut])
def get_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    records = (
        db.query(models.CropImage)
        .filter(models.CropImage.user_id == current_user.id)
        .order_by(models.CropImage.created_at.desc())
        .limit(50)
        .all()
    )
    return [history_response(record) for record in records]


@router.get("/{history_id}", response_model=schemas.PredictionHistoryOut)
def get_history_item(
    history_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = get_user_history_record(history_id, current_user, db)
    return history_response(record)


@router.post("", response_model=schemas.PredictionHistoryOut, status_code=status.HTTP_201_CREATED)
def create_history_item(
    payload: schemas.PredictionHistoryCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = models.CropImage(
        user_id=current_user.id,
        image_url=payload.image_url,
        storage_path=payload.storage_path,
        crop_name=payload.crop_name,
        disease_name=payload.disease,
        confidence=payload.confidence,
        description=payload.description,
        prescription=payload.prescription or payload.recommendation,
        actions=payload.actions,
        raw_class=payload.raw_class,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return history_response(record)


@router.delete("/{history_id}")
def delete_history_item(
    history_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = get_user_history_record(history_id, current_user, db)
    bucket_name = os.getenv("SUPABASE_STORAGE_BUCKET", "crop-images")
    storage_path = record.storage_path or storage_path_from_url(record.image_url, bucket_name)

    if storage_path:
        try:
            supabase = get_supabase_client()
            supabase.storage.from_(bucket_name).remove([storage_path])
        except Exception as exc:
            logger.exception("Failed to delete Supabase Storage object: %s", exc)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to delete stored image",
            )

    db.delete(record)
    db.commit()
    return {"detail": "History item deleted"}
