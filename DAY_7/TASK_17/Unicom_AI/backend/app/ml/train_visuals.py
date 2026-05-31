import os
import json
import pickle
import time
import numpy as np
from PIL import Image
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import classification_report, accuracy_score

# Set up paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
MODELS_DIR = os.path.join(BASE_DIR, "models")
ANNOTATIONS_FILE = os.path.join(UPLOAD_DIR, "visual_annotations.json")
MODEL_FILE = os.path.join(MODELS_DIR, "visual_product_detector.pkl")

os.makedirs(MODELS_DIR, exist_ok=True)

def load_visual_dataset():
    """Loads visual assets and their ground truth annotations from visual_annotations.json"""
    if not os.path.exists(ANNOTATIONS_FILE):
        raise FileNotFoundError(f"Annotations file not found: {ANNOTATIONS_FILE}. Please run prepare_visual_dataset.py first.")
        
    with open(ANNOTATIONS_FILE, "r") as f:
        annotations = json.load(f)
        
    features = []
    labels = []
    boxes = []
    
    # Process static images
    print("[ML Visual Trainer] Parsing static image annotations...")
    for file_path, data in annotations["images"].items():
        full_path = os.path.join(BASE_DIR, file_path)
        if not os.path.exists(full_path):
            print(f"  - Warning: file not found {full_path}")
            continue
            
        # Parse first bounding box for classification & localization
        bbox_info = data["bounding_boxes"][0]
        label = bbox_info["label"]
        box = bbox_info["box"]  # [x, y, w, h]
        
        # Load image & extract features
        feat_vector = extract_features(full_path, box)
        features.append(feat_vector)
        labels.append(label)
        boxes.append(box)
        
    # Process video keyframes
    print("[ML Visual Trainer] Parsing video frame annotations...")
    for video_path, data in annotations["videos"].items():
        for keyframe in data["keyframes"]:
            frame_path = keyframe["file_path"]
            full_path = os.path.join(BASE_DIR, frame_path)
            if not os.path.exists(full_path):
                print(f"  - Warning: file not found {full_path}")
                continue
                
            bbox_info = keyframe["bounding_boxes"][0]
            label = bbox_info["label"]
            box = bbox_info["box"]
            
            feat_vector = extract_features(full_path, box)
            features.append(feat_vector)
            labels.append(label)
            boxes.append(box)
            
    return np.array(features), np.array(labels), np.array(boxes)

def extract_features(image_path, bounding_box):
    """
    Extracts high-fidelity computer vision features:
    1. Grayscale spatial intensity (flattened 32x32 resolution).
    2. RGB average color histograms inside the bounding box.
    """
    img = Image.open(image_path)
    
    # Feature 1: Grayscale spatial features
    gray_img = img.convert("L").resize((32, 32))
    spatial_features = np.array(gray_img).flatten() / 255.0  # Normalize to [0, 1]
    
    # Feature 2: Color features inside bounding box
    x, y, w, h = bounding_box
    cropped = img.crop((x, y, x + w, y + h))
    cropped_resized = cropped.resize((16, 16))
    rgb_arr = np.array(cropped_resized)
    
    # Compute average red, green, and blue intensities
    avg_r = np.mean(rgb_arr[:, :, 0]) / 255.0
    avg_g = np.mean(rgb_arr[:, :, 1]) / 255.0
    avg_b = np.mean(rgb_arr[:, :, 2]) / 255.0
    
    # Compute standard deviation for texture variation
    std_r = np.std(rgb_arr[:, :, 0]) / 255.0
    std_g = np.std(rgb_arr[:, :, 1]) / 255.0
    std_b = np.std(rgb_arr[:, :, 2]) / 255.0
    
    color_features = np.array([avg_r, avg_g, avg_b, std_r, std_g, std_b])
    
    # Concatenate features
    return np.concatenate([spatial_features, color_features])

def train_visual_models():
    print("====================================================")
    print("LAUNCHING MLOPS OBJECT DETECTION & CLASSIFICATION TRAINING")
    print("====================================================")
    time.sleep(0.5)
    
    X, y, bboxes = load_visual_dataset()
    print(f"\n[Data Prep] Total samples loaded for training: {len(X)}")
    print(f"[Data Prep] Feature dimensions extracted: {X.shape[1]} descriptors.")
    
    # Perform train/validation split
    X_train, X_val, y_train, y_val, bbox_train, bbox_val = train_test_split(
        X, y, bboxes, test_size=0.2, random_state=42
    )
    
    print(f"[Model Registry] Split parameters: Train={len(X_train)} samples, Validation={len(X_val)} samples.")
    
    # 1. Train Category Classifier
    print("\n[Classifier Fleet] Fitting Random Forest Classifier (n_estimators=100)...")
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    start_time = time.time()
    clf.fit(X_train, y_train)
    clf_time = time.time() - start_time
    print(f"[Classifier Fleet] Trained category classifier in {clf_time:.4f} seconds.")
    
    # Evaluate Classifier
    y_pred = clf.predict(X_val)
    acc = accuracy_score(y_val, y_pred)
    print(f"\n[Evaluation] Global Category Classification Accuracy: {acc * 100:.2f}%")
    print("[Evaluation] Classification Report:")
    print(classification_report(y_val, y_pred, zero_division=0))
    
    # 2. Train Bounding Box Regressor
    print("[Regressor Fleet] Fitting Ridge Multi-Output Bounding Box Regressor...")
    reg = Ridge(alpha=1.0)
    start_time = time.time()
    reg.fit(X_train, bbox_train)
    reg_time = time.time() - start_time
    print(f"[Regressor Fleet] Trained bounding box regressor in {reg_time:.4f} seconds.")
    
    # Evaluate Regressor
    bbox_pred = reg.predict(X_val)
    bbox_mae = np.mean(np.abs(bbox_val - bbox_pred))
    print(f"[Evaluation] Bounding Box Mean Absolute Error (MAE): {bbox_mae:.2f} pixels.")
    
    # Save the multimodal visual models
    model_data = {
        "classifier": clf,
        "regressor": reg,
        "feature_dim": X.shape[1],
        "trained_categories": list(np.unique(y)),
        "accuracy": acc,
        "timestamp": time.time()
    }
    
    print(f"\n[Model Registry] Exporting trained models weights to {MODEL_FILE}...")
    with open(MODEL_FILE, "wb") as f:
        pickle.dump(model_data, f)
        
    print("\n====================================================")
    print("SUCCESSFUL! Visual Product Detector Model Registered.")
    print("====================================================")

if __name__ == "__main__":
    train_visual_models()
