import os
import smtplib
from email.message import EmailMessage
from flask import Flask, request, jsonify
from googlesearch import search
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import re

load_dotenv()

app = Flask(__name__)

# Email validation regex
EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

@app.route('/extract', methods=['POST'])
def extract_data():
    # Get the input data
    data = request.get_json()

    if not data or 'title' not in data:
        return jsonify({"error": "Missing 'title' in request body"}), 400

    title = data['title']

    # Get the auth token from the request headers
    auth_token = request.headers.get('auth-token')
    if not auth_token:
        return jsonify({"error": "Missing 'auth-token' in request headers"}), 400

    # Search the title on Google and get the top result
    try:
        result = list(search(title, num_results=1))
        url = result[0] if result else None
    except Exception as e:
        return jsonify({"error": "Failed to search for the title", "details": str(e)}), 500

    # Check if URL is valid, else use default message
    if not url:
        url = "There is no resource"
        content = "There is no resource"
    else:
        # Ensure the URL is fully qualified (add https:// if missing)
        if not url.startswith('http'):
            url = 'https://' + url

        # Scrape the page for content
        try:
            response = requests.get(url, timeout=10)
            soup = BeautifulSoup(response.text, 'html.parser')

            # Try to get the first few paragraphs of content
            paragraphs = soup.find_all('p')
            content = " ".join(p.get_text() for p in paragraphs[:2]).strip()

            # If no content, use the fallback message
            if not content:
                content = "There is no resource"
        except Exception as e:
            url = "There is no resource"
            content = "There is no resource"

    # Prepare the result data
    result_data = {
        "title": title,
        "content": content,
        "reference_link": url
    }

    # Debugging: print the result_data before sending
    print(f"Sending data to web_add: {result_data}")

    # Send the result data to the web_add endpoint
    web_add_url = 'https://meet-sync-backend.vercel.app/api/websearch/web_add'
    headers = {
        'Content-Type': 'application/json',
        'auth-token': auth_token
    }

    response = requests.post(web_add_url, json=result_data, headers=headers)

    if response.status_code == 201:
        return jsonify(result_data), 200
    else:
        return jsonify({"error": "Failed to store result in the database", "details": response.json()}), 500

@app.route('/email', methods=['POST'])
def handle_email():
    # Get the input data for the email (expecting a single object)
    item = request.get_json()

    # Ensure the input is a dictionary and not empty
    if not isinstance(item, dict) or len(item) == 0:
        return jsonify({"error": "Request body should be an email object"}), 400

    # Validate required fields
    required_fields = ['from_email', 'recipient', 'subject', 'body']
    missing_fields = [field for field in required_fields if field not in item or not item[field]]
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    # Validate email addresses
    from_email = item['from_email']
    recipient = item['recipient']
    if not re.match(EMAIL_REGEX, from_email):
        return jsonify({"error": "Invalid sender email address"}), 400
    if not re.match(EMAIL_REGEX, recipient):
        return jsonify({"error": "Invalid recipient email address"}), 400

    try:
        msg = EmailMessage()
        msg['Subject'] = item['subject']
        msg['From'] = from_email
        msg['To'] = recipient
        msg.set_content(item['body'])

        # Note: This assumes the sender's email is a Gmail address and the app password is provided
        # In a production environment, you should use a more secure method like OAuth2
        smtp_password = os.getenv("EMAIL_PASSWORD")  # App-specific password for the sender's email
        if not smtp_password:
            return jsonify({"error": "SMTP password not configured"}), 500

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(from_email, smtp_password)
            smtp.send_message(msg)
        
        return jsonify({"status": "success", "agent": "email", "message": "Email sent"}), 200

    except Exception as e:
        return jsonify({"status": "error", "agent": "email", "message": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))  
    app.run(debug=True, host='0.0.0.0', port=port)