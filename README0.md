
---

# Meeting Assistant Web Application

## Overview

The Meeting Assistant is a Flask-based web application that allows users to upload meeting audio recordings, transcribe them into text, and extract actionable items such as emails, to-dos, calendar events, and notes. The system features secure authentication and integrates with external APIs like Groq for transcription and NLP-based action item extraction. 


The WebApp is deployed in this link = [Link](https://meet-sync.onrender.com/)

---

## Features

- **User Authentication**: Secure login/logout system with token-based session management.
- **Audio Transcription**: Uses Groq Whisper API to transcribe audio files.
- **Action Item Extraction**: NLP-powered classification of tasks like emails, notes, calendar events, etc.
- **Action Item Management**: Accept, reject, update, and view categorized action items.
- **Frontend Integration**: Basic HTML templates for login and home/dashboard.

---

## Table of Contents

1. [Installation](#installation)  
2. [Project Structure](#project-structure)  
3. [Configuration](#configuration)  
4. [Authentication](#authentication)  
5. [API Endpoints](#api-endpoints)  
6. [Action Items](#action-items)  
7. [Audio Transcription](#audio-transcription)  
8. [Frontend Integration](#frontend-integration)  
9. [Error Handling](#error-handling)  
10. [Security Considerations](#security-considerations)  
11. [Performance & Scalability](#performance--scalability)  
12. [Potential Future Enhancements](#potential-future-enhancements)  
13. [Troubleshooting](#troubleshooting)  
14. [Contributing](#contributing)  
15. [License](#license)  
16. [Acknowledgements](#acknowledgements)  

---

## Installation

### 1. Clone the Repository
```bash
git clone <repository_url>
cd <project_directory>
```

### 2. Create and Activate a Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # Linux/MacOS
venv\Scripts\activate     # Windows
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Set up Environment Variables

Create a `.env` file in the project root:
```
FLASK_SECRET_KEY=<your_secret_key>
BASE_URL=<backend_base_url_for_auth>
GROQ_API=<your_groq_api_key>
APP_URL=<your_app_url>
```

### 5. Run the Application
```bash
python main.py
```

---

## Project Structure

```
/project_root
├── /static                # Static files (CSS, JS, images)
├── /templates             # HTML templates
│   ├── login.html
│   ├── index.html
├── /temp                  # Temporarily stored audio files
├── /groq                 # Groq API client wrapper
├── /instructor           # NLP classification logic
├── main.py                # Main Flask app
├── .env                   # Environment configuration
├── requirements.txt       # Project dependencies
```

**Key Files:**

- `main.py`: Application logic and routes  
- `/templates`: Login and home page HTML  
- `/static`: Frontend assets  
- `/temp`: Temporary audio storage

---

## Configuration

**Environment Variables:**

- `FLASK_SECRET_KEY`: Secret key for sessions  
- `BASE_URL`: Auth backend base URL  
- `GROQ_API`: Groq API key  
- `APP_URL`: App base URL  

**File Paths:**

- `/static` – CSS/JS  
- `/templates` – Frontend HTML  
- `/temp` – Audio file uploads  

---

## Authentication

- **Login Route (`POST /`)**: Authenticates with email and password  
- **Session Management**: Flask sessions store tokens securely  
- **Home Route (`GET /home`)**: Protected route showing user dashboard

---

## API Endpoints

### Authentication

- **POST /**  
  Authenticates user and redirects to home on success.

- **GET /home**  
  Loads the authenticated user's dashboard.

---

### Transcription

- **POST /transcribe**  
  Uploads audio and returns raw transcription text.

- **POST /transcribe-and-extract**  
  Uploads audio and returns structured action items.

---

### Action Item Processing

- **POST /extract-action-items**  
  Accepts transcript and returns action items.

- **POST /update-json-file**  
  Updates a specific item in the JSON store.

- **POST /reject-action-item**  
  Deletes a rejected item.

- **POST /accept-action-item**  
  Sends accepted items to the appropriate service (e.g., email, calendar).

---

## Action Items

### Categories:

- **Email** – Tasks requiring email communication  
- **Web Search** – Research or lookup tasks  
- **Note** – Notes or reminders  
- **To-Do** – Tasks to complete  
- **Calendar Event** – Scheduling items  

Action items are saved in categorized JSON files (`emails.json`, `todos.json`, etc.).

Extraction is powered by Groq + Instructor API.

---

## Audio Transcription

- Audio files are uploaded and temporarily stored in `/temp`.
- Groq Whisper API performs transcription.
- Resulting text is returned or passed for action item extraction.

---

## Frontend Integration

### Login Page (`login.html`)

- Simple form for email/password
- Stores token in browser on success

### Home Page (`index.html`)

- Dashboard UI  
- Shows extracted items and action controls  

---

## Error Handling

Handles:
- Missing or invalid files/fields
- Auth failures
- External API errors
- Invalid action item indexes or types

---

## Security Considerations

- **Session Tokens**: Securely stored in cookies
- **Password Hashing**: (Recommend using `bcrypt` or `werkzeug.security`)
- **Token Expiry**: (JWT or session expiry is recommended)
- **File Validation**: Accept only audio/* MIME types
- **API Key Management**: Environment-based access control

---

## Performance & Scalability

- **Large File Uploads**: Consider Flask upload size limits  
- **Asynchronous Processing**: Offload transcription to Celery for better performance  
- **Caching**: Use Redis to cache repeated transcripts  
- **Storage**: Integrate cloud storage (e.g., S3) for large-scale deployments  
- **Database**: Migrate from JSON to PostgreSQL/MySQL in production  

---

## Troubleshooting

- **Missing .env**: Ensure all variables are set  
- **Invalid audio format**: Accept only `audio/*` types  
- **Rate limits**: Handle Groq API limits with retries  
- **Large files**: Use Celery for background tasks

---

## Contributing

We welcome contributions!

1. Fork this repo  
2. Make changes (code, docs, fixes)  
3. Submit a pull request

**Code Style**:  
- Python: PEP8  
- JS: ESLint  
- Document your changes!

---

## License

This project is licensed under the **MIT License**. See `LICENSE` for details.

---

## Acknowledgements

- **Groq API** – Transcription services  
- **Flask** – Web framework  
- **Whisper** – Speech-to-text model  
- **Instructor** – NLP-based action item extractor  

---

