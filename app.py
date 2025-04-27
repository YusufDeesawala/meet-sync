import os
from flask import Flask, request, jsonify
from googlesearch import search
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import re
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

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
        print(f"[ERROR] Failed to search for title '{title}': {str(e)}")
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
            print(f"[ERROR] Failed to scrape URL '{url}': {str(e)}")
            url = "There is no resource"
            content = "There is no resource"

    # Prepare the result data
    result_data = {
        "title": title,
        "content": content,
        "reference_link": url
    }

    # Debugging: print the result_data before sending
    print(f"[INFO] Sending data to web_add: {result_data}")

    # Send the result data to the web_add endpoint
    web_add_url = f"{os.getenv('WEB_SEARCH')}/api/websearch/web_add"
    headers = {
        'Content-Type': 'application/json',
        'auth-token': auth_token
    }

    try:
        response = requests.post(web_add_url, json=result_data, headers=headers)
        if response.status_code == 201:
            return jsonify(result_data), 200
        else:
            print(f"[ERROR] Failed to store result in database: {response.text}")
            return jsonify({"error": "Failed to store result in the database", "details": response.json()}), 500
    except Exception as e:
        print(f"[ERROR] Failed to send data to web_add: {str(e)}")
        return jsonify({"error": "Failed to store result in the database", "details": str(e)}), 500

@app.route('/email', methods=['POST'])
def handle_email():
    # Get the input data for the email
    item = request.get_json()

    # Ensure the input is a dictionary and not empty
    if not isinstance(item, dict) or len(item) == 0:
        return jsonify({"error": "Request body should be an email object"}), 400

    # Validate required fields
    required_fields = ['from_email', 'recipient', 'subject', 'body']
    missing_fields = [field for field in required_fields if field not in item or not item[field]]
    if missing_fields:
        print(f"[ERROR] Missing required fields: {missing_fields}")
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    # Validate email addresses
    from_email = item['from_email']
    recipient = item['recipient']
    if not re.match(EMAIL_REGEX, from_email):
        print(f"[ERROR] Invalid sender email: {from_email}")
        return jsonify({"error": "Invalid sender email address"}), 400
    if not re.match(EMAIL_REGEX, recipient):
        print(f"[ERROR] Invalid recipient email: {recipient}")
        return jsonify({"error": "Invalid recipient email address"}), 400

    # Send email using SendGrid
    try:
        message = Mail(
            from_email=from_email,
            to_emails=recipient,
            subject=item['subject'],
            plain_text_content=item['body']
        )

        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        response = sg.send(message)
        print(f"[INFO] Email sent successfully to {recipient}, status code: {response.status_code}")
        return jsonify({"status": "success", "agent": "email", "message": "Email sent"}), 200
    except Exception as e:
        print(f"[ERROR] Failed to send email: {str(e)}")
        return jsonify({"status": "error", "agent": "email", "message": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    print(f"[INFO] Starting Flask app on port {port}")
    if not os.getenv('SENDGRID_API_KEY'):
        print("[ERROR] SENDGRID_API_KEY environment variable not set")
    app.run(debug=False, host='0.0.0.0', port=port)