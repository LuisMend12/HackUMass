const API_KEY = "YOUR_GEMINI_API_KEY";
const chatToggle = document.getElementById("chat-toggle");
const chatContainer = document.getElementById("chat-container");
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

chatToggle.addEventListener("click", () => {
  chatContainer.style.display =
    chatContainer.style.display === "flex" ? "none" : "flex";
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
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const data = await res.json();
  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Sorry, I couldn't get a response."
  );
}
