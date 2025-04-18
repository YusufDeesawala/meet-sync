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
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'your-secure-secret-key')  
app.config['SESSION_TYPE'] = 'filesystem'  
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True

CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:8080", "http://localhost"],
        "allow_headers": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "supports_credentials": True  
    }
})

app.config['STATIC_FOLDER'] = 'static'
app.config['UPLOAD_FOLDER'] = 'temp'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

model = whisper.load_model("base")

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

BACKEND_URLS = {
    'email': 'https://meet-sync-backend-2.onrender.com/email',
    'web_search': 'https://meet-sync-backend-2.onrender.com/extract',
    'note': 'https://meet-sync-backend.vercel.app/api/notes/addnote',
    'to_do': 'https://meet-sync-backend.vercel.app/api/todo/addtodo',  
    'calendar_event': 'https://calendar-backend.com/accept-event'  # Dummy link
}

FILE_TYPE_TO_BACKEND_TYPE = {
    'emails': 'email',
    'web_searches': 'web_search',
    'notes': 'note',
    'todos': 'to_do',
    'calendar_events': 'calendar_event'
}

import json

def convert_action_items(action_items):
    """Convert action items into separate JSON files for emails, web searches, notes, to-dos, and calendar events."""
    emails = []
    web_searches = []
    notes = []
    todos = []
    calendar_events = []

    for item in action_items:
        item_type = item.get("type")

        if item_type == "email":
            emails.append({
                "type": "email",
                "recipient": item.get("recipient", ""),
                "subject": item.get("subject", ""),
                "body": item.get("content", "")
            })
        elif item_type == "web_search":
            web_searches.append({
                "title": item.get("content", "")
            })
        elif item_type == "note":
            notes.append({
                "title": item.get("title", ""),
                "description": item.get("content", ""),
                "tag": item.get("tag", "")
            })
        elif item_type == "to_do":
            todos.append({
                "title": item.get("title", ""),
                "description": item.get("content", "")
            })
        elif item_type == "calendar_event":
            calendar_events.append({
                "type": "calendar_event",
                "content": item.get("content", "")
            })
        else:
            print(f"[WARN] Unknown action type: {item_type}")

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

    except Exception as e:
        print(f"[ERROR] Failed to write JSON files: {str(e)}")


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
                    "content": '''
                                You are a smart meeting assistant. Given the transcript below, extract and classify actionable items by type.

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
                                "tag": "<tag or category for the note>",

                                # Recommended for type 'to_do'
                                "title": "<short to-do title>"
                                }

                                Notes:
                                - For action items of type **note**, include `title`, `tag`, and `content` (used as the note description).
                                - For type **email**, always include `recipient`, `subject`, and `body`.
                                - For type **to_do**, include a short `title` and a longer `content` (used as the task description).
                                - For type **calendar_event** or **web_search**, only include `type` and `content`.
                                - Respond with a JSON array of action items only.
                                '''

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
        file_type = data.get('file_type')
        index = data.get('index')
        item = data.get('item')

        if not file_type or index is None or not isinstance(item, dict):
            return jsonify({'error': 'Missing or invalid file_type, index, or item'}), 400

        backend_type = FILE_TYPE_TO_BACKEND_TYPE.get(file_type)
        if not backend_type:
            return jsonify({'error': f'Invalid file_type: {file_type}'}), 400

        backend_url = BACKEND_URLS.get(backend_type)
        if not backend_url:
            return jsonify({'error': f'No backend URL configured for {file_type}'}), 500

        headers = {'Content-Type': 'application/json', 'auth-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjdmZmU1MjJmYWMzYWVhODEyN2NmODAzIn0sImlhdCI6MTc0NDg4MjI4Mn0.Xr6SBr2YzPjiFq9KDnu2UxEiU4utnO4sZEdfDYe83hw'}

        response = requests.post(backend_url, json=item, headers=headers)

        if response.status_code == 200:
            return jsonify({'message': 'Item accepted successfully'}), 200
        else:
            error_msg = response.text or 'Unknown error'
            if backend_type == 'note' and response.status_code == 401:
                auth_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjdmZmU1MjJmYWMzYWVhODEyN2NmODAzIn0sImlhdCI6MTc0NDg4MjI4Mn0.Xr6SBr2YzPjiFq9KDnu2UxEiU4utnO4sZEdfDYe83hw'
                if auth_token:
                    headers['auth-token'] = f'{auth_token}'
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