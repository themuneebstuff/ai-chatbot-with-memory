// ===== MEMORY =====
// Same idea as Python's `history = []`
let history = [];

const chat = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");
const newChatBtn = document.getElementById("new-chat");

const EMPTY_HTML = '<p id="empty" class="empty">Say something. I will remember it during this session.</p>';

function addMessage(text, type) {
  const emptyMsg = document.getElementById("empty");
  if (emptyMsg) emptyMsg.remove();
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}

function showTyping() {
  const emptyMsg = document.getElementById("empty");
  if (emptyMsg) emptyMsg.remove();
  const div = document.createElement("div");
  div.className = "msg bot dots";
  div.innerHTML = "<span></span><span></span><span></span>";
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}

async function sendMessage(text) {
  // MEMORY STEP 1: save the user's message (Python: history.append)
  history.push({ role: "user", content: text });

  addMessage(text, "user");
  const typing = showTyping();
  sendBtn.disabled = true;

  try {
    // MEMORY STEP 2: send the WHOLE history (Python: contents=history)
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");

    // MEMORY STEP 3: save the bot's reply too
    history.push({ role: "assistant", content: data.reply });

    typing.remove();
    addMessage(data.reply, "bot");
  } catch (err) {
    // Same as Python's history.pop() inside except
    history.pop();
    typing.remove();
    addMessage("Error: " + err.message + " Please try again.", "bot error");
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text || sendBtn.disabled) return;
  input.value = "";
  input.style.height = "auto";
  sendMessage(text);
});

// Enter = send, Shift+Enter = new line
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit();
  }
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = input.scrollHeight + "px";
});

// New chat = clear memory (Python: history.clear())
newChatBtn.addEventListener("click", () => {
  history = [];
  chat.innerHTML = EMPTY_HTML;
});