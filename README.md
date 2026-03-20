# 🎯 PrepPilot

**PrepPilot** is an AI-powered interview preparation tool that helps CS job seekers practice technical and behavioral interviews with a conversational AI interviewer, receive real-time feedback, and review past sessions.

> _Practice. Improve. Land the job._

---

## ⚙️ Key Features

- 🎤 **Technical & Behavioral Interviews**  
  Choose your interview type, topic, and difficulty level for a tailored practice experience.

- 🤖 **AI Interviewer**  
  Powered by Ollama (Llama 3.1) for realistic, adaptive interview conversations.

- 🔊 **Voice Support**  
  Speech-to-text (OpenAI Whisper) and text-to-speech (Piper) for hands-free interviewing.

- ⚡ **Real-time Chat**  
  WebSocket-based live interview sessions with instant AI responses.

- 📚 **Question Banks**  
  Create and manage custom question collections to focus your practice.

- ⏱️ **Session Timer**  
  Simulate real interview time pressure with configurable session durations.

- 📝 **Session History**  
  Review past interviews with full transcripts and AI-generated feedback.

- 📊 **Difficulty Scaling**  
  Easy, medium, and hard question levels to match your preparation stage.

---

## 🧰 Tech Stack

- **Frontend:** Angular 21, Tailwind CSS  
- **Backend:** Python, FastAPI, SQLAlchemy, Pydantic  
- **Database:** PostgreSQL  
- **AI:** Ollama (Llama 3.1)  
- **Speech:** OpenAI Whisper (STT), Piper (TTS)  
- **Queue:** Celery + Redis  
- **Containerization:** Docker, Docker Compose  

---

## 🎥 Demo and Screenshots


https://github.com/user-attachments/assets/f356fcf3-052f-4f55-96d8-3cf4a341861e



---

## 🚀 How to Run Locally (with Docker)

1. Clone the repository:
   ```bash
   git clone https://github.com/AdrianGH03/AIInterviewProject
   ```

2. Create a `.env` file in `Backend/` with:

   ```env
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=yourpassword
   POSTGRES_DB=ai_interview
   POSTGRES_PORT=5432
   DATABASE_URL=postgresql+psycopg2://postgres:yourpassword@localhost:5432/ai_interview

   REDIS_HOST=redis
   REDIS_PORT=6379

   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.1:8b
   PIPER_VOICE_PATH=voices/en_US-norman-medium.onnx
   FRONTEND_URL=http://localhost:4200
   ```

   Replace `yourpassword` with your desired PostgreSQL password.

3. From the project root, run:

   ```bash
   docker compose up --build
   ```

4. Pull the Ollama model:

   ```bash
   docker compose exec ollama ollama pull llama3.1:8b
   ```

5. Access the app:

   * **Frontend:** [http://localhost:4200](http://localhost:4200)
   * **API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
   * **Backend API:** [http://localhost:8000](http://localhost:8000)

### Local Development (without Docker)

**Backend:**
```bash
cd Backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

---

## 📁 Project Structure

```
├── Backend/
│   ├── app/
│   │   ├── config.py              # Environment settings
│   │   ├── main.py                # FastAPI app entry point
│   │   ├── db/                    # Database setup & dependencies
│   │   ├── models/                # SQLAlchemy ORM models
│   │   ├── schemas/               # Pydantic request/response schemas
│   │   ├── routes/                # API endpoints & WebSocket
│   │   └── services/              # Business logic
│   │       ├── ai/                # Ollama LLM integration
│   │       ├── questions/         # Question & bank CRUD
│   │       ├── responses/         # Response & feedback logic
│   │       ├── sessions/          # Interview session management
│   │       ├── interviewees/      # Interviewee management
│   │       └── speech/            # TTS & STT services
│   └── voices/                    # Piper TTS voice models
├── frontend/
│   └── src/app/
│       ├── components/            # Shared UI (navbar, code editor)
│       ├── models/                # TypeScript interfaces
│       ├── pages/                 # Route pages
│       │   ├── dashboard/
│       │   ├── interview-setup/
│       │   ├── interview-session/
│       │   ├── question-banks/
│       │   ├── session-history/
│       │   └── session-detail/
│       └── services/              # API, WebSocket, Audio services
└── docker-compose.yml
```

---

## License

```
Copyright [2026] [Miguel Gomez]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
