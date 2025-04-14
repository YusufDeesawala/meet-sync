from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
import whisper
import os
import shutil
from werkzeug.utils import secure_filename
from pydantic import BaseModel
from typing import Optional

app = Flask(__name__, template_folder='templates')

CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:8080", "http://localhost"],
        "allow_headers": "*",
        "methods": ["GET", "POST", "OPTIONS"]
    }
})

# Configure static files and uploads
app.config['STATIC_FOLDER'] = 'static'
app.config['UPLOAD_FOLDER'] = 'temp'

# Ensure temp directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load Whisper model
model = whisper.load_model("base")

# Pydantic model for response structure
class TranscriptionResponse(BaseModel):
    transcription: str
    error: Optional[str] = None

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
        
        # Check if file is audio
        if not file.content_type.startswith('audio/'):
            return jsonify(TranscriptionResponse(
                transcription="",
                error="Invalid file type. Please upload an audio file."
            ).dict()), 400

        # Secure filename and save temporarily
        filename = secure_filename(file.filename)
        temp_file_path = os.path.join(app.config['UPLOAD_FOLDER'], f"temp_{filename}")
        file.save(temp_file_path)

        # Transcribe audio
        result = model.transcribe(temp_file_path)

        # Clean up
        os.remove(temp_file_path)

        return jsonify(TranscriptionResponse(
            transcription=result["text"]
        ).dict())

    except Exception as e:
        return jsonify(TranscriptionResponse(
            transcription="",
            error=str(e)
        ).dict()), 500

@app.route('/')
def root():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)