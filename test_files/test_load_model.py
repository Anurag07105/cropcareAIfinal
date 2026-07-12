import os
import tensorflow as tf

print("TensorFlow version:", tf.__version__)

model_path = os.path.abspath(os.path.join("backend", "model", "mobilenetv2_cropcare.keras"))
print("Loading model from:", model_path)

try:
    model = tf.keras.models.load_model(model_path)
    print("Model loaded successfully")
except Exception as e:
    import traceback
    traceback.print_exc()
