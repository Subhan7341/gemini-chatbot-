import os
from flask import Flask, render_template, request, jsonify
import google.generativeai as genai

app = Flask(__name__)

# Configure Gemini API
# Set your API key in environment variable or replace directly (not recommended for production)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyAq53pwUa6SjSDVqkjEnwENTt3AqiYqx5s")
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the Gemini model
model = genai.GenerativeModel("gemini-2.5-flash")

# Store chat sessions (in-memory; use a database for production)
chat_sessions = {}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "").strip()
    session_id = data.get("session_id", "default")

    if not user_message:
        return jsonify({"error": "Empty message"}), 400

    try:
        # Get or create chat session for multi-turn conversations
        if session_id not in chat_sessions:
            chat_sessions[session_id] = model.start_chat(history=[])

        chat = chat_sessions[session_id]
        response = chat.send_message(user_message)

        return jsonify({
            "reply": response.text,
            "session_id": session_id
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/reset", methods=["POST"])
def reset():
    data = request.get_json()
    session_id = data.get("session_id", "default")
    if session_id in chat_sessions:
        del chat_sessions[session_id]
    return jsonify({"status": "Session reset"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
