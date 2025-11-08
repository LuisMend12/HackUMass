import cv2
import os

# Create a folder to save frames
output_dir = "frames"
os.makedirs(output_dir, exist_ok=True)

# Initialize webcam (0 = default camera)
cap = cv2.VideoCapture(0)

# Frame counter
count = 0

print("Press 's' to save a frame, or 'q' to quit.")

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to capture frame. Exiting...")
        break

    # Show the webcam feed
    cv2.imshow("Webcam", frame)

    # Wait for a key press
    key = cv2.waitKey(1) & 0xFF

    # 's' to save the current frame
    if key == ord('s'):
        filename = os.path.join(output_dir, f"frame_{count:04d}.jpg")
        cv2.imwrite(filename, frame)
        print(f"Saved {filename}")
        count += 1

    # 'q' to quit
    elif key == ord('q'):
        print("Exiting...")
        break

# Release resources
cap.release()
cv2.destroyAllWindows()
