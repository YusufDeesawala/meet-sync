from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import whisper
import os
import shutil
from pydantic import BaseModel
from typing import Optional
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Audio Transcription API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost"],  # Adjust as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

model = whisper.load_model("base")

class TranscriptionResponse(BaseModel):
    transcription: str
    error: Optional[str] = None

@app.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        if not file.content_type.startswith("audio/"):
            raise HTTPException(status_code=400, detail="Invalid file type. Please upload an audio file.")

        temp_file_path = f"temp_{file.filename}"
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = model.transcribe(temp_file_path)

        os.remove(temp_file_path)

        return TranscriptionResponse(transcription=result["text"])

    except Exception as e:
        return TranscriptionResponse(transcription="", error=str(e))

@app.get("/")
async def root():
    return {"message": "Welcome to the Audio Transcription API. Use /transcribe to upload an audio file."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)