from flask import Flask, request, jsonify
import requests
import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Configs (set in .env)
NOTES_SERVICE_URL = os.getenv("NOTES_SERVICE_URL")
SERP_API_KEY = os.getenv("SERP_API_KEY")
EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

@app.route('/process_meeting_output', methods=['POST'])
def process_meeting_output():
    data = request.json
    results = []

    for item in data:
        if item['type'] == 'note':
            result = handle_note(item)
        elif item['type'] == 'email':
            result = handle_email(item)
        elif item['type'] == 'web_search':
            result = handle_web_search(item)
        else:
            result = {"status": "error", "message": f"Unknown type: {item['type']}"}
        results.append(result)

    return jsonify(results), 200

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

def handle_web_search(item):
    try:
        query = item.get("content")
        url = f"https://serpapi.com/search.json?q={query}&api_key={SERP_API_KEY}"
        res = requests.get(url)
        results = res.json()

        # Extract clean title and snippet
        clean_results = []
        for r in results.get('organic_results', []):
            clean_results.append({
                "title": r.get("title"),
                "snippet": r.get("snippet")
            })

        return {"status": "success", "agent": "web_search", "results": clean_results}
    except Exception as e:
        return {"status": "error", "agent": "web_search", "message": str(e)}


if __name__ == '__main__':
    app.run(debug=True)
