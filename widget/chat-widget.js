/**
 * AI Chat Widget v1.0 — Embeddable AI chat bubble for any website.
 * One-line install: <script src="chat-widget.js" data-server="http://yourserver:5000"></script>
 */
(function () {
  const script = document.currentScript;
  const SERVER = script.getAttribute("data-server") || "http://localhost:5000";
  const TITLE = script.getAttribute("data-title") || "AI 客服助手";
  const PLACEHOLDER = script.getAttribute("data-placeholder") || "输入你的问题...";
  const COLOR = script.getAttribute("data-color") || "#4F46E5";
  const LOGO = script.getAttribute("data-logo") || "🤖";

  // --- Styles ---
  const css = `
  .aiwc-bubble{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;
    background:${COLOR};color:#fff;font-size:24px;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.2);
    z-index:99998;display:flex;align-items:center;justify-content:center;transition:transform .2s}
  .aiwc-bubble:hover{transform:scale(1.1)}
  .aiwc-bubble.hidden{display:none}
  .aiwc-panel{position:fixed;bottom:96px;right:24px;width:380px;max-width:calc(100vw-32px);height:520px;
    max-height:calc(100vh-140px);background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.15);
    z-index:99999;display:flex;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,
    'Segoe UI',sans-serif;transition:opacity .2s,transform .2s;opacity:0;transform:translateY(16px)}
  .aiwc-panel.open{opacity:1;transform:translateY(0)}
  .aiwc-panel.hidden{display:none}
  .aiwc-header{background:${COLOR};color:#fff;padding:14px 16px;font-weight:600;font-size:15px;
    display:flex;align-items:center;gap:8px;flex-shrink:0}
  .aiwc-header-logo{font-size:20px}
  .aiwc-close{background:none;border:none;color:#fff;font-size:22px;cursor:pointer;margin-left:auto;padding:0 4px}
  .aiwc-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;
    background:#f8f9fa}
  .aiwc-msg{max-width:85%;padding:10px 14px;border-radius:12px;font-size:14px;line-height:1.5;word-break:break-word}
  .aiwc-msg.user{align-self:flex-end;background:${COLOR};color:#fff;border-bottom-right-radius:4px}
  .aiwc-msg.bot{align-self:flex-start;background:#fff;color:#333;border-bottom-left-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
  .aiwc-typing{align-self:flex-start;padding:10px 14px;display:flex;gap:4px}
  .aiwc-typing span{width:7px;height:7px;border-radius:50%;background:#999;animation:aiwc-bounce 1.4s infinite}
  .aiwc-typing span:nth-child(2){animation-delay:.2s}
  .aiwc-typing span:nth-child(3){animation-delay:.4s}
  @keyframes aiwc-bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
  .aiwc-input-wrap{display:flex;padding:12px;gap:8px;border-top:1px solid #eee;background:#fff;flex-shrink:0}
  .aiwc-input{flex:1;border:1px solid #ddd;border-radius:10px;padding:10px 14px;font-size:14px;outline:none;
    resize:none;font-family:inherit;max-height:80px}
  .aiwc-input:focus{border-color:${COLOR}}
  .aiwc-send{background:${COLOR};color:#fff;border:none;border-radius:10px;padding:10px 16px;font-size:14px;
    font-weight:600;cursor:pointer;white-space:nowrap}
  .aiwc-send:disabled{opacity:.5;cursor:default}
  .aiwc-brand{text-align:center;font-size:10px;color:#bbb;padding:4px;flex-shrink:0}
  `;

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // --- DOM ---
  const bubble = document.createElement("button");
  bubble.className = "aiwc-bubble";
  bubble.innerHTML = LOGO;

  const panel = document.createElement("div");
  panel.className = "aiwc-panel hidden";
  panel.innerHTML = `
    <div class="aiwc-header">
      <span class="aiwc-header-logo">${LOGO}</span>${TITLE}
      <button class="aiwc-close">&times;</button>
    </div>
    <div class="aiwc-messages"></div>
    <div class="aiwc-input-wrap">
      <textarea class="aiwc-input" placeholder="${PLACEHOLDER}" rows="1"></textarea>
      <button class="aiwc-send">发送</button>
    </div>
    <div class="aiwc-brand">Powered by DeepSeek AI</div>
  `;

  document.body.appendChild(bubble);
  document.body.appendChild(panel);

  const messagesEl = panel.querySelector(".aiwc-messages");
  const inputEl = panel.querySelector(".aiwc-input");
  const sendBtn = panel.querySelector(".aiwc-send");
  const closeBtn = panel.querySelector(".aiwc-close");
  let chatHistory = [];
  let sending = false;

  function openPanel() {
    bubble.classList.add("hidden");
    panel.classList.remove("hidden");
    requestAnimationFrame(() => panel.classList.add("open"));
    inputEl.focus();
  }
  function closePanel() {
    panel.classList.remove("open");
    panel.classList.add("hidden");
    bubble.classList.remove("hidden");
  }

  bubble.addEventListener("click", openPanel);
  closeBtn.addEventListener("click", closePanel);

  function addMsg(role, text) {
    const div = document.createElement("div");
    div.className = `aiwc-msg ${role}`;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement("div");
    div.className = "aiwc-typing";
    div.innerHTML = "<span></span><span></span><span></span>";
    div.setAttribute("data-typing", "1");
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  function hideTyping() {
    const el = messagesEl.querySelector("[data-typing]");
    if (el) el.remove();
  }

  async function send() {
    const text = inputEl.value.trim();
    if (!text || sending) return;
    sending = true;
    sendBtn.disabled = true;
    inputEl.value = "";
    inputEl.style.height = "auto";

    addMsg("user", text);
    chatHistory.push({ role: "user", content: text });
    showTyping();

    try {
      const r = await fetch(`${SERVER}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory }),
      });
      const d = await r.json();
      hideTyping();
      if (d.error) throw new Error(d.error);
      addMsg("bot", d.reply);
      chatHistory.push({ role: "assistant", content: d.reply });
    } catch (e) {
      hideTyping();
      addMsg("bot", "抱歉，服务暂时不可用，请稍后重试。");
    }

    sending = false;
    sendBtn.disabled = false;
    inputEl.focus();
  }

  sendBtn.addEventListener("click", send);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });
  inputEl.addEventListener("input", () => {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 80) + "px";
  });
})();
