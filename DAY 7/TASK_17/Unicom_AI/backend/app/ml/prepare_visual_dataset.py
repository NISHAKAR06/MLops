import os
import json
import random
from PIL import Image, ImageDraw, ImageFont

# Set up paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
IMAGES_DIR = os.path.join(UPLOAD_DIR, "images")
VIDEOS_DIR = os.path.join(UPLOAD_DIR, "videos")
ANNOTATIONS_FILE = os.path.join(UPLOAD_DIR, "visual_annotations.json")

# Ensure directories exist
os.makedirs(IMAGES_DIR, exist_ok=True)
os.makedirs(VIDEOS_DIR, exist_ok=True)

print(f"[Dataset Preparation] Target directories created:")
print(f"  - Images: {IMAGES_DIR}")
print(f"  - Videos: {VIDEOS_DIR}")

# Categories and their visual features
CATEGORIES = {
    "Saree": {
        "bg_color": (139, 0, 0),  # Dark Red
        "accent_color": (212, 175, 55),  # Gold
        "ocr_text": "100% PURE SILK",
        "aspect": (300, 400),
        "shape": "rectangle"
    },
    "Cream": {
        "bg_color": (224, 255, 255),  # Light Cyan
        "accent_color": (46, 139, 87),  # Sea Green
        "ocr_text": "ORGANIC CREAM SPF 30",
        "aspect": (300, 300),
        "shape": "circle"
    },
    "Smartphone": {
        "bg_color": (30, 30, 30),  # Sleek Charcoal
        "accent_color": (99, 102, 241),  # Indigo Glow
        "ocr_text": "SMARTPHONE 5G",
        "aspect": (250, 450),
        "shape": "phone"
    },
    "Water Bottle": {
        "bg_color": (192, 192, 192),  # Metallic Silver
        "accent_color": (220, 20, 60),  # Crimson Red
        "ocr_text": "STAINLESS BOTTLE 750ml",
        "aspect": (200, 450),
        "shape": "cylinder"
    }
}

def draw_saree(draw, size, bg, gold):
    # Draw dark red saree body
    draw.rectangle([20, 20, size[0]-20, size[1]-20], fill=bg, outline=gold, width=4)
    # Draw golden zari borders
    draw.rectangle([30, 30, size[0]-30, 60], fill=gold)
    draw.rectangle([30, size[1]-60, size[0]-30, size[1]-30], fill=gold)
    # Draw geometric pattern details
    for i in range(40, size[0]-40, 30):
        draw.line([i, 80, i+15, 110], fill=gold, width=2)
        draw.line([i+15, 110, i+30, 80], fill=gold, width=2)

def draw_cream(draw, size, bg, green):
    # Draw soft round cosmetic cream jar
    draw.ellipse([30, 50, size[0]-30, size[1]-30], fill=bg, outline=green, width=3)
    # Draw jar cap
    draw.rectangle([50, 20, size[0]-50, 55], fill=green, outline=(255,255,255), width=2)
    # Draw brand lines
    draw.line([60, size[1]//2, size[0]-60, size[1]//2], fill=green, width=3)

def draw_phone(draw, size, bg, indigo):
    # Draw sleek dark smartphone chassis
    draw.rectangle([20, 20, size[0]-20, size[1]-20], fill=bg, outline=(100, 100, 100), width=3)
    # Draw screen bezel glow
    draw.rectangle([26, 26, size[0]-26, size[1]-26], fill=None, outline=indigo, width=2)
    # Camera module bump
    draw.rectangle([40, 40, 110, 110], fill=(15, 15, 15), outline=(50, 50, 50), width=1)
    # Camera lenses
    draw.ellipse([50, 50, 70, 70], fill=(0, 255, 255))
    draw.ellipse([80, 80, 100, 100], fill=(255, 0, 255))

def draw_cylinder(draw, size, bg, red):
    # Draw silver metallic bottle body
    draw.rectangle([40, 100, size[0]-40, size[1]-40], fill=bg, outline=(120, 120, 120), width=3)
    # Draw round neck contour
    draw.rectangle([70, 40, size[0]-70, 100], fill=bg, outline=(120, 120, 120), width=2)
    # Draw crimson red cap
    draw.rectangle([65, 15, size[0]-65, 40], fill=red)
    # Grippy rubber strip
    draw.rectangle([40, 220, size[0]-40, 250], fill=red)

def generate_product_visual(category_name, filename, is_video_frame=False, frame_index=0, total_frames=5):
    cat = CATEGORIES[category_name]
    aspect = cat["aspect"]
    canvas_size = (640, 640)
    
    # Create empty canvas with studio-gray background
    image = Image.new("RGB", canvas_size, (245, 245, 247))
    draw = ImageDraw.Draw(image)
    
    # Draw soft shadow backdrops
    draw.ellipse([120, 500, 520, 560], fill=(225, 225, 228))

    # Calculate translation for video panning simulation
    offset_x = 0
    offset_y = 0
    scale = 1.0
    
    if is_video_frame:
        # Simulate video movement (rotate, zoom, pan)
        progress = frame_index / (total_frames - 1)
        offset_x = int(30 * math_sin(progress * 6.28))
        offset_y = int(20 * math_cos(progress * 6.28))
        scale = 0.95 + 0.1 * math_sin(progress * 3.14)
        
    # Scale aspect dimensions
    w = int(aspect[0] * scale)
    h = int(aspect[1] * scale)
    
    # Position product in the center
    x1 = (canvas_size[0] - w) // 2 + offset_x
    y1 = (canvas_size[1] - h) // 2 + offset_y
    x2 = x1 + w
    y2 = y1 + h
    
    # Create localized coordinate context
    prod_image = Image.new("RGB", (w, h), (245, 245, 247))
    prod_draw = ImageDraw.Draw(prod_image)
    
    if cat["shape"] == "rectangle":
        draw_saree(prod_draw, (w, h), cat["bg_color"], cat["accent_color"])
    elif cat["shape"] == "circle":
        draw_cream(prod_draw, (w, h), cat["bg_color"], cat["accent_color"])
    elif cat["shape"] == "phone":
        draw_phone(prod_draw, (w, h), cat["bg_color"], cat["accent_color"])
    elif cat["shape"] == "cylinder":
        draw_cylinder(prod_draw, (w, h), cat["bg_color"], cat["accent_color"])
        
    # Overlay text OCR details onto the product image
    # Use basic drawing line as text fallback if high-quality fonts aren't available
    label_y = h - 110 if h > 200 else h // 2
    prod_draw.rectangle([10, label_y, w-10, label_y + 35], fill=(255, 255, 255, 200))
    
    # Draw simple baseline indicator lines representing typography if necessary
    prod_draw.text((20, label_y + 8), cat["ocr_text"], fill=(0, 0, 0))

    # Paste onto canvas
    image.paste(prod_image, (x1, y1))
    
    # Add beautiful borders/decorations (simulating professional lighting)
    draw.rectangle([0, 0, canvas_size[0]-1, canvas_size[1]-1], fill=None, outline=(220, 220, 224), width=1)
    
    # Save the file
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    image.save(filename, "PNG")
    
    # Return spatial coordinates for YOLO annotations
    return {
        "box": [x1, y1, x2 - x1, y2 - y1],
        "category": category_name,
        "ocr_tag": cat["ocr_text"]
    }

def math_sin(x):
    # High fidelity Taylor expansion of sine for fast, code-only math logic
    return x - (x**3)/6.0 + (x**5)/120.0 - (x**7)/5040.0

def math_cos(x):
    return 1.0 - (x**2)/2.0 + (x**4)/24.0 - (x**6)/720.0

# 1. Generate Static Images
print("[Dataset Preparation] Synthesizing static catalog images...")
annotations = {
    "images": {},
    "videos": {}
}

for name in CATEGORIES.keys():
    for idx in range(1, 3):  # 2 images per category
        img_name = f"product_{name.lower().replace(' ', '_')}_{idx}.png"
        full_path = os.path.join(IMAGES_DIR, img_name)
        relative_path = f"uploads/images/{img_name}"
        
        meta = generate_product_visual(name, full_path, is_video_frame=False)
        annotations["images"][relative_path] = {
            "bounding_boxes": [
                {
                    "label": name,
                    "box": meta["box"],
                    "confidence": 0.98
                }
            ],
            "ocr_results": [
                {
                    "text": meta["ocr_tag"],
                    "box": [meta["box"][0] + 20, meta["box"][1] + meta["box"][3] - 100, meta["box"][2] - 40, 30]
                }
            ]
        }
        print(f"  - Wrote static image: {relative_path} with label '{name}'")

# 2. Generate Video Frame Sequences (Simulating raw commercial clips)
print("\n[Dataset Preparation] Synthesizing panning video keyframes...")
for name in CATEGORIES.keys():
    vid_slug = f"{name.lower().replace(' ', '_')}_commercial"
    vid_folder = os.path.join(VIDEOS_DIR, vid_slug)
    os.makedirs(vid_folder, exist_ok=True)
    
    total_frames = 5
    video_frames_meta = []
    
    for f_idx in range(total_frames):
        frame_name = f"frame_{f_idx}.png"
        full_path = os.path.join(vid_folder, frame_name)
        relative_path = f"uploads/videos/{vid_slug}/{frame_name}"
        
        meta = generate_product_visual(name, full_path, is_video_frame=True, frame_index=f_idx, total_frames=total_frames)
        
        frame_annotation = {
            "frame_index": f_idx,
            "timestamp": f"0:0{f_idx * 3}",  # 0:00, 0:03, 0:06, 0:09, 0:12
            "file_path": relative_path,
            "bounding_boxes": [
                {
                    "label": name,
                    "box": meta["box"],
                    "confidence": 0.95
                }
            ],
            "ocr_results": [
                {
                    "text": meta["ocr_tag"],
                    "box": [meta["box"][0] + 20, meta["box"][1] + meta["box"][3] - 100, meta["box"][2] - 40, 30]
                }
            ]
        }
        video_frames_meta.append(frame_annotation)
        
    # Store complete video annotation slug reference
    annotations["videos"][f"uploads/videos/{vid_slug}.mp4"] = {
        "product_category": name,
        "total_duration_sec": 15,
        "keyframes": video_frames_meta
    }
    print(f"  - Generated video frame sequence folder: uploads/videos/{vid_slug}/ ({total_frames} frames)")

# Write visual annotations JSON file
with open(ANNOTATIONS_FILE, "w") as f:
    json.dump(annotations, f, indent=4)

print(f"\n[Dataset Preparation] SUCCESS: Dataset generated and mapped successfully.")
print(f"  - Total Static Images: {len(annotations['images'])}")
print(f"  - Total Videos: {len(annotations['videos'])}")
print(f"  - Annotations JSON committed to: {ANNOTATIONS_FILE}")
