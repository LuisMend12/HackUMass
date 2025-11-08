# Webcam Garbage Detection Setup Guide

This guide explains how to use the webcam detection system with the Smart Bin dashboard.

## Overview

The webcam detection system uses a pre-trained Keras model from the [smart-waste repository](https://github.com/ziyi-zhu/smart-waste) to classify garbage items into two categories:
- **ORGANIC** (class 0): Food waste, organic materials
- **RECYCLABLE** (class 1): Plastic, glass, metal, cardboard, paper

## Prerequisites

1. **Python 3.7+** installed
2. **Webcam** connected to your computer
3. **Model file**: `model5.h5` (already copied to this directory)

## Installation

1. **Install required Python packages:**
   ```bash
   pip install -r requirements.txt
   ```

   Or install individually:
   ```bash
   pip install opencv-python tensorflow keras numpy Pillow requests flask flask-cors flask-socketio
   ```

2. **Verify model file exists:**
   - Check that `model5.h5` is in the `smart-bin/Login & Homepage/` directory
   - If missing, it should have been copied from `smart-waste/python/camera/model5.h5`

## Usage

### Method 1: Manual Testing (Simplest)

1. **Start the web development server:**
   ```bash
   cd "smart-bin/Login & Homepage"
   python -m http.server 8000
   ```

2. **Open the dashboard in your browser:**
   - Navigate to `http://localhost:8000/monitoring.html`
   - Open browser console (F12)

3. **Run the webcam detection script:**
   ```bash
   cd "smart-bin/Login & Homepage"
   python webcam_detection.py
   ```

4. **Controls:**
   - Press **SPACEBAR** to capture and classify the current frame
   - Press **'c'** to toggle continuous detection mode (auto-detects every 30 frames)
   - Press **'q'** to quit

5. **When an item is detected:**
   - The script will print the item data and a JavaScript command
   - Copy the `window.processNewItem(...)` command from the console output
   - Paste it into the browser console on the monitoring page
   - The dashboard will automatically update with the new item!

### Method 2: Automatic Integration (Recommended)

1. **Start the Flask server** (in one terminal):
   ```bash
   cd "smart-bin/Login & Homepage"
   python webcam_server.py
   ```
   The server will run on `http://localhost:5000`

2. **Start the web development server** (in another terminal):
   ```bash
   cd "smart-bin/Login & Homepage"
   python -m http.server 8000
   ```

3. **Open the dashboard in your browser:**
   - Navigate to `http://localhost:8000/monitoring.html`
   - The page will automatically connect to the Flask server via WebSocket

4. **Update webcam_detection.py:**
   - Open `webcam_detection.py`
   - Change `USE_SERVER = False` to `USE_SERVER = True` (line 32)

5. **Run the webcam detection script:**
   ```bash
   python webcam_detection.py
   ```

6. **Detect items:**
   - Press **SPACEBAR** to capture and classify
   - Press **'c'** for continuous mode
   - Items will automatically appear on the dashboard!

## How It Works

1. **Webcam captures frame** → OpenCV reads from your webcam
2. **Model classifies frame** → Keras model predicts ORGANIC (0) or RECYCLABLE (1)
3. **Data is formatted** → Item data is structured with type, class, bin ID, weight, etc.
4. **Sent to dashboard** → Either via manual console command or automatic WebSocket
5. **Dashboard updates** → Notification popup appears, stats update, pie chart updates

## Item Classification

The model outputs:
- **0** = ORGANIC → Mapped to "Food Waste" class
- **1** = RECYCLABLE → Mapped to one of: Plastic, Glass, Metal, Cardboard, Paper

For recyclable items, the script randomly assigns a specific type (e.g., "Plastic Bottle", "Aluminum Can") for demonstration purposes. In production, you would use a more sophisticated model that can classify specific item types.

## Troubleshooting

### "Model file not found"
- Make sure `model5.h5` is in the same directory as `webcam_detection.py`
- If missing, copy it from `smart-waste/python/camera/model5.h5`

### "Could not open webcam"
- Check that your webcam is connected and not being used by another application
- Try changing `cv2.VideoCapture(0)` to `cv2.VideoCapture(1)` in the script

### "TensorFlow/Keras errors"
- Make sure TensorFlow and Keras are installed: `pip install tensorflow keras`
- Some versions may have compatibility issues - try: `pip install tensorflow==2.10.0 keras==2.10.0`

### "WebSocket connection failed"
- Make sure `webcam_server.py` is running on port 5000
- Check that no firewall is blocking the connection
- The dashboard will still work without the server (use Method 1 instead)

### "Module not found"
- Install missing packages: `pip install <package-name>`
- Or install all requirements: `pip install -r requirements.txt`

## Model Information

- **Source**: [ziyi-zhu/smart-waste](https://github.com/ziyi-zhu/smart-waste)
- **Model**: `model5.h5` (Keras/TensorFlow)
- **Input size**: 30x60 pixels
- **Classes**: 2 (ORGANIC, RECYCLABLE)
- **Accuracy**: ~90% (according to repository)

## Next Steps

1. **Improve classification**: Train a model that can classify specific item types (plastic bottle, glass jar, etc.)
2. **Add motion detection**: Only classify when an object is detected in the frame
3. **Save images**: Store captured images for training/analysis
4. **Add weight sensor**: Integrate with actual weight sensors for real weight data
5. **Multiple bins**: Support multiple bin IDs and locations

## Notes

- The model was trained on low-quality camera images, so accuracy may vary with your webcam
- For best results, ensure good lighting and clear view of the item
- The continuous mode detects every 30 frames to avoid overwhelming the system
- Base64 image encoding is used for transmission, which can be large for high-resolution images

