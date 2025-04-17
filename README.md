
---

# Flask App with Email and Web Scraping 🚀

This Flask app provides two key features:
1. **Extract Data from Web** - Search and scrape content from the web.
2. **Send Email** - Send emails using Gmail's SMTP server.

This version is the **latest** release of **Routes_testing**, and it's designed to automatically search for information on Google and send follow-up emails.



The service is live at = [Link](https://meet-sync-backend-2.onrender.com/)

---

## Table of Contents

1. [🌐 Extract Data from Web](#extract-data-from-web)
    - [✅ Workflow](#workflow)
    - [🧪 Sample Input](#sample-input)
    - [💻 How to Test with Postman](#how-to-test-with-postman)
    - [🔧 Environment Variables Required](#environment-variables-required)
2. [📧 Send Email](#send-email)
    - [✅ Workflow](#workflow-1)
    - [📩 Sample Input](#sample-input-1)
    - [💻 How to Test with Postman](#how-to-test-with-postman-1)
    - [🔧 Environment Variables Required](#environment-variables-required-1)
    - [🧠 Behind the Scenes](#behind-the-scenes)

---

## 🌐 Extract Data from Web

### ✅ Workflow
The `/extract` endpoint extracts content from a webpage by performing a Google search for the given title. Here's the process:
1. The user sends a **POST** request with a `title` in the body.
2. The app performs a Google search using **SerpAPI** and gets the top search result.
3. The app scrapes the content from the resulting page using **BeautifulSoup**.
4. The result (title, content, and URL) is sent back in the response.

### 🧪 Sample Input
**POST request to**: `/extract`

```json
{
  "title": "Artificial Intelligence in Healthcare"
}
```

- **title** (required): A string representing the title or topic to search for.

### 💻 How to Test with Postman
1. Open **Postman**.
2. Create a new `POST` request to:  
   `http://localhost:2000/extract`
3. Go to the **Headers** tab and add the following:
   - Key: `Content-Type`, Value: `application/json`
   - Key: `auth-token`, Value: `<jwt-token>` (your valid JWT token)
4. Go to the **Body** tab → Select **raw** → Choose **JSON** from the dropdown.
5. Paste the **sample input** provided above.
6. Click **Send**.

You should receive a response similar to:

```json
{
  "title": "Artificial Intelligence in Healthcare",
  "content": "Artificial Intelligence (AI) is revolutionizing healthcare by enhancing diagnostics...",
  "reference_link": "https://www.example.com/ai-healthcare"
}
```

### 🔧 Environment Variables Required (in .env file)
To use the `extract` functionality, ensure you set the following environment variables:
```bash
EMAIL_SENDER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

**For Gmail users:**  
You must have 2FA enabled on your Gmail account. Then, create an **App Password** here: [Google App Passwords](https://myaccount.google.com/apppasswords).

---

## 📧 Send Email

### ✅ Workflow
The `/email` endpoint sends emails based on the provided input. Here's the process:
1. The user sends a **POST** request with the email's details (recipient, subject, body).
2. The app uses Gmail’s SMTP server to send the email securely.

### 📩 Sample Input
**POST request to**: `/email`

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

- **type**: Should always be `email`.
- **recipient**: The email address of the recipient.
- **subject**: The subject of the email.
- **body**: The content of the email.

### 💻 How to Test with Postman
1. Open **Postman**.
2. Create a new `POST` request to:  
   `http://localhost:2000/email`
3. Go to the **Headers** tab and add the following:
   - Key: `Content-Type`, Value: `application/json`
   - Key: `auth-token`, Value: `<jwt-token>` (your valid JWT token)
4. Go to the **Body** tab → Select **raw** → Choose **JSON** from the dropdown.
5. Paste the **sample input** provided above.
6. Click **Send**.

You should receive a response like:

```json
{
  "status": "success",
  "agent": "email",
  "message": "Email sent"
}
```

If there's an error (e.g., invalid credentials or missing fields), you will get a response like:

```json
{
  "status": "error",
  "agent": "email",
  "message": "Invalid credentials"
}
```

### 🔧 Environment Variables Required (in .env file)
To send emails using Gmail, make sure you have the following environment variables:
```bash
EMAIL_SENDER=youremail@gmail.com
EMAIL_PASSWORD=your_app_password
```

**⚠️ For Gmail users:**
- Ensure 2FA is enabled on your Gmail account.
- Create an **App Password** here: [Google App Passwords](https://myaccount.google.com/apppasswords).

### 🧠 Behind the Scenes
Here's a quick look at how the email is sent using the Gmail SMTP server:

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
