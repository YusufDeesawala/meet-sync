

# Flask App with Email and Web Scraping 🚀

This Flask app provides two key features:
1. **Extract Data from Web** - Search and scrape content from the web.
2. **Send Email** - Send emails using SendGrid's API.

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
The `/email` endpoint sends emails using SendGrid's API based on the provided input. Here's the process:
1. The user sends a **POST** request with the email details (from_email, recipient, subject, body).
2. The app uses the SendGrid API to send the email, with the "From" address dynamically set to the provided `from_email`.
3. The response indicates success or failure, including detailed error messages if applicable.

### 📩 Sample Input
**POST request to**: `/email`

```json
{
  "from_email": "yusufdeesawala72@gmail.com",
  "recipient": "mustafa_23aia57@kgkite.ac.in",
  "subject": "Meeting Notes for Mustafa - April 2025",
  "body": "Hi Mustafa,\n\nI hope you're doing well! I'm sharing some notes from our recent meeting. Let me know if you have any questions.\n\nBest regards,\nYusuf"
}
```

- **from_email** (required): The sender's email address (must be verified in SendGrid).
- **recipient** (required): The email address of the recipient.
- **subject** (required): The subject of the email.
- **body** (required): The content of the email.

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

If there's an error (e.g., invalid sender, API key issue, or missing fields), you will get a response like:

```json
{
  "status": "error",
  "agent": "email",
  "message": "HTTP Error 403: Forbidden - The from email does not belong to a verified sender identity"
}
```

### 🔧 Environment Variables Required (in .env file)
To send emails using SendGrid, ensure you set the following environment variable:
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Setup Steps for SendGrid:**
- Sign up at [SendGrid](https://sendgrid.com/).
- Verify your sender email (e.g., `yusufdeesawala72@gmail.com`) in the SendGrid dashboard under "Settings" > "Sender Authentication."
- Generate an API key with full access in "Settings" > "API Keys" and set it as `SENDGRID_API_KEY`.
- No App Password or 2FA setup is required, as SendGrid handles authentication via the API key.

### 🧠 Behind the Scenes
Here’s how the email is sent using SendGrid's API:

```python
def handle_email(item):
    try:
        message = Mail(
            from_email=item['from_email'],
            to_emails=item['recipient'],
            subject=item['subject'],
            plain_text_content=item['body'],
            html_content=f"<p>{item['body']}</p><br><p>Best regards,<br>{item['from_email']}</p>"
        )
        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        response = sg.send(message)
        return {"status": "success", "agent": "email", "message": "Email sent"}
    except Exception as e:
        return {"status": "error", "agent": "email", "message": str(e)}
```

- The `from_email` is dynamically set to the value provided in the request (e.g., `yusufdeesawala72@gmail.com`).
- SendGrid adds DKIM and SPF signatures to authenticate the email.
- The API key authenticates the request, and the response status (e.g., 202) confirms successful delivery to SendGrid’s servers.

---
