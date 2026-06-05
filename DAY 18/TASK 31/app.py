import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import gradio as gr
from PIL import Image

# Path to save/load model
MODEL_PATH = "mnist_model.keras"

def get_model():
    if os.path.exists(MODEL_PATH):
        print("Loading saved model...")
        return keras.models.load_model(MODEL_PATH)
    else:
        print("Model file not found. Training model...")
        # Load the MNIST dataset
        mnist = keras.datasets.mnist
        (X_train_mnist, y_train_mnist), (X_test_mnist, y_test_mnist) = mnist.load_data()
        
        # Normalize
        X_train_mnist = X_train_mnist / 255.0
        X_test_mnist = X_test_mnist / 255.0
        
        # Build model matching TASK 30
        model = keras.Sequential([
            layers.Input(shape=(28, 28)),
            layers.Flatten(),
            layers.Dense(128, activation="relu"),
            layers.Dense(10, activation="softmax")
        ])
        
        # Compile
        model.compile(loss="sparse_categorical_crossentropy",
                      optimizer="adam",
                      metrics=["accuracy"])
        
        # Fit
        model.fit(X_train_mnist, y_train_mnist, epochs=5, validation_split=0.1)
        
        # Save model
        model.save(MODEL_PATH)
        return model

# Initialize the model
model = get_model()

def predict_digit(image):
    if image is None:
        return {str(i): 0.0 for i in range(10)}
    
    # Gradio Sketchpad returns a dictionary containing 'composite', 'background', 'layers' in v4+
    # or just a numpy array / PIL image.
    img = None
    if isinstance(image, dict):
        # We can extract the composite image
        img = image.get("composite")
        if img is None:
            img = image.get("background")
    else:
        img = image

    if img is None:
        return {str(i): 0.0 for i in range(10)}

    # Convert to PIL Image
    if isinstance(img, np.ndarray):
        img = Image.fromarray(img)
    elif isinstance(img, str):
        img = Image.open(img)
        
    # Preprocess: convert to grayscale and resize to 28x28
    img = img.convert("L").resize((28, 28))
    img_array = np.array(img)
    
    # MNIST images have a black background and white strokes.
    # If the user draws with black ink on a white background, we need to invert it.
    if np.mean(img_array) > 127:
        img_array = 255 - img_array
        
    # Scale to range [0, 1]
    img_array = img_array / 255.0
    img_array = np.expand_dims(img_array, axis=0) # Shape: (1, 28, 28)
    
    # Predict
    prediction = model.predict(img_array)[0]
    
    # Return formatted probabilities
    return {str(i): float(prediction[i]) for i in range(10)}

# Create the Gradio interface
interface = gr.Interface(
    fn=predict_digit,
    inputs=gr.Sketchpad(label="Draw a Digit (0-9)"),
    outputs=gr.Label(num_top_classes=3, label="Predictions"),
    title="MNIST Digit Classifier",
    description="Draw a digit (0-9) on the canvas to see the neural network's prediction. The model is trained on the classic MNIST dataset using Keras/TensorFlow.",
    live=True
)

if __name__ == "__main__":
    interface.launch()
