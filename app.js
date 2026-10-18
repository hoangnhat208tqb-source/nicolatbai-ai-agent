if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);

const STARTERS = ["Gợi ý món thanh mát", "Quán có topping gì?", "Mình muốn đặt 2 ly", "Quán có freeship không?"];
const chatLog = document.querySelector("#chat-log");
const suggestions = document.querySelector("#suggestions");
const form = document.querySelector("#chat-form");
const input = document.querySelector("#message-input");
const sendButton = document.querySelector("#send-button");
const clearButton = document.querySelector("#clear-chat");
let messages = [];
let busy = false;

function addMessage(text, type, extraClass = "") {
  const node = document.createElement("div");
  node.className = `message ${type} ${extraClass}`.trim();
  node.textContent = text;
  chatLog.appendChild(node);
  chatLog.scrollTop = chatLog.scrollHeight;
  return node;
}

function addTyping() {
  const node = document.createElement("div");
  node.className = "message bot typing";
  node.setAttribute("aria-label", "Trợ lý AI đang trả lời");
  node.innerHTML = "<i></i><i></i><i></i>";
  chatLog.appendChild(node);
  chatLog.scrollTop = chatLog.scrollHeight;
  return node;
}

function resetConversation() {
  messages = [];
  chatLog.innerHTML = "";
  addMessage("Xin chào! Mình là trợ lý AI của NicoLatBai. Bạn đang muốn tìm một món hợp gu hay cần hỗ trợ đặt món?", "bot");
}

function renderStarters() {
  STARTERS.forEach((text) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.addEventListener("click", () => submitMessage(text));
    suggestions.appendChild(button);
  });
}

function resizeInput() {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 100)}px`;
}

async function submitMessage(rawText) {
  const text = rawText.trim();
  if (!text || busy) return;
  busy = true;
  sendButton.disabled = true;
  input.value = "";
  resizeInput();
  addMessage(text, "user");
  messages.push({ role: "user", content: text });
  const typing = addTyping();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: messages.slice(-12) })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Không thể kết nối với trợ lý AI.");
    typing.remove();
    addMessage(data.reply, "bot");
    messages.push({ role: "assistant", content: data.reply });
  } catch (error) {
    typing.remove();
    messages.pop();
    addMessage(`${error.message} Vui lòng thử lại hoặc gọi 038.397.8888.`, "bot", "error");
  } finally {
    busy = false;
    sendButton.disabled = false;
    input.focus();
  }
}

form.addEventListener("submit", (event) => { event.preventDefault(); submitMessage(input.value); });
input.addEventListener("input", resizeInput);
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); }
});
clearButton.addEventListener("click", resetConversation);

renderStarters();
resetConversation();
document.querySelector("#year").textContent = new Date().getFullYear();
