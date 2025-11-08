# Hardware Integration Guide
## Raspberry Pi to Web Dashboard Communication

This guide explains how to connect your Raspberry Pi hardware to this web dashboard.

---

## Overview

The web dashboard is designed to receive data from Raspberry Pi devices. When an item is detected by the hardware (camera, sensors, etc.), the Pi should send that data to the web application, which will automatically:
- Show a notification popup
- Update dashboard statistics
- Update the pie chart by item class
- Save data to localStorage

---

## Integration Methods

There are **three main approaches** for Raspberry Pi to communicate with this web app:

### 1. **REST API (Recommended for Production)**

The Raspberry Pi sends HTTP POST requests to a backend server, which then updates the web dashboard.

#### Architecture:
```
Raspberry Pi → Backend Server (Node.js/Python) → Web Dashboard
```

#### Raspberry Pi Code Example (Python):
```python
import requests
import json
import base64
from datetime import datetime

def send_item_to_dashboard(item_data):
    """
    Send detected item data to the backend server
    
    Args:
        item_data: Dictionary containing:
            - type: Item type (e.g., "Plastic Bottle")
            - class: Item class (e.g., "Plastic", "Glass", "Metal")
            - bin: Bin ID (e.g., "BIN-001")
            - weight: Weight in kg (e.g., "0.5 kg")
            - recyclable: Boolean
            - image: Base64 encoded image or image path
    """
    # Backend server URL
    backend_url = "http://your-server.com/api/items"
    
    # Prepare data
    payload = {
        "type": item_data.get("type"),
        "class": item_data.get("class"),
        "bin": item_data.get("bin"),
        "weight": item_data.get("weight"),
        "recyclable": item_data.get("recyclable", True),
        "timestamp": datetime.now().isoformat(),
        "image": item_data.get("image")  # Base64 or URL
    }
    
    # Send POST request
    try:
        response = requests.post(backend_url, json=payload)
        if response.status_code == 200:
            print("Item data sent successfully!")
        else:
            print(f"Error: {response.status_code}")
    except Exception as e:
        print(f"Failed to send data: {e}")

# Example usage when item is detected
item = {
    "type": "Plastic Bottle",
    "class": "Plastic",
    "bin": "BIN-001",
    "weight": "0.5 kg",
    "recyclable": True,
    "image": "base64_encoded_image_data"
}

send_item_to_dashboard(item)
```

#### Backend Server Example (Node.js/Express):
```javascript
// server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.json());

// Endpoint to receive data from Raspberry Pi
app.post('/api/items', (req, res) => {
    const itemData = req.body;
    
    // Broadcast to all connected web clients
    io.emit('newItem', itemData);
    
    res.json({ success: true, message: 'Item received' });
});

http.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

#### Web Dashboard Code (Add to monitoring.js):
```javascript
// Add this to monitoring.js after initNotificationSystem()

// Connect to backend server via WebSocket
const socket = io('http://your-server.com');

// Listen for new items from Raspberry Pi
socket.on('newItem', (itemData) => {
    // Process the item (this function already exists!)
    if (window.processNewItem) {
        window.processNewItem(itemData);
    }
});
```

---

### 2. **WebSocket Direct Connection (For Development/Testing)**

Raspberry Pi connects directly to the web dashboard via WebSocket.

#### Raspberry Pi Code (Python with websocket-client):
```python
import websocket
import json
import base64

def on_message(ws, message):
    print(f"Received: {message}")

def on_error(ws, error):
    print(f"Error: {error}")

def on_close(ws):
    print("Connection closed")

def on_open(ws):
    print("Connected to dashboard")
    
    # Send item data when detected
    item_data = {
        "type": "Plastic Bottle",
        "class": "Plastic",
        "bin": "BIN-001",
        "weight": "0.5 kg",
        "recyclable": True,
        "image": "base64_encoded_image"
    }
    
    ws.send(json.dumps({
        "event": "newItem",
        "data": item_data
    }))

# Connect to WebSocket server
ws = websocket.WebSocketApp("ws://your-server.com:8080",
                            on_message=on_message,
                            on_error=on_error,
                            on_close=on_close)
ws.on_open = on_open
ws.run_forever()
```

#### Web Dashboard Code (Add to monitoring.js):
```javascript
// WebSocket connection
const ws = new WebSocket('ws://your-server.com:8080');

ws.onopen = () => {
    console.log('Connected to hardware');
};

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    
    if (message.event === 'newItem') {
        // Process the item
        if (window.processNewItem) {
            window.processNewItem(message.data);
        }
    }
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};
```

---

### 3. **MQTT (For IoT Networks)**

Use MQTT broker for communication (good for multiple Raspberry Pi devices).

#### Raspberry Pi Code (Python with paho-mqtt):
```python
import paho.mqtt.client as mqtt
import json
import base64

# MQTT broker settings
MQTT_BROKER = "your-mqtt-broker.com"
MQTT_PORT = 1883
MQTT_TOPIC = "smart-bin/items"

def on_connect(client, userdata, flags, rc):
    print(f"Connected to MQTT broker with code {rc}")

def send_item_via_mqtt(item_data):
    client = mqtt.Client()
    client.on_connect = on_connect
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    
    # Publish item data
    payload = json.dumps(item_data)
    client.publish(MQTT_TOPIC, payload)
    client.disconnect()

# Example usage
item = {
    "type": "Plastic Bottle",
    "class": "Plastic",
    "bin": "BIN-001",
    "weight": "0.5 kg",
    "recyclable": True,
    "image": "base64_encoded_image"
}

send_item_via_mqtt(item)
```

#### Web Dashboard Code (Add to monitoring.js):
```javascript
// MQTT client (using MQTT.js library)
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://your-mqtt-broker.com');

client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe('smart-bin/items');
});

client.on('message', (topic, message) => {
    const itemData = JSON.parse(message.toString());
    
    // Process the item
    if (window.processNewItem) {
        window.processNewItem(itemData);
    }
});
```

---

## Data Format

The Raspberry Pi should send data in this format:

```json
{
    "type": "Plastic Bottle",        // Full item type name
    "class": "Plastic",              // Item class (for pie chart)
    "bin": "BIN-001",                // Bin identifier
    "weight": "0.5 kg",              // Weight as string
    "recyclable": true,              // Boolean
    "image": "base64_image_data"    // Base64 encoded image or URL
}
```

**Required Fields:**
- `type`: Item type (e.g., "Plastic Bottle", "Glass Jar")
- `class`: Item class - MUST be one of: "Plastic", "Glass", "Cardboard", "Metal", "Food Waste", "Paper", or "Other"
- `bin`: Bin ID (e.g., "BIN-001")
- `weight`: Weight as string (e.g., "0.5 kg")
- `recyclable`: Boolean indicating if item is recyclable
- `image`: Base64 encoded image string or image URL

---

## Quick Integration Steps

1. **Choose your integration method** (REST API recommended)

2. **Set up backend server** (if using REST API or WebSocket)

3. **Update web dashboard** to listen for hardware events:
   - Add WebSocket/Socket.io client code to `monitoring.js`
   - The `window.processNewItem()` function is already exposed and ready to use!

4. **Test the connection**:
   - Send test data from Raspberry Pi
   - Verify notification appears on dashboard
   - Check that stats and pie chart update

---

## Example: Complete Integration

### Step 1: Add to monitoring.html (before closing body tag)
```html
<!-- Add Socket.io client library -->
<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
```

### Step 2: Add to monitoring.js (after initNotificationSystem call)
```javascript
// Hardware Integration - WebSocket Connection
if (currentPage.includes('monitoring.html')) {
    // Connect to backend server
    const socket = io('http://localhost:3000'); // Change to your server URL
    
    // Listen for new items from Raspberry Pi
    socket.on('newItem', (itemData) => {
        console.log('New item received from hardware:', itemData);
        
        // Process the item - this function is already set up!
        if (window.processNewItem) {
            window.processNewItem(itemData);
        }
    });
    
    socket.on('connect', () => {
        console.log('Connected to hardware server');
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from hardware server');
    });
}
```

### Step 3: Raspberry Pi sends data
```python
# When item is detected
item_data = {
    "type": detected_item_type,
    "class": detected_item_class,
    "bin": bin_id,
    "weight": f"{weight} kg",
    "recyclable": is_recyclable,
    "image": base64_image
}

# Send via your chosen method (REST API, WebSocket, or MQTT)
```

---

## Testing Without Hardware

The dashboard currently uses simulation mode. To test with real hardware:

1. Remove or comment out the demo simulation code in `monitoring.js` (marked with "DEMO SIMULATION")
2. Connect your Raspberry Pi using one of the methods above
3. The `window.processNewItem()` function will automatically handle everything!

---

## Troubleshooting

**Notification not appearing?**
- Check browser console for errors
- Verify `window.processNewItem` is defined
- Ensure data format matches expected structure

**Pie chart not updating?**
- Verify `class` field is provided and matches one of the predefined classes
- Check browser console for JavaScript errors

**Connection issues?**
- Verify backend server is running
- Check network connectivity
- Ensure CORS is properly configured on backend

---

## Notes

- The `window.processNewItem()` function is globally available and can be called from anywhere
- All data is automatically saved to localStorage
- The system handles all UI updates automatically
- No need to manually update charts or stats - it's all automatic!

