const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");
const chatStatus = document.getElementById("chatStatus");

// Replace this placeholder with the URL of your deployed Cloudflare Worker.
const WORKER_URL = "https://loreal-chatbot.kcliff24.workers.dev/";

// Keep earlier messages so the assistant can understand follow-up questions.
const conversationHistory = [];

// Add messages as text so user input is never treated as HTML.
function addMessage(role, content) {
  const message = document.createElement("div");
  message.className = `message message--${role}`;

  const label = document.createElement("span");
  label.className = "message-label";
  label.textContent =
    role === "user" ? "You" : "L'Oréal Beauty Advisor";

  const bubble = document.createElement("p");
  bubble.className = "message-bubble";
  bubble.textContent = content;

  message.append(label, bubble);
  chatWindow.append(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Send the full conversation to the Cloudflare Worker.
async function sendMessage(event) {
  event.preventDefault();

  const question = userInput.value.trim();
  if (!question || sendBtn.disabled) {
    return;
  }

  addMessage("user", question);
  userInput.value = "";
  chatStatus.textContent = "Thinking...";
  chatStatus.classList.remove("chat-status--error");
  sendBtn.disabled = true;

  try {
    if (WORKER_URL.includes("YOUR_WORKER_SUBDOMAIN")) {
      throw new Error(
        "Add your deployed Cloudflare Worker URL to WORKER_URL in script.js."
      );
    }

    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          ...conversationHistory,
          { role: "user", content: question },
        ],
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      const serviceError =
        typeof data?.error === "string" ? data.error : data?.error?.message;
      throw new Error(
        serviceError || `The service returned an error (${response.status}).`
      );
    }

    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      throw new Error("The service returned an empty or invalid response.");
    }

    addMessage("assistant", reply.trim());
    conversationHistory.push(
      { role: "user", content: question },
      { role: "assistant", content: reply.trim() }
    );
    chatStatus.textContent = "";
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    chatStatus.textContent = `Sorry, I couldn't get a response. ${errorMessage}`;
    chatStatus.classList.add("chat-status--error");
  } finally {
    sendBtn.disabled = false;
    userInput.focus();
  }
}

chatForm.addEventListener("submit", sendMessage);
