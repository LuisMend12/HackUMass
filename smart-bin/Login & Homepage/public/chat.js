const chatToggle = document.getElementById("chat-toggle");
const chatContainer = document.getElementById("chat-container");
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

chatToggle.addEventListener("click", () => {
  const isVisible = chatContainer.style.display === "flex";
  chatContainer.style.display = isVisible ? "none" : "flex";

  if (!isVisible && !chatBox.dataset.welcomed) {
    appendMessage("Gemini", "Hello! 👋 How can I assist you today?");
    chatBox.dataset.welcomed = "true";
  }
});

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
  const userText = userInput.value.trim();
  if (!userText) return;

  appendMessage("You", userText);
  userInput.value = "";

  const response = await getGeminiResponse(userText);
  appendMessage("Gemini", response);
}

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = sender === "You" ? "user-msg" : "bot-msg";
  msg.textContent = `${sender}: ${text}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function getGeminiResponse(prompt) {
  try {
    const res = await fetch("http://localhost:3000/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

    const data = await res.json();
    return data.text;
  } catch (err) {
    return "Error connecting to Gemini 😞";
  }
}
