from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import whisper
import os
import shutil
from pydantic import BaseModel
from typing import Optional

# Initialize FastAPI app
app = FastAPI(title="Audio Transcription API")

# Load Whisper model (use "base" for speed, or "large" for better accuracy)
model = whisper.load_model("base")

# Pydantic model for response
class TranscriptionResponse(BaseModel):
    transcription: str
    error: Optional[str] = None

# Endpoint to upload and transcribe audio
@app.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        # Validate file type (accept only audio files)
        if not file.content_type.startswith("audio/"):
            raise HTTPException(status_code=400, detail="Invalid file type. Please upload an audio file.")

        # Save uploaded file temporarily
        temp_file_path = f"temp_{file.filename}"
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Transcribe audio using Whisper
        result = model.transcribe(temp_file_path)

        # Clean up temporary file
        os.remove(temp_file_path)

        # Return transcription
        return TranscriptionResponse(transcription=result["text"])

    except Exception as e:
        # Handle errors and return them in response
        return TranscriptionResponse(transcription="", error=str(e))

# Root endpoint for testing
@app.get("/")
async def root():
    return {"message": "Welcome to the Audio Transcription API. Use /transcribe to upload an audio file."}

# Run the app with: uvicorn main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)