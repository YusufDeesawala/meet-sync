from flask import Flask, request, jsonify, send_from_directory, render_template
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

load_dotenv()

app = Flask(__name__, template_folder='templates')
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:8080", "http://localhost"],
        "allow_headers": "*",
        "methods": ["GET", "POST", "OPTIONS"]
    }
})

app.config['STATIC_FOLDER'] = 'static'
app.config['UPLOAD_FOLDER'] = 'temp'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

model = whisper.load_model("base")

class ActionItem(BaseModel):
    type: str = Field(..., description="Type of action item: note, email, calendar_event, or todo")
    content: str = Field(..., description="Content of the action item")
    recipient: Optional[str] = Field(None, description="Recipient for email type")
    subject: Optional[str] = Field(None, description="Subject for email type")
    body: Optional[str] = Field(None, description="Body for email type")

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
            ).dict()), 400

        file = request.files['file']
        
        if not file.content_type.startswith('audio/'):
            return jsonify(TranscriptionResponse(
                transcription="",
                error="Invalid file type. Please upload an audio file."
            ).dict()), 400

        filename = secure_filename(file.filename)
        temp_file_path = os.path.join(app.config['UPLOAD_FOLDER'], f"temp_{filename}")
        file.save(temp_file_path)

        result = model.transcribe(temp_file_path)

        os.remove(temp_file_path)

        return jsonify(TranscriptionResponse(
            transcription=result["text"]
        ).dict())

    except Exception as e:
        return jsonify(TranscriptionResponse(
            transcription="",
            error=str(e)
        ).dict()), 500

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
                    "content": (
                        "You are a smart meeting assistant. Given this transcript, extract and classify actionable items by type. "
                        "Supported types: note, email, calendar_event, to_do, web_search. For each, include content and relevant details."
                    )
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

        return jsonify({
            "message": "Action items processed successfully",
            "items": output_data
        }), 200

    except Exception as e:
        return jsonify({"error": f"Error processing transcript: {str(e)}"}), 500

@app.route('/transcribe-and-extract', methods=['POST'])
def transcribe_and_extract():
    """Combined endpoint that transcribes audio and extracts action items"""
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

@app.route('/')
def root():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)