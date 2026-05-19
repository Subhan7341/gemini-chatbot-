const sessionId = "session_" + Date.now();
let messageCount = 0;

const container = document.getElementById("messagesContainer");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const chatTitle = document.getElementById("chatTitle");

function handleKey(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResize(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 140) + "px";
}

function sendSuggestion(btn) {
  input.value = btn.textContent;
  sendMessage();
}

function scrollToBottom() {
  container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
}

function removeWelcome() {
  const welcome = document.getElementById("welcomeScreen");
  if (welcome) welcome.remove();
}

function appendMessage(role, content) {
  removeWelcome();

  const wrap = document.createElement("div");
  wrap.className = `message ${role}`;

  if (role === "user") {
    wrap.innerHTML = `
      <div class="bubble">${escapeHTML(content)}</div>
      <div class="avatar user-av">U</div>
    `;
  } else {
    wrap.innerHTML = `
      <div class="avatar bot-av">✦</div>
      <div class="bubble">${renderMarkdown(content)}</div>
    `;
  }

  container.appendChild(wrap);
  scrollToBottom();
  return wrap;
}

function appendTyping() {
  removeWelcome();
  const wrap = document.createElement("div");
  wrap.className = "message bot";
  wrap.id = "typingIndicator";
  wrap.innerHTML = `
    <div class="avatar bot-av">✦</div>
    <div class="bubble">
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  container.appendChild(wrap);
  scrollToBottom();
}

function removeTyping() {
  const el = document.getElementById("typingIndicator");
  if (el) el.remove();
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text || sendBtn.disabled) return;

  // Update chat title on first message
  messageCount++;
  if (messageCount === 1) {
    chatTitle.textContent = text.slice(0, 36) + (text.length > 36 ? "…" : "");
  }

  input.value = "";
  input.style.height = "auto";
  sendBtn.disabled = true;

  appendMessage("user", text);
  appendTyping();

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, session_id: sessionId })
    });

    const data = await res.json();
    removeTyping();

    if (data.error) {
      appendMessage("bot", "⚠️ Error: " + data.error);
    } else {
      appendMessage("bot", data.reply);
    }
  } catch (err) {
    removeTyping();
    appendMessage("bot", "⚠️ Could not connect to the server. Is Flask running?");
  }

  sendBtn.disabled = false;
  input.focus();
}

async function newChat() {
  await fetch("/reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId })
  });

  messageCount = 0;
  chatTitle.textContent = "New Conversation";
  container.innerHTML = `
    <div class="welcome-screen" id="welcomeScreen">
      <div class="welcome-gem">✦</div>
      <h1 class="welcome-title">Hello there.</h1>
      <p class="welcome-sub">Ask me anything. I'm powered by Google's Gemini AI.</p>
      <div class="suggestion-chips">
        <button class="chip" onclick="sendSuggestion(this)">Explain quantum computing</button>
        <button class="chip" onclick="sendSuggestion(this)">Write a Python script</button>
        <button class="chip" onclick="sendSuggestion(this)">Summarize a topic</button>
        <button class="chip" onclick="sendSuggestion(this)">Give me a fun fact</button>
      </div>
    </div>
  `;
}

// ── Helpers ──────────────────────────────────────────────────

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderMarkdown(text) {
  // Code blocks
  text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre><code>${escapeHTML(code.trim())}</code></pre>`
  );
  // Inline code
  text = text.replace(/`([^`]+)`/g, (_, c) => `<code>${escapeHTML(c)}</code>`);
  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic
  text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Line breaks
  text = text.replace(/\n/g, "<br>");
  return text;
}
