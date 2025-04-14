from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import instructor
from groq import Groq
from pydantic import BaseModel, Field
from typing import List, Optional
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:8080", "http://localhost"],
        "allow_headers": "*",
        "methods": ["GET", "POST", "OPTIONS"]
    }
})

load_dotenv()

class ActionItem(BaseModel):
    type: str = Field(..., description="Type of action item: note, email, calendar_event, or todo")
    content: str = Field(..., description="Content of the action item")
    recipient: Optional[str] = Field(None, description="Recipient for email type")
    subject: Optional[str] = Field(None, description="Subject for email type")
    body: Optional[str] = Field(None, description="Body for email type")

class ActionItemsList(BaseModel):
    items: List[ActionItem] = Field(..., description="List of actionable items")

api_key = os.getenv("GROQ_API")
if not api_key:
    raise ValueError("GROQ_API environment variable not set")

client = Groq(api_key=api_key)
client = instructor.from_groq(client, mode=instructor.Mode.JSON)

@app.route('/extract-action-items', methods=['POST'])
def extract_action_items():
    try:
        if not request.is_json:
            return jsonify({"error": "Request must contain JSON data"}), 400

        data = request.get_json()
        transcript = data.get("transcript")

        if not transcript:
            return jsonify({"error": "Transcript is required"}), 400

        # Process transcript with Groq
        action_items = client.chat.completions.create(
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

@app.route('/')
def root():
    return jsonify({"message": "Welcome to the Action Items Extraction API. Use /extract-action-items to process a transcript."})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)