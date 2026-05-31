import cv2
from ultralytics import YOLO

def predict_image(model_path, image_path, output_path="prediction_result.jpg"):
    print(f"Loading model from {model_path}...")
    model = YOLO(model_path)
    
    print(f"Running prediction on {image_path}...")
    results = model.predict(source=image_path, save=False)
    
    result = results[0]
    
    boxes = result.boxes
    if len(boxes) > 0:
        for i, box in enumerate(boxes):
            class_id = int(box.cls[0].item())
            class_name = result.names[class_id]
            confidence = box.conf[0].item()
            print(f"Detection {i+1}: Found '{class_name}' with a confidence score of {confidence:.2%}")
    else:
        print("No objects detected.")
    
    annotated_image = result.plot()
    
    cv2.imwrite(output_path, annotated_image)
    print(f"Prediction complete! Annotated image saved to {output_path}")

if __name__ == "__main__":
    MODEL_PATH = "best.onnx"
    IMAGE_PATH = "stux-running-shoe-371625_1920.jpg"
    
    predict_image(MODEL_PATH, IMAGE_PATH)
