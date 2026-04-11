# Server Deployment Guide

Production deployment of llama.cpp server with OpenAI-compatible API.

## Server Modes

### llama-server

```bash
# Basic server
./llama-server \
    -m models/llama-2-7b-chat.Q4_K_M.gguf \
    --host 0.0.0.0 \
    --port 8080 \
    -c 4096  # Context size

# With GPU acceleration
./llama-server \
    -m models/llama-2-70b.Q4_K_M.gguf \
    -ngl 40  # Offload 40 layers to GPU
```

## OpenAI-Compatible API

### Chat completions
```bash
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-2",
    "messages": [
      {"role": "system", "content": "You are helpful"},
      {"role": "user", "content": "Hello"}
    ],
    "temperature": 0.7,
    "max_tokens": 100
  }'
```

### Streaming
```bash
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-2",
    "messages": [{"role": "user", "content": "Count to 10"}],
    "stream": true
  }'
```

## Docker Deployment

**Dockerfile**:
```dockerfile
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y git build-essential
RUN git clone https://github.com/ggerganov/llama.cpp
WORKDIR /llama.cpp
RUN make LLAMA_CUDA=1
COPY models/ /models/
EXPOSE 8080
CMD ["./llama-server", "-m", "/models/model.gguf", "--host", "0.0.0.0", "--port", "8080"]
```

**Run**:
```bash
docker run --gpus all -p 8080:8080 llama-cpp:latest
```

## Monitoring

```bash
# Server metrics endpoint
curl http://localhost:8080/metrics

# Health check
curl http://localhost:8080/health
```

**Metrics**:
- requests_total
- tokens_generated
- prompt_tokens
- completion_tokens
- kv_cache_tokens

## Load Balancing

**NGINX**:
```nginx
upstream llama_cpp {
    server llama1:8080;
    server llama2:8080;
}

server {
    location / {
        proxy_pass http://llama_cpp;
        proxy_read_timeout 300s;
    }
}
```

## Performance Tuning

**Parallel requests**:
```bash
./llama-server \
    -m model.gguf \
    -np 4  # 4 parallel slots
```

**Continuous batching**:
```bash
./llama-server \
    -m model.gguf \
    --cont-batching  # Enable continuous batching
```

**Context caching**:
```bash
./llama-server \
    -m model.gguf \
    --cache-prompt  # Cache processed prompts
```
