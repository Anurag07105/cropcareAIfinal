import { AnalysisResult } from '@/components/AnalysisResult';
import { Card, CardContent } from '@/components/ui/card';
import type { RefObject } from 'react';

export interface PredictionHistoryItem {
  id: number;
  user_id: number;
  image_url: string;
  storage_path?: string | null;
  crop_name?: string | null;
  disease?: string | null;
  confidence?: number | null;
  description?: string | null;
  prescription?: string | null;
  recommendation?: string | null;
  actions?: string[];
  raw_class?: string | null;
  created_at: string;
}

interface PredictionReportProps {
  item: PredictionHistoryItem;
  language: string;
  reportRef: RefObject<HTMLDivElement>;
}

export function toAnalysisResult(item: PredictionHistoryItem) {
  return {
    name: item.disease || 'Unknown disease',
    confidence: item.confidence || 0,
    description: item.description || 'No description was stored for this prediction.',
    prescription: item.prescription || item.recommendation || 'No recommendation was stored for this prediction.',
    actions: item.actions || [],
  };
}

export const PredictionReport = ({ item, language, reportRef }: PredictionReportProps) => {
  return (
    <div ref={reportRef} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            <img
              src={item.image_url}
              alt={item.crop_name ? `${item.crop_name} crop leaf` : 'Uploaded crop leaf'}
              className="w-full h-64 sm:h-80 object-cover"
              crossOrigin="anonymous"
            />
          </div>
        </CardContent>
      </Card>

      <AnalysisResult
        result={toAnalysisResult(item)}
        language={language}
        downloadTargetRef={reportRef}
        reportDate={item.created_at}
      />
    </div>
  );
};
