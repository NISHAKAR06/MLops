FROM ultralytics/ultralytics:latest-cpu

# Set the working directory
WORKDIR /app

# ── Step 1: Install Flask + ONNX dependencies ────────────────────────────────
RUN pip install --no-cache-dir flask werkzeug onnx onnxruntime opencv-python-headless

# ── Step 2: Copy the ML model into the image ─────────────────────────────────
COPY best.onnx ./best.onnx

# ── Step 3: Copy application code and templates ──────────────────────────────
COPY app.py ./app.py
COPY requirements.txt ./requirements.txt
COPY templates/ ./templates/

# ── Step 4: Create uploads folder (for temp image processing) ────────────────
RUN mkdir -p /app/uploads

# ── Step 5: Expose Flask port ─────────────────────────────────────────────────
EXPOSE 8080

# ── Step 6: Healthcheck ───────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# ── Step 7: Run the Flask web app ─────────────────────────────────────────────
CMD ["python", "app.py"]
