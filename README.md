# HackUMass

# Smart Bin — HackUMass 2025

A hackathon prototype for real-time waste detection and sorting using computer vision, Arduino, and a web dashboard.

---

## Overview

**Smart Bin** is an end-to-end system that classifies waste in real-time, actuates hardware to sort it, and provides a web-based interface for monitoring and control. It demonstrates edge-to-cloud integration with AI models, embedded hardware, and a responsive UI.

---

## Key Features

- **Real-time waste classification**: Detects categories like recyclable, compost, and landfill.
- **Lightweight CNN model**: Trained with TensorFlow/Keras; GPU-compatible.
- **Edge inference**: Runs on Raspberry Pi or other lightweight devices.
- **Arduino integration**: Controls servo/motor for automated bin sorting.
- **Web dashboard**: Monitor camera feed, see classification results, and view system logs.
- **Data pipeline**: Utilities for dataset preparation and augmentation.
- **Reproducible deployment**: Dockerfile/scripts for easy setup.

---

## Tech Stack

- **Backend/Model Training**: Python, TensorFlow/Keras, OpenCV
- **Hardware**: Arduino, Raspberry Pi (camera input)
- **Frontend**: HTML/CSS/JavaScript (Tailwind optional), React (optional)
- **DevOps**: Docker

---

## Quick Start

### Local Setup
```bash
# create a virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows

# install dependencies
pip install -r requirements.txt

# run inference server
python src/inference_server.py --model models/smartbin_v1.h5 --camera 0

# access web UI
# Open http://localhost:3000 in your browser
# Smart Bin — HackUMass 2025
```

A hackathon prototype for real-time waste detection and sorting using computer vision, Arduino, and a web dashboard.

---

## Overview

**Smart Bin** is an end-to-end system that classifies waste in real-time, actuates hardware to sort it, and provides a web-based interface for monitoring and control. It demonstrates edge-to-cloud integration with AI models, embedded hardware, and a responsive UI.

---

## Key Features

- **Real-time waste classification**: Detects categories like recyclable, compost, and landfill.
- **Lightweight CNN model**: Trained with TensorFlow/Keras; GPU-compatible.
- **Edge inference**: Runs on Raspberry Pi or other lightweight devices.
- **Arduino integration**: Controls servo/motor for automated bin sorting.
- **Web dashboard**: Monitor camera feed, see classification results, and view system logs.
- **Data pipeline**: Utilities for dataset preparation and augmentation.
- **Reproducible deployment**: Dockerfile/scripts for easy setup.

---

## Tech Stack

- **Backend/Model Training**: Python, TensorFlow/Keras, OpenCV
- **Hardware**: Arduino, Raspberry Pi (camera input)
- **Frontend**: HTML/CSS/JavaScript (Tailwind optional), React (optional)
- **DevOps**: Docker

---

## Quick Start

### Local Setup
```bash
# create a virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows

# install dependencies
pip install -r requirements.txt

# run inference server
python src/inference_server.py --model models/smartbin_v1.h5 --camera 0

# access web UI
# Open http://localhost:3000 in your browser
