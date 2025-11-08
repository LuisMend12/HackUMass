"""
Webcam Garbage Detection Script
Integrates with Smart Bin Dashboard

This script uses the smart-waste model to detect and classify garbage items
from your webcam and sends the results to the web dashboard.

Usage:
    python webcam_detection.py

Controls:
    - Press SPACEBAR to capture and classify current frame
    - Press 'q' to quit
    - Press 'c' to continuously detect (auto mode)
"""

import numpy as np
import cv2
import tensorflow as tf
from keras.models import load_model
import base64
import json
from datetime import datetime
import os

# Only import requests if using server mode
try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False
    print("Warning: 'requests' library not found. Install with: pip install requests")

# Model path
MODEL_PATH = 'model5.h5'
DASHBOARD_URL = 'http://localhost:8000/monitoring.html'

# Server configuration (set to True to use Flask server integration)
USE_SERVER = True  # Set to True if running webcam_server.py
SERVER_URL = 'http://localhost:5000/api/item'

# Item class mapping (model outputs 0=ORGANIC, 1=RECYCLABLE)
CLASS_MAPPING = {
    0: {
        'type': 'Organic Waste',
        'class': 'Food Waste',
        'recyclable': False
    },
    1: {
        'type': 'Recyclable Item',
        'class': 'Plastic',  # Default to Plastic, could be improved with better model
        'recyclable': True
    }
}

# Map recyclable items to more specific types
RECYCLABLE_TYPES = [
    'Plastic Bottle',
    'Aluminum Can',
    'Glass Jar',
    'Cardboard Box',
    'Paper',
    'Metal Scrap'
]

def load_detection_model():
    """Load the Keras model for waste classification"""
    if not os.path.exists(MODEL_PATH):
        print(f"ERROR: Model file '{MODEL_PATH}' not found!")
        print("Please make sure model5.h5 is in the same directory as this script.")
        return None
    
    try:
        print(f"Loading model from {MODEL_PATH}...")
        model = load_model(MODEL_PATH)
        print("Model loaded successfully!")
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

def classify_frame(model, frame):
    """
    Classify a frame using the model
    
    Args:
        model: Loaded Keras model
        frame: OpenCV frame (BGR format)
    
    Returns:
        prediction: 0 for ORGANIC, 1 for RECYCLABLE
        confidence: Prediction confidence (if available)
    """
    try:
        # Resize frame to model input size (30x60)
        pic = cv2.resize(frame, (30, 60))
        pic = np.expand_dims(pic, axis=0)
        
        # Predict
        # Note: predict_classes is deprecated in newer Keras versions
        # Using predict and argmax instead
        prediction = model.predict(pic, verbose=0)
        class_id = np.argmax(prediction[0])
        confidence = float(prediction[0][class_id])
        
        return class_id, confidence
    except Exception as e:
        print(f"Error during classification: {e}")
        return None, 0.0

def frame_to_base64(frame):
    """Convert OpenCV frame to base64 encoded string"""
    try:
        # Encode frame as JPEG
        _, buffer = cv2.imencode('.jpg', frame)
        # Convert to base64
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        return img_base64
    except Exception as e:
        print(f"Error encoding frame: {e}")
        return None

def send_to_dashboard(item_data):
    """
    Send detected item data to the web dashboard
    
    Options:
    1. Send via Flask server (if USE_SERVER = True)
    2. Print instructions for manual browser console integration
    """
    print("\n" + "="*60)
    print("ITEM DETECTED!")
    print("="*60)
    print(f"Type: {item_data['type']}")
    print(f"Class: {item_data['class']}")
    print(f"Recyclable: {item_data['recyclable']}")
    print(f"Bin: {item_data['bin']}")
    print(f"Weight: {item_data['weight']}")
    print(f"Time: {item_data['timestamp']}")
    print("="*60)
    
    # Option 1: Send via Flask server
    if USE_SERVER and REQUESTS_AVAILABLE:
        try:
            response = requests.post(SERVER_URL, json=item_data, timeout=2)
            if response.status_code == 200:
                print("✓ Item sent to dashboard server successfully!")
            else:
                print(f"✗ Server returned status {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"✗ Could not connect to server: {e}")
            print("  Make sure webcam_server.py is running on port 5000")
    
    # Option 2: Manual browser console integration
    print("\nTo integrate with dashboard manually:")
    print("1. Open http://localhost:8000/monitoring.html in your browser")
    print("2. Open browser console (F12)")
    print("3. Copy and paste the following command:")
    print(f"\nwindow.processNewItem({json.dumps(item_data, indent=2)})\n")

def main():
    """Main function to run webcam detection"""
    print("="*60)
    print("Smart Bin - Webcam Garbage Detection")
    print("="*60)
    
    # Load model
    model = load_detection_model()
    if model is None:
        return
    
    # Initialize webcam
    print("\nInitializing webcam...")
    cap = cv2.VideoCapture(0)  # Use default webcam (index 0)
    
    if not cap.isOpened():
        print("ERROR: Could not open webcam!")
        return
    
    print("Webcam initialized successfully!")
    print("\nControls:")
    print("  - Press SPACEBAR to capture and classify current frame")
    print("  - Press 'c' to toggle continuous detection mode")
    print("  - Press 'q' to quit")
    print("\nStarting webcam feed...\n")
    
    continuous_mode = False
    frame_count = 0
    detection_interval = 30  # Detect every 30 frames in continuous mode
    
    while True:
        ret, frame = cap.read()
        
        if not ret:
            print("ERROR: Could not read frame from webcam")
            break
        
        # Flip frame horizontally for mirror effect
        frame = cv2.flip(frame, 1)
        
        # Display frame
        display_frame = frame.copy()
        
        # Add instructions on frame
        cv2.putText(display_frame, "Press SPACE to detect | 'c' for auto | 'q' to quit", 
                   (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        
        if continuous_mode:
            cv2.putText(display_frame, "AUTO MODE: ON", 
                       (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            frame_count += 1
            
            # Auto-detect every N frames
            if frame_count >= detection_interval:
                frame_count = 0
                class_id, confidence = classify_frame(model, frame)
                
                if class_id is not None:
                    class_info = CLASS_MAPPING[class_id]
                    
                    # For recyclable items, randomly assign a specific type
                    if class_id == 1:
                        import random
                        item_type = random.choice(RECYCLABLE_TYPES)
                        # Try to map to appropriate class
                        if 'Plastic' in item_type:
                            item_class = 'Plastic'
                        elif 'Glass' in item_type:
                            item_class = 'Glass'
                        elif 'Metal' in item_type or 'Aluminum' in item_type:
                            item_class = 'Metal'
                        elif 'Cardboard' in item_type or 'Paper' in item_type:
                            item_class = 'Paper' if 'Paper' in item_type else 'Cardboard'
                        else:
                            item_class = 'Plastic'
                    else:
                        item_type = class_info['type']
                        item_class = class_info['class']
                    
                    # Create item data
                    item_data = {
                        'type': item_type,
                        'class': item_class,
                        'bin': 'BIN-001',  # Default bin ID
                        'weight': f'{np.random.uniform(0.1, 2.0):.2f} kg',  # Random weight for demo
                        'recyclable': class_info['recyclable'],
                        'image': frame_to_base64(frame),
                        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    }
                    
                    # Display result on frame
                    result_text = f"{item_type} ({item_class}) - {confidence*100:.1f}%"
                    color = (0, 255, 0) if class_info['recyclable'] else (0, 0, 255)
                    cv2.putText(display_frame, result_text, 
                               (10, display_frame.shape[0] - 20), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
                    
                    # Send to dashboard
                    send_to_dashboard(item_data)
        
        cv2.imshow('Smart Bin - Webcam Detection', display_frame)
        
        # Handle key presses
        key = cv2.waitKey(1) & 0xFF
        
        if key == ord('q'):
            print("\nQuitting...")
            break
        elif key == ord('c'):
            continuous_mode = not continuous_mode
            frame_count = 0
            if continuous_mode:
                print("Continuous detection mode: ON")
            else:
                print("Continuous detection mode: OFF")
        elif key == ord(' '):  # Spacebar
            print("\nCapturing and classifying frame...")
            class_id, confidence = classify_frame(model, frame)
            
            if class_id is not None:
                class_info = CLASS_MAPPING[class_id]
                
                # For recyclable items, randomly assign a specific type
                if class_id == 1:
                    import random
                    item_type = random.choice(RECYCLABLE_TYPES)
                    # Map to appropriate class
                    if 'Plastic' in item_type:
                        item_class = 'Plastic'
                    elif 'Glass' in item_type:
                        item_class = 'Glass'
                    elif 'Metal' in item_type or 'Aluminum' in item_type:
                        item_class = 'Metal'
                    elif 'Cardboard' in item_type or 'Paper' in item_type:
                        item_class = 'Paper' if 'Paper' in item_type else 'Cardboard'
                    else:
                        item_class = 'Plastic'
                else:
                    item_type = class_info['type']
                    item_class = class_info['class']
                
                # Create item data
                item_data = {
                    'type': item_type,
                    'class': item_class,
                    'bin': 'BIN-001',
                    'weight': f'{np.random.uniform(0.1, 2.0):.2f} kg',
                    'recyclable': class_info['recyclable'],
                    'image': frame_to_base64(frame),
                    'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }
                
                # Display result on frame
                result_text = f"{item_type} ({item_class}) - {confidence*100:.1f}%"
                color = (0, 255, 0) if class_info['recyclable'] else (0, 0, 255)
                cv2.putText(display_frame, result_text, 
                           (10, display_frame.shape[0] - 20), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
                cv2.imshow('Smart Bin - Webcam Detection', display_frame)
                
                # Send to dashboard
                send_to_dashboard(item_data)
            else:
                print("Classification failed!")
    
    # Cleanup
    cap.release()
    cv2.destroyAllWindows()
    print("\nWebcam detection stopped.")

if __name__ == "__main__":
    main()

