# AI Chatbot with Memory

A terminal chatbot built with Python and the Google Gemini API.
It remembers earlier messages during a live session.

## Features
- Connects to Gemini using the official `google-genai` SDK
- Remembers the conversation using an in-memory list
- `/clear` command to reset memory
- `quit` to exit
- Error handling for API and network failures
- API key stored safely in a `.env` file

## How memory works

The Gemini API is stateless: every request is independent, so the model forgets everything by default. To give the bot memory, the program keeps a Python list called `history`. Each item in the list is a message with a `role` ("user" or "model") and its `parts` (the text).

On every turn, the program does three things in order:
1. Appends the user's message to `history`.
2. Sends the whole `history` list to the model (`contents=history`), not just the latest message.
3. Appends the model's reply to `history`.

Because the full conversation is sent every time, the model can see earlier messages and answer questions like "What is my name?". The bot's reply is saved too, so the model also sees its own previous answers and the conversation stays consistent. The `/clear` command empties the list, which resets the memory.

## Setup
1. Clone the repo
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and add your Gemini API key
4. Run:
   ```
   python chatbot.py
   ```

## Tech stack
Python, google-genai, python-dotenv