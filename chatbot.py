import os
from dotenv import load_dotenv
from google import genai

# Load variables from the .env file
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

# Stop early if the key is missing
if not api_key:
    print("Error: GEMINI_API_KEY not found. Check your .env file.")
    raise SystemExit

client = genai.Client(api_key=api_key)

MODEL = "gemini-2.5-flash"

# In-memory conversation history
history = []

print("Chatbot ready! Type /clear to reset memory, 'quit' to exit.\n")

while True:
    user_input = input("You: ").strip()

    # Ignore empty input
    if not user_input:
        continue

    # Exit command
    if user_input.lower() in ["quit", "exit"]:
        print("Bye!")
        break

    # Clear memory command
    if user_input == "/clear":
        history.clear()
        print("Memory cleared.\n")
        continue

    # 1. Save the user's message
    history.append({"role": "user", "parts": [{"text": user_input}]})

    try:
        # 2. Send the WHOLE history to the model
        response = client.models.generate_content(
            model=MODEL,
            contents=history
        )
        reply = response.text

        # 3. Save the model's reply
        history.append({"role": "model", "parts": [{"text": reply}]})

        print("Bot:", reply, "\n")

    except Exception as e:
        # If the API call failed, remove the user's message
        # so history stays clean (user, model, user, model...)
        history.pop()
        print(f"Error: {e}")
        print("Please try again.\n")