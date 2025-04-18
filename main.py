from flask import Flask, request, jsonify, send_from_directory, render_template, session
from flask_cors import CORS
import os
import json
import whisper
import instructor
from groq import Groq
from pydantic import BaseModel, Field
from typing import List, Optional
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import time
import requests

load_dotenv()

app = Flask(__name__, template_folder='templates')
# Configure Flask sessions
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'your-secure-secret-key')  # Replace with secure key in production
app.config['SESSION_TYPE'] = 'filesystem'  # Use filesystem for sessions; consider Redis in production
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True

CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:8080", "http://localhost"],
        "allow_headers": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "supports_credentials": True  # Allow cookies/sessions
    }
})

app.config['STATIC_FOLDER'] = 'static'
app.config['UPLOAD_FOLDER'] = 'temp'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

model = whisper.load_model("tiny")

class ActionItem(BaseModel):
    type: str = Field(..., description="Type of action item: note, email, calendar_event, to_do, or web_search")
    content: str = Field(..., description="Content of the action item")
    recipient: Optional[str] = Field(None, description="Recipient for email type")
    subject: Optional[str] = Field(None, description="Subject for email type")
    body: Optional[str] = Field(None, description="Body for email type")
    title: Optional[str] = Field(None, description="Title for note type")
    tag: Optional[str] = Field(None, description="Tag for note type")

class ActionItemsList(BaseModel):
    items: List[ActionItem] = Field(..., description="List of actionable items")

class TranscriptionResponse(BaseModel):
    transcription: str
    error: Optional[str] = None

api_key = os.getenv("GROQ_API")
if not api_key:
    print("Warning: GROQ_API environment variable not set. Action item extraction will not work.")
    groq_client = None
else:
    groq_client = Groq(api_key=api_key)
    groq_client = instructor.from_groq(groq_client, mode=instructor.Mode.JSON)

# Backend URLs for accept actions (replace with actual URLs)
BACKEND_URLS = {
    'email': 'https://meet-sync-backend-2.onrender.com/email',
    'web_search': 'https://websearch-backend.com/accept-websearch',
    'note': 'https://meet-sync-backend.vercel.app/api/notes/addnote',
    'to_do': 'https://todo-backend.com/accept-todo',  # Dummy link
    'calendar_event': 'https://calendar-backend.com/accept-event'  # Dummy link
}

# Notes auth endpoint
NOTES_AUTH_URL = 'https://notes-backend.com/auth'  # Replace with actual auth endpoint
NOTES_AUTH_PAYLOAD = {
    'client_id': os.getenv('NOTES_CLIENT_ID', 'your-client-id'),
    'client_secret': os.getenv('NOTES_CLIENT_SECRET', 'your-client-secret'),
    'grant_type': 'client_credentials'
}

def fetch_notes_auth_token():
    """Fetch auth token for notes backend and store in session."""
    try:
        response = requests.post(NOTES_AUTH_URL, json=NOTES_AUTH_PAYLOAD)
        if response.status_code == 200:
            token = response.json().get('token')
            if token:
                session['notes_auth_token'] = token
                return token
            else:
                print(f"Failed to fetch notes auth token: No token in response")
                return None
        else:
            print(f"Failed to fetch notes auth token: {response.text}")
            return None
    except Exception as e:
        print(f"Error fetching notes auth token: {str(e)}")
        return None

def convert_action_items(action_items):
    """Convert action items into separate JSON files for emails, web searches, notes, to-dos, and calendar events."""
    emails = []
    web_searches = []
    notes = []
    todos = []
    calendar_events = []

    for item in action_items:
        if item["type"] == "email":
            emails.append({
                "type": "email",
                "recipient": item["recipient"],
                "subject": item["subject"],
                "body": item["content"]
            })
        elif item["type"] == "web_search":
            web_searches.append({
                "type": "web_search",
                "content": item["content"]
            })
        elif item["type"] == "note":
            notes.append({
                "title": item["title"],
                "description": item["content"],
                "tag": item["tag"]
            })
        elif item["type"] == "to_do":
            todos.append({
                "type": "to_do",
                "content": item["content"]
            })
        elif item["type"] == "calendar_event":
            calendar_events.append({
                "type": "calendar_event",
                "content": item["content"]
            })

    try:
        if emails:
            with open("emails.json", "w", encoding="utf-8") as f:
                json.dump(emails, f, indent=2)
        if web_searches:
            with open("web_search.json", "w", encoding="utf-8") as f:
                json.dump(web_searches, f, indent=2)
        if notes:
            with open("notes.json", "w", encoding="utf-8") as f:
                json.dump(notes, f, indent=2)
        if todos:
            with open("todos.json", "w", encoding="utf-8") as f:
                json.dump(todos, f, indent=2)
        if calendar_events:
            with open("calendar_events.json", "w", encoding="utf-8") as f:
                json.dump(calendar_events, f, indent=2)
        action_items_file = "action_items.json"
        if os.path.exists(action_items_file):
            os.remove(action_items_file)
        print("Conversion complete. Output saved to JSON files.")
    except Exception as e:
        print(f"Failed to save converted JSON files: {e}")

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.config['STATIC_FOLDER'], filename)

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    try:
        if 'file' not in request.files:
            return jsonify(TranscriptionResponse(
                transcription="",
                error="No file provided"
            ).model_dump()), 400

        file = request.files['file']
        
        if not file.content_type.startswith('audio/'):
            return jsonify(TranscriptionResponse(
                transcription="",
                error="Invalid file type. Please upload an audio file."
            ).model_dump()), 400

        filename = secure_filename(file.filename)
        temp_file_path = os.path.join(app.config['UPLOAD_FOLDER'], f"temp_{filename}")
        file.save(temp_file_path)

        start_time = time.time()
        result = model.transcribe(temp_file_path)
        transcription_time = time.time() - start_time
        print(f"Transcription took {transcription_time:.2f} seconds for file {filename}")

        os.remove(temp_file_path)

        return jsonify(TranscriptionResponse(
            transcription=result["text"]
        ).model_dump())

    except Exception as e:
        return jsonify(TranscriptionResponse(
            transcription="",
            error=str(e)
        ).model_dump()), 500

@app.route('/extract-action-items', methods=['POST'])
def extract_action_items():
    try:
        if not groq_client:
            return jsonify({"error": "GROQ_API environment variable not set"}), 500

        if not request.is_json:
            return jsonify({"error": "Request must contain JSON data"}), 400

        data = request.get_json()
        transcript = data.get("transcript")

        if not transcript:
            return jsonify({"error": "Transcript is required"}), 400

        action_items = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            response_model=ActionItemsList,
            messages=[
                {
                    "role": "system",
                    "content": '''You are a smart meeting assistant. Given the transcript below, extract and classify actionable items by type.

                                    Supported action item types:
                                    - note
                                    - email
                                    - calendar_event
                                    - to_do
                                    - web_search

                                    Use the following JSON format for each action item:

                                    {
                                    "type": "<type>",
                                    "content": "<main description of the action item>",

                                    # Required for type 'email'
                                    "recipient": "<recipient email>",
                                    "subject": "<email subject>",
                                    "body": "<full email body>",

                                    # Required for type 'note'
                                    "title": "<short title>",
                                    "tag": "<tag or category for the note>"
                                    }

                                    Notes:
                                    - For action items of type **note**, include `title`, `tag`, and `content` (used as the note description).
                                    - For type **email**, always include `recipient`, `subject`, and `body`.
                                    - For **all other types**, only include `type` and `content`. Do not include any extra fields like `recipient`, `title`, or `tag`.

                                    Respond with a JSON array of action items.'''
                },
                {
                    "role": "user",
                    "content": f"Transcript:\n{transcript}"
                }
            ],
            temperature=0.5,
        )

        output_data = action_items.model_dump()["items"]

        try:
            with open("action_items.json", "w", encoding="utf-8") as f:
                json.dump(output_data, f, indent=2)
        except Exception as e:
            print(f"Failed to save action_items.json: {e}")

        convert_action_items(output_data)

        return jsonify({
            "message": "Action items processed and converted successfully",
            "items": output_data
        }), 200

    except Exception as e:
        return jsonify({"error": f"Error processing transcript: {str(e)}"}), 500

@app.route('/transcribe-and-extract', methods=['POST'])
def transcribe_and_extract():
    try:
        transcription_response = transcribe_audio()
        
        if transcription_response[1] != 200:
            return transcription_response
        
        transcription_data = json.loads(transcription_response[0].data)
        transcript = transcription_data.get("transcription", "")
        
        request.data = json.dumps({"transcript": transcript}).encode('utf-8')
        request.is_json = True
        
        return extract_action_items()
    
    except Exception as e:
        return jsonify({"error": f"Error in combined processing: {str(e)}"}), 500
    
@app.route('/get-json-files', methods=['GET'])
def get_json_files():
    try:
        json_files = {
            'emails': [],
            'web_searches': [],
            'notes': [],
            'todos': [],
            'calendar_events': []
        }

        if os.path.exists('emails.json'):
            with open('emails.json', 'r', encoding='utf-8') as f:
                json_files['emails'] = json.load(f)
        
        if os.path.exists('web_search.json'):
            with open('web_search.json', 'r', encoding='utf-8') as f:
                json_files['web_searches'] = json.load(f)
        
        if os.path.exists('notes.json'):
            with open('notes.json', 'r', encoding='utf-8') as f:
                json_files['notes'] = json.load(f)
        
        if os.path.exists('todos.json'):
            with open('todos.json', 'r', encoding='utf-8') as f:
                json_files['todos'] = json.load(f)
        
        if os.path.exists('calendar_events.json'):
            with open('calendar_events.json', 'r', encoding='utf-8') as f:
                json_files['calendar_events'] = json.load(f)

        return jsonify(json_files), 200
    except Exception as e:
        return jsonify({'error': f'Error reading JSON files: {str(e)}'}), 500
    
@app.route('/update-json-file', methods=['POST'])
def update_json_file():
    try:
        if not request.is_json:
            return jsonify({'error': 'Request must contain JSON data'}), 400

        data = request.get_json()
        file_type = data.get('file_type')
        index = data.get('index')
        updated_item = data.get('item')

        if not file_type or index is None or not updated_item:
            return jsonify({'error': 'Missing file_type, index, or item'}), 400

        file_map = {
            'emails': 'emails.json',
            'web_searches': 'web_search.json',
            'notes': 'notes.json',
            'todos': 'todos.json',
            'calendar_events': 'calendar_events.json'
        }

        if file_type not in file_map:
            return jsonify({'error': 'Invalid file_type'}), 400

        file_path = file_map[file_type]

        if not os.path.exists(file_path):
            return jsonify({'error': f'{file_path} does not exist'}), 404

        with open(file_path, 'r', encoding='utf-8') as f:
            items = json.load(f)

        if index < 0 or index >= len(items):
            return jsonify({'error': 'Invalid index'}), 400

        items[index] = updated_item

        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(items, f, indent=2)

        return jsonify({'message': 'Item updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': f'Error updating JSON file: {str(e)}'}), 500

@app.route('/reject-action-item', methods=['POST'])
def reject_action_item():
    try:
        if not request.is_json:
            return jsonify({'error': 'Request must contain JSON data'}), 400

        data = request.get_json()
        file_type = data.get('file_type')
        index = data.get('index')

        if not file_type or index is None:
            return jsonify({'error': 'Missing file_type or index'}), 400

        file_map = {
            'emails': 'emails.json',
            'web_searches': 'web_search.json',
            'notes': 'notes.json',
            'todos': 'todos.json',
            'calendar_events': 'calendar_events.json'
        }

        if file_type not in file_map:
            return jsonify({'error': 'Invalid file_type'}), 400

        file_path = file_map[file_type]

        if not os.path.exists(file_path):
            return jsonify({'error': f'{file_path} does not exist'}), 404

        with open(file_path, 'r', encoding='utf-8') as f:
            items = json.load(f)

        if index < 0 or index >= len(items):
            return jsonify({'error': 'Invalid index'}), 400

        items.pop(index)

        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(items, f, indent=2)

        return jsonify({'message': 'Item rejected and removed successfully'}), 200
    except Exception as e:
        return jsonify({'error': f'Error rejecting action item: {str(e)}'}), 500

@app.route('/accept-action-item', methods=['POST'])
def accept_action_item():
    try:
        if not request.is_json:
            return jsonify({'error': 'Request must contain JSON data'}), 400

        data = request.get_json()
        file_type = data.get('file_type')  # 'emails', 'web_searches', 'notes', 'todos', 'calendar_events'
        index = data.get('index')
        item = data.get('item')

        if not file_type or index is None or not isinstance(item, dict):
            return jsonify({'error': 'Missing or invalid file_type, index, or item'}), 400

        if file_type not in ['emails', 'web_searches', 'notes', 'todos', 'calendar_events']:
            return jsonify({'error': 'Invalid file_type'}), 400

        # Map file_type to backend_type if needed (adjust this if using multiple URLs)
        backend_type = file_type.replace('es', '') if file_type in ['emails', 'notes'] else file_type
        backend_url = 'https://meet-sync-backend-2.onrender.com/email'  # Example; replace dynamically if needed

        headers = {'Content-Type': 'application/json'}

        # Send item as raw dict (not wrapped)
        response = requests.post(backend_url, json=item, headers=headers)

        if response.status_code == 200:
            return jsonify({'message': 'Item accepted successfully'}), 200
        else:
            error_msg = response.text or 'Unknown error'
            # Retry logic for `notes` if needed
            if file_type == 'notes' and response.status_code == 401:
                auth_token = fetch_notes_auth_token()
                if auth_token:
                    headers['auth-token'] = f'Bearer {auth_token}'
                    retry_response = requests.post(backend_url, json=item, headers=headers)
                    if retry_response.status_code == 200:
                        return jsonify({'message': 'Item accepted successfully'}), 200
                    error_msg = retry_response.text or 'Unknown error'
            return jsonify({'error': f'Failed to accept item: {error_msg}'}), response.status_code

    except Exception as e:
        return jsonify({'error': f'Error accepting action item: {str(e)}'}), 500


@app.route('/')
def root():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)