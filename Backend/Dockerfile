# ...existing code...
FROM python:3.12-slim-bookworm

WORKDIR /code

# Apply Debian security updates
RUN apt-get update && apt-get upgrade -y --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

# Run as non-root
RUN useradd -m appuser && chown -R appuser:appuser /code
USER appuser

EXPOSE 8000

# Keep --reload for local dev only
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]