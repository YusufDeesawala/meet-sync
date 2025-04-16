
---

## 🚀 Features

### 1. 🌐 Web Search Agent (Powered by SerpAPI)

This agent allows you to automatically perform a Google search based on meeting discussion content. For example, if someone says _"Can you check the latest updates in AI?"_, the app will extract that and trigger a real-time search using [SerpAPI](https://serpapi.com/).

#### ✅ Workflow:

- Input JSON includes an item with `"type": "web_search"` and a `"content"` field containing the search query.
- The agent calls SerpAPI and extracts titles + snippets from the organic results.
- Results are returned as structured JSON.

#### 🧪 Sample Input (to `/process_meeting_output` endpoint)

```json
[
  {
    "type": "web_search",
    "content": "latest updates in artificial intelligence 2025"
  }
]
```

#### 💻 How to Test with Postman

1. Open [Postman](https://postman.com)
2. Create a new **POST** request to:  
   ```
   http://localhost:5000/process_meeting_output
   ```
3. Go to the **Body** tab → Select **raw** → Choose **JSON** from the dropdown
4. Paste the sample input above
5. Click **Send**

Postman will return a response like:

```json
[
  {
    "status": "success",
    "agent": "web_search",
    "results": [
      {
        "title": "OpenAI releases new AI tools in 2025",
        "snippet": "OpenAI has introduced a new model focused on better reasoning..."
      },
      {
        "title": "Google DeepMind 2025 Innovations",
        "snippet": "Google DeepMind unveiled a new agentic framework..."
      }
    ]
  }
]
```

#### 🔧 Environment Variables Required (in `.env` file)

```env
SERP_API_KEY=your_serpapi_key_here
```

---


### 2. 📧 Email Agent (Send Follow-Ups Automatically)

This agent sends follow-up emails based on meeting content. If someone says something like _"Send a follow-up to the client with the meeting summary"_, the AI can extract that intent and pass it to this agent.

#### ✅ Workflow:

- The input JSON includes an item with `"type": "email"` and required fields:
  - `recipient`
  - `subject`
  - `body`
- The agent uses SMTP with SSL to log in to your email account and send the email securely.

---

#### 📩 Sample Input (to `/process_meeting_output` endpoint)

```json
[
  {
    "type": "email",
    "recipient": "client@example.com",
    "subject": "Follow-up on Q2 Meeting",
    "body": "Dear Client,\n\nAs discussed in our recent meeting, please find the summary of Q2 action items..."
  }
]
```

---

#### 💻 How to Test with Postman

1. Open [Postman](https://postman.com)
2. Create a new **POST** request to:  
   ```
   http://localhost:5000/process_meeting_output
   ```
3. Go to the **Headers** tab and add:
   ```
   Content-Type: application/json
   ```
4. Go to the **Body** tab → Select **raw** → Choose **JSON** from the dropdown
5. Paste the sample input above
6. Click **Send**

You should receive a response like:

```json
[
  {
    "status": "success",
    "agent": "email",
    "message": "Email sent"
  }
]
```

If something goes wrong (like invalid credentials), you'll get an error message with `status: "error"`.

---

#### 🔧 Environment Variables Required (in `.env` file)

```env
EMAIL_SENDER=youremail@gmail.com
EMAIL_PASSWORD=your_app_password
```

> ⚠️ For Gmail users:
> - You must have **2FA enabled** on your account.
> - Then create an **App Password** here: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

---

#### 🧠 Behind the Scenes: How the Email Agent Works

```python
def handle_email(item):
    try:
        msg = EmailMessage()
        msg['Subject'] = item['subject']
        msg['From'] = EMAIL_SENDER
        msg['To'] = item['recipient']
        msg.set_content(item['body'])

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(EMAIL_SENDER, EMAIL_PASSWORD)
            smtp.send_message(msg)

        return {"status": "success", "agent": "email", "message": "Email sent"}
    except Exception as e:
        return {"status": "error", "agent": "email", "message": str(e)}
```

---

Got it! Here's the updated documentation for the **Add Note** API without including the `"type"` field:

---

### 3. 📝 Add Note (Create Notes from Meeting Context)

This endpoint allows you to add notes based on the context from a meeting or any other input. You can use it to save notes, which will include a title, description, and tags.

#### ✅ Workflow:

- Send a `POST` request to the following URL:
  ```
  http://localhost:5000/api/notes/addnote
  ```

- Include the following headers:
  ```
  Content-Type: application/json
  Authorization: Bearer <jwt-token>
  ```

#### 💻 Sample Input (to `/api/notes/addnote` endpoint):

```json
{
  "title": "Sample",
  "description": "This is the Sample Note",
  "tag": "Sample"
}
```

#### 💻 How to Test with Postman:

1. Open [Postman](https://postman.com).
2. Create a new **POST** request to:  
   ```
   http://localhost:5000/api/notes/addnote
   ```
3. Go to the **Headers** tab and add the following headers:
   ```
   Key: Content-Type, Value: application/json
   Key: auth-token, Value: <jwt-token>
   ```
4. Go to the **Body** tab → Select **raw** → Choose **JSON** from the dropdown.
5. Paste the sample input above.
6. Click **Send**.

You should receive a response like:

```json
{
  "status": "success",
  "message": "Note added successfully"
}
```

If something goes wrong (for example, missing required fields or invalid token), you’ll receive an error message with `status: "error"`.

---
