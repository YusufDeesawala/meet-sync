import os
import json
import instructor
from groq import Groq
from pydantic import BaseModel, Field
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

class ActionItem(BaseModel):
    type: str = Field(..., description="Type of action item: note, email, calendar_event, or todo")
    content: str = Field(..., description="Content of the action item")
    recipient: Optional[str] = Field(None, description="Recipient for email type")
    subject: Optional[str] = Field(None, description="Subject for email type")
    body: Optional[str] = Field(None, description="Body for email type")

class ActionItemsList(BaseModel):
    items: List[ActionItem] = Field(..., description="List of actionable items")

# Sample transcript 
transcript = """
Team meeting on Q2 planning. Sarah said we need to track Q2 sales weekly and review them in team meetings. 
John assigned to send a follow-up email to client@example.com summarizing our Q2 discussion. 
Action item: Draft email with subject 'Follow-up on Q2 meeting' and include key points discussed. 
Mary to schedule a calendar event for the next review on Friday. 
Todo for Tom: Update the project timeline by tomorrow.
"""

api_key = os.getenv("GROQ_API")  
if not api_key:
    raise ValueError("GROQ_API environment variable not set")

client = Groq(api_key=api_key)
client = instructor.from_groq(client, mode=instructor.Mode.JSON)

try:
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
    with open("action_items.json", "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2)

    print("Action items saved to action_items.json")

except Exception as e:
    print(f"Error processing transcript: {e}")