# Gemini Chatbot 🤖

A full-stack chatbot built with **Python (Flask)** + **Google Gemini AI** + **HTML/CSS**.

## Project Structure

```
gemini-chatbot/
├── app.py                  # Flask backend + Gemini API
├── requirements.txt
├── .env.example
├── templates/
│   └── index.html          # Main chat UI
└── static/
    ├── css/style.css        # Styling
    └── js/chat.js           # Frontend logic
```

## Setup Instructions

### 1. Get a Gemini API Key
Go to https://aistudio.google.com/app/apikey and create a free API key.

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Set your API key

**Option A – Environment variable (recommended):**
```bash
# Windows
set GEMINI_API_KEY=your_key_here

# Mac/Linux
export GEMINI_API_KEY=your_key_here
```

**Option B – Direct in app.py:**
Replace `"YOUR_API_KEY_HERE"` in `app.py` with your key (not recommended for production).

### 4. Run the app
```bash
python app.py
```

Then open your browser at: **http://localhost:5000**

## Features
- 💬 Multi-turn conversations (Gemini remembers context)
- ✨ Typing indicator animation
- 📝 Basic Markdown rendering (bold, italic, code blocks)
- 🔄 Reset / New Chat support
- 📱 Responsive design
