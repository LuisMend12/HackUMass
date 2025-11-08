import imageio.v3 as iio

for frame_count, frame in enumerate(iio.imiter("<video0>")):
    iio.imwrite(f"frame_{frame_count}.jpg", frame)
    if frame_count > 10:
        break