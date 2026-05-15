import os
import cv2
import numpy as np
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

# Load YOLOv11 model
model = YOLO("yolo11n.pt")

# --- CONFIGURATION ---
GATEWAY_URL = "http://localhost:8080/api/sightings/report"
# Static coordinates for the monitoring node (Bandipur Sector)
CAMERA_LAT = 11.6667
CAMERA_LONG = 76.6285

def report_to_gateway(species, confidence):
    """Sends detection data to the Spring Boot Gateway."""
    payload = {
        "species": species,
        "confidence": round(float(confidence), 4),
        "latitude": CAMERA_LAT,
        "longitude": CAMERA_LONG
    }
    try:
        response = requests.post(GATEWAY_URL, json=payload, timeout=5)
        if response.status_code == 200:
            print(f"✅ Reported: {species} ({confidence*100:.1f}%)")
        else:
            print(f"❌ Gateway Error: {response.status_code}")
    except Exception as e:
        print(f"⚠️ Connection Failed: {e}")

@app.route('/vision/detect', methods=['POST'])
def detect_objects():
    if 'image' not in request.files:
        return jsonify({"status": "error", "message": "No image uploaded"}), 400

    try:
        file = request.files['image']
        
        # 1. Use Pillow to open the image (Support for AVIF, WebP, etc.)
        img_pil = Image.open(file.stream).convert('RGB')
        
        # 2. Convert to OpenCV format (BGR) for YOLO processing
        img_np = np.array(img_pil)
        img = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

        # 3. Run AI Inference
        # Lower conf slightly if detections are being missed (e.g., 0.20)
        results = model(img, conf=0.25)
        
        detections = []
        
        # 4. Process Results
        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0])
                label = model.names[cls_id]
                conf = float(box.conf[0])

                # Identify target animals
                # Note: YOLO 'cat' often triggers for leopards/tigers
                targets = ['elephant', 'bear', 'zebra', 'giraffe', 'cat', 'dog']
                
                if label in targets:
                    species_name = "Big Cat (Predator)" if label == 'cat' else label
                    detections.append({
                        "species": species_name, 
                        "confidence": conf,
                        "box": [round(x, 1) for x in box.xyxy[0].tolist()]
                    })
                    
                    # 5. Send to Java Gateway
                    report_to_gateway(species_name, conf)

        return jsonify({
            "status": "success",
            "engine": "YOLOv11-Nano",
            "predator_detected": len(detections) > 0,
            "count": len(detections),
            "detections": detections
        })

    except Exception as e:
        print(f"🛑 Critical Error: {e}")
        return jsonify({"status": "error", "message": "Failed to process image"}), 500

if __name__ == '__main__':
    # Running on port 5001 to avoid conflicts with Gateway (8080)
    app.run(host='0.0.0.0', port=5001, debug=True)