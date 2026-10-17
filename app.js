const MENU = [
  { icon: "🧋", name: "Trà sữa truyền thống", price: "22K — 32K", desc: "Trà đậm, hậu chát nhẹ, béo vừa và không ngọt gắt." },
  { icon: "🥛", name: "Sữa tươi đường đen", price: "25K — 35K", desc: "Sữa tươi béo ngậy, sốt đường đen và trân châu nấu mới." },
  { icon: "🍍", name: "Trà lài đác thơm", price: "20K — 30K", desc: "Chua ngọt tự nhiên, cốt trà lài thơm, uống rất thanh." },
  { icon: "🍓", name: "Trà dâu tằm", price: "20K — 30K", desc: "Vị thanh nhẹ, chua ngọt cân bằng, dễ uống." },
  { icon: "🥗", name: "Bánh tráng trộn", price: "15K — 25K", desc: "Món ăn vặt đậm vị, hợp để nhâm nhi cùng trà." },
  { icon: "🍢", name: "Cá viên chiên", price: "15K — 25K", desc: "Chiên mới nóng giòn, dùng kèm tương chấm." },
  { icon: "🍟", name: "Khoai tây lắc", price: "15K — 25K", desc: "Giòn rụm bên ngoài, phủ gia vị đậm đà." }
];

const STARTERS = ["Gợi ý món thanh mát", "Quán có topping gì?", "Mình muốn đặt 2 ly", "Quán có freeship không?"];
const menuGrid = document.querySelector("#menu-grid");
const chatLog = document.querySelector("#chat-log");
const suggestions = document.querySelector("#suggestions");
const form = document.querySelector("#chat-form");
const input = document.querySelector("#message-input");
const sendButton = document.querySelector("#send-button");
const clearButton = document.querySelector("#clear-chat");
let messages = [];
let busy = false;

function renderMenu() {
  menuGrid.innerHTML = MENU.map((item) => `
    <article class="menu-card">
      <div class="menu-top"><span class="menu-icon" aria-hidden="true">${item.icon}</span><span class="menu-price">${item.price}</span></div>
      <h3>${item.name}</h3><p>${item.desc}</p>
    </article>`).join("");
}

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
  input.focus();
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

renderMenu();
renderStarters();
resetConversation();
document.querySelector("#year").textContent = new Date().getFullYear();
