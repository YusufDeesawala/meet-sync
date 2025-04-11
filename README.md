

---

# 🧠 Smart Meeting Assistant (Offline Meetings Workflow)

---

## 🟩 0. Prerequisites / Assumptions

- Input: **Audio recording file** (e.g., `.mp3`, `.wav`)
- Meeting is recorded via phone/mic and uploaded post-meeting
- You have access to:
  - Groq LLM endpoint
  - A working email sender (SMTP or API)
  - An endpoint for your Notes App (can be mocked initially)

---

## 🟢 1. Audio File Upload / Ingestion

### 🔹 Task:
User uploads the audio file via a web app, desktop client, or CLI tool.

### 🔹 Output:
- Audio file saved to a local folder or cloud bucket.
- Metadata stored (e.g., meeting title, date, duration)

---

## 🟡 2. Speech-to-Text Conversion (Transcription)

### 🔹 Tool:
Use **Whisper (OpenAI)** or **Deepgram** locally or via API.

### 🔹 Output:
Generate **structured transcript** (with timestamps & speaker labels if possible):

```json
[
  { "timestamp": "00:00:12", "speaker": "Alice", "text": "Let's take note of the Q2 sales." },
  { "timestamp": "00:00:33", "speaker": "Bob", "text": "We should send a follow-up email to the client." }
]
```

**Store the transcript** in a JSON or Markdown file for backup/reference.

---

## 🟠 3. LLM-Based Inference (Groq)

### 🔹 Input:
The full **transcript** text from step 2.

### 🔹 Prompt Template (example):
```text
You are a smart meeting assistant. Given this transcript, extract and classify actionable items by type. Supported types: note, email, calendar_event, todo. For each, include content and relevant details.

Transcript:
[Insert full transcript here]
```

### 🔹 Output (LLM Response):
```json
[
  {
    "type": "note",
    "content": "Q2 sales must be tracked and reviewed weekly."
  },
  {
    "type": "email",
    "recipient": "client@example.com",
    "subject": "Follow-up on Q2 meeting",
    "body": "Dear Client, as discussed in our recent meeting..."
  }
]
```

**Save this output as `tasks.json` for downstream use.**

---

## 🔵 4. Task Routing (Intent Dispatcher)

### 🔹 Logic:
Read `tasks.json` → Identify type of task → Call respective handler

| Task Type       | Handler                    |
|------------------|-----------------------------|
| `note`          | Send to Notes API           |
| `email`         | Send via Email Sender       |
| `calendar_event`| (optional) Calendar API     |
| `todo`          | Add to Notion, Trello, etc. |

### 🔹 Dispatcher Pseudocode:
```python
for task in tasks:
    if task["type"] == "note":
        send_to_notes(task)
    elif task["type"] == "email":
        send_email(task)
    elif task["type"] == "todo":
        create_todo_item(task)
```

---

## 🟣 5. Action Execution

### 🔸 A. Notes App

- API: `POST /notes`
- Payload:
```json
{ "content": "Q2 sales must be tracked and reviewed weekly." }
```

> If the Notes App isn't done yet, log to file/db as a placeholder.

---

### 🔸 B. Email Automation

- SMTP or SendGrid API
- Send the email with content from LLM

#### Code Example (Python + SMTP):
```python
def send_email(task):
    msg = MIMEText(task["body"])
    msg["Subject"] = task["subject"]
    msg["From"] = "assistant@company.com"
    msg["To"] = task["recipient"]

    s = smtplib.SMTP("smtp.gmail.com", 587)
    s.starttls()
    s.login("email", "password")
    s.sendmail(msg["From"], [msg["To"]], msg.as_string())
    s.quit()
```

---

### 🔸 C. TODO/Calendar Event (Optional)

- Hook to Notion API, Trello, or Google Calendar
- Use `task["due_date"]`, `task["title"]`, etc., if present

---

## 🟤 6. Post-Processing: Logging & Dashboard

### 🔹 Save:
- Transcript (`transcript.json`)
- Extracted Tasks (`tasks.json`)
- Action logs (success/failure)

### 🔹 Optional UI Dashboard:
Show status like:
```
✅ Note created | 🕒 Email sent | 🛑 Todo failed (missing info)
```

---

## 🔘 7. Error Handling

- Retry failed actions (e.g., email server down)
- Log Groq API errors or invalid responses
- Alert if missing critical info (like email recipient)

---

## 🔁 8. Loop or Batch Mode (Optional)

If processing multiple meetings:
- Loop through a folder of audio files
- Repeat steps 2–6 for each

---

## ✅ Summary Diagram (Text Version)

```
[ Audio File ]
      ↓
[ Transcription (Whisper) ]
      ↓
[ Transcript JSON ]
      ↓
[ Groq LLM → Extract Tasks ]
      ↓
[ Tasks JSON ]
      ↓
+------------------+
|   Task Router    |
+------------------+
  ↓       ↓       ↓
[Notes] [Email] [Todo/Calendar]
      ↓
[Logs + Dashboard]
```

---

