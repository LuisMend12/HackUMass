"""
Simple Flask Server for Webcam Detection Integration
Receives data from webcam_detection.py and broadcasts to web dashboard

Usage:
    python webcam_server.py

Then run webcam_detection.py with SERVER_MODE = True
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
socketio = SocketIO(app, cors_allowed_origins="*")

# Store latest item data
latest_item = None

@app.route('/api/item', methods=['POST'])
def receive_item():
    """Receive item data from webcam detection script"""
    global latest_item
    
    try:
        item_data = request.json
        latest_item = item_data
        
        # Broadcast to all connected clients via WebSocket
        socketio.emit('new_item', item_data)
        
        print(f"Received item: {item_data.get('type')} ({item_data.get('class')})")
        return jsonify({'status': 'success', 'message': 'Item received'}), 200
    except Exception as e:
        print(f"Error receiving item: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/latest', methods=['GET'])
def get_latest():
    """Get latest item data (for polling)"""
    return jsonify(latest_item) if latest_item else jsonify({'status': 'no_data'}), 200

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print("Client connected")
    if latest_item:
        emit('new_item', latest_item)

if __name__ == '__main__':
    print("="*60)
    print("Smart Bin - Webcam Detection Server")
    print("="*60)
    print("Server starting on http://localhost:5000")
    print("Make sure webcam_detection.py is configured to send data here")
    print("="*60)
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)

