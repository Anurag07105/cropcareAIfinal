import os
import tensorflow as tf
import numpy as np

print("TensorFlow version:", tf.__version__)

model_path = os.path.abspath(os.path.join("backend", "model", "mobilenetv2_cropcare.keras"))
print("Loading model from:", model_path)

try:
    model = tf.keras.models.load_model(model_path)
    print("Model loaded successfully")
    
    # create dummy image array
    img_array = np.zeros((1, 224, 224, 3))
    
    preprocess_input = tf.keras.applications.mobilenet_v2.preprocess_input
    img_array = preprocess_input(img_array)
    
    predictions = model.predict(img_array)
    class_index = int(np.argmax(predictions[0]))
    confidence = round(float(np.max(predictions[0])) * 100, 2)
    
    print(f"Prediction success! Class: {class_index}, Conf: {confidence}")
except Exception as e:
    import traceback
    traceback.print_exc()
