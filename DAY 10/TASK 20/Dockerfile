FROM ultralytics/ultralytics:latest-cpu

# Set the working directory
WORKDIR /app

# The ultralytics image already has most dependencies! 
# We just need to ensure ONNX is available
RUN pip install --no-cache-dir onnx onnxruntime opencv-python-headless

# Copy the model, script, and image into the container
COPY . .

# Expose the port
EXPOSE 8080

# Run the prediction script when the container launches
CMD ["python", "predict.py"]
