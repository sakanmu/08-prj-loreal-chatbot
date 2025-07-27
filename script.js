const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Cloudflare Worker URL
const WORKER_URL = "https://loreal-chatbot-proxy.sfa60.workers.dev";

// Initial system prompt
const systemPrompt = {
  role: "system",
  content: "You are a helpful assistant trained to answer questions only about L’Oréal skincare, haircare, makeup, and fragrance products, and to provide beauty-related recommendations and routines. If the user asks about anything unrelated, politely say you can only assist with beauty topics."
};

// Store full conversation history
const conversationHistory = [systemPrompt];

// Initial greeting
chatWindow.innerHTML = `<div class="msg ai">👋 Hello! Ask me anything about L’Oréal products, routines, or recommendations.</div>`;

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Add user message to conversation history
  conversationHistory.push({ role: "user", content: userMessage });

  // Create and show user message in chat window
  const userMsgElement = document.createElement("div");
  userMsgElement.classList.add("msg", "user");
  userMsgElement.textContent = userMessage;
  chatWindow.appendChild(userMsgElement);

  // Clear input and scroll to bottom
  userInput.value = "";
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // Show loading message
  const loadingMsg = document.createElement("div");
  loadingMsg.classList.add("msg", "ai");
  loadingMsg.textContent = "Thinking...";
  chatWindow.appendChild(loadingMsg);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversationHistory })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn’t generate a response.";

    // Remove the "Thinking..." message
    loadingMsg.remove();

    // Create and append new AI message element
    const aiMsgElement = document.createElement("div");
    aiMsgElement.classList.add("msg", "ai");
    aiMsgElement.textContent = reply;
    chatWindow.appendChild(aiMsgElement);

    // Save assistant reply to conversation history
    conversationHistory.push({ role: "assistant", content: reply });

  } catch (err) {
    loadingMsg.textContent = "⚠️ Error connecting to the AI. Please try again.";
    console.error(err);
  }

  // Scroll to latest messages
  chatWindow.scrollTop = chatWindow.scrollHeight;
});




