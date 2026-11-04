import os

from flask import Flask, jsonify, request
from google import genai

app = Flask(__name__)

MODEL = "gemini-2.5-flash"


@app.post("/api/chat")
def chat():
    try:
        body = request.get_json(silent=True) or {}
        messages = body.get("messages", [])

        if not messages:
            return jsonify({"error": "No messages provided."}), 400

        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return jsonify({"error": "Server is missing GEMINI_API_KEY."}), 500

        # Convert browser format -> Gemini format
        # browser: "assistant"  |  Gemini: "model"
        contents = [
            {
                "role": "model" if m["role"] == "assistant" else "user",
                "parts": [{"text": m["content"]}],
            }
            for m in messages
        ]

        # Send the WHOLE history, same idea as chatbot.py
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(model=MODEL, contents=contents)

        return jsonify({"reply": response.text})

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Something went wrong. Please try again."}), 500
