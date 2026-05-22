# CAA Web Application (Augmentative and Alternative Communication)

A web-based AAC system with customizable symbol grids and AI-powered text-to-speech.

## Prerequisites

- **Docker and Docker Compose** (Recommended)

## Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd web-app-CAA
```

### 2. Environment Configuration

Create the `.env` file from the example:

```bash
cp .env.example .env
```

Key `.env` configurations:
- `PUBLIC_URL`: The frontend URL (e.g., `http://localhost:3000`).
- `APP_PORT`: Frontend port (default `3000`).
- `JWT_SECRET`: Change this to a secure random string.
- `DB_TYPE`: Recommended `sqlite` for easy setup.

### 3. AI Configuration

You must choose an AI backend in your `.env` file:

**Option A: Remote API (OpenAI / OpenWebUI)**
```env
BACKEND_TYPE=openai
LLM_HOST=https://api.openai.com/v1  # Or your OpenWebUI URL
OPENAI_API_KEY=your-api-key
LLM_MODEL=gpt-4o                    # Or your preferred model
```

**Option B: Local AI (Ollama)**
1. Install [Ollama](https://ollama.com/) and ensure it is running.
2. Download the recommended model:
```bash
ollama run llama3.1:8b
```
3. Configure `.env`:
```env
BACKEND_TYPE=ollama
LLM_HOST=http://host.docker.internal:11434 # Use your machine's local IP on Linux
LLM_MODEL=llama3.1:8b
```

### 4. Build and Run

**Using Docker (Recommended)**
```bash
docker-compose up -d --build
```

**Without Docker (Local Setup)**
Requires Node.js 22+ and Python 3.10+. Run these in two separate terminals:

Terminal 1 (Node Server):
```bash
npm install
npm start
```

Terminal 2 (Python API):
```bash
pip install -r requirements.txt
python main.py
```

Access the application at the URL defined in `PUBLIC_URL` (default: `http://localhost:3000`).
