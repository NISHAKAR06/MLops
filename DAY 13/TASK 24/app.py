import os
import cv2
import base64
import numpy as np
from flask import Flask, request, jsonify, render_template
from ultralytics import YOLO
from werkzeug.utils import secure_filename

app = Flask(__name__)

# ── Config ──────────────────────────────────────────────────────────────────
MODEL_PATH   = "best.onnx"
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Load model once at startup
print(f"Loading YOLO model from {MODEL_PATH}...")
model = YOLO(MODEL_PATH)
print("Model loaded successfully!")


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type. Please upload a JPG, PNG, or WEBP image."}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    # Run YOLO prediction
    results = model.predict(source=filepath, save=False)
    result  = results[0]

    # Collect detections
    detections = []
    boxes = result.boxes
    if len(boxes) > 0:
        for i, box in enumerate(boxes):
            class_id   = int(box.cls[0].item())
            class_name = result.names[class_id]
            confidence = box.conf[0].item()
            detections.append({
                "id":         i + 1,
                "class":      class_name,
                "confidence": f"{confidence:.2%}"
            })

    # Annotate image and encode as base64 for browser display
    annotated = result.plot()
    _, buffer  = cv2.imencode(".jpg", annotated)
    img_b64    = base64.b64encode(buffer).decode("utf-8")

    # Clean up uploaded file
    os.remove(filepath)

    return jsonify({
        "detections":      detections,
        "annotated_image": img_b64,
        "total":           len(detections)
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
