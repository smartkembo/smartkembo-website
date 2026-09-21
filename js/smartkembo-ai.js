/**
 * SmartKembo AI — Chat Widget
 * Inawekwa kwenye website static (HTML).
 *
 * Badilisha API_BASE kuwa URL ya backend yako.
 * Mfano: https://api.smartkembo.co.tz
 */
(function () {
  'use strict';

  // ═══════════════════════════════════════════
  //  CONFIG — Badilisha hapa
  // ═══════════════════════════════════════════
  const API_BASE = 'https://smartkembo-backend.onrender.com';   // ← WEKA URL YA BACKEND YAKO
  // Kwa development: const API_BASE = 'https://smartkembo-backend.onrender.com';

  const BOT_NAME = 'SmartKembo AI';
  const PRIMARY_COLOR = '#00C8E8';
  const STORAGE_KEY = 'sk_ai_session';

  // ═══════════════════════════════════════════

  function getSessionId() {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = 'sk_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  }

  function createWidget() {
    // Avoid double inject
    if (document.getElementById('sk-ai-root')) return;

    const root = document.createElement('div');
    root.id = 'sk-ai-root';
    root.innerHTML = `
      <style>
        #sk-ai-root { all: initial; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        #sk-ai-root * { box-sizing: border-box; }
        #sk-ai-btn {
          position: fixed; bottom: 24px; right: 24px; z-index: 99999;
          width: 60px; height: 60px; border-radius: 50%;
          background: linear-gradient(135deg, #00C8E8, #0090B0);
          border: none; cursor: pointer;
          box-shadow: 0 8px 28px rgba(0,200,232,0.4);
          display: flex; align-items: center; justify-content: center;
          transition: transform .2s, box-shadow .2s;
        }
        #sk-ai-btn:hover { transform: scale(1.08); box-shadow: 0 12px 36px rgba(0,200,232,0.5); }
        #sk-ai-btn svg { width: 28px; height: 28px; fill: white; }
        #sk-ai-badge {
          position: absolute; top: -2px; right: -2px;
          width: 14px; height: 14px; background: #22C55E;
          border-radius: 50%; border: 2px solid white;
          animation: sk-pulse 1.5s infinite;
        }
        @keyframes sk-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

        #sk-ai-panel {
          position: fixed; bottom: 100px; right: 24px; z-index: 99998;
          width: 380px; max-width: calc(100vw - 32px);
          height: 520px; max-height: calc(100vh - 140px);
          background: #0B1520; border: 1px solid rgba(0,200,232,0.2);
          border-radius: 20px; overflow: hidden;
          display: none; flex-direction: column;
          box-shadow: 0 24px 64px rgba(0,0,0,0.5);
          animation: sk-slideUp .25s ease;
        }
        #sk-ai-panel.open { display: flex; }
        @keyframes sk-slideUp {
          from { opacity:0; transform: translateY(20px); }
          to   { opacity:1; transform: translateY(0); }
        }

        #sk-ai-header {
          background: linear-gradient(135deg, #0A1826, #0D2137);
          padding: 16px 18px; display: flex; align-items: center; gap: 12px;
          border-bottom: 1px solid rgba(0,200,232,0.12);
        }
        #sk-ai-avatar {
          width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(135deg, #00C8E8, #0090B0);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
        }
        #sk-ai-header-info { flex: 1; min-width: 0; }
        #sk-ai-header-name { color: #F0F8FF; font-size: 15px; font-weight: 600; }
        #sk-ai-header-status { color: #22C55E; font-size: 11px; margin-top: 2px; display:flex; align-items:center; gap:5px; }
        #sk-ai-header-status::before { content:''; width:6px; height:6px; background:#22C55E; border-radius:50%; }
        #sk-ai-close {
          background: none; border: none; color: #8BA3B8; cursor: pointer;
          font-size: 22px; line-height: 1; padding: 4px 8px; border-radius: 8px;
        }
        #sk-ai-close:hover { background: rgba(255,255,255,0.06); color: #fff; }

        #sk-ai-messages {
          flex: 1; overflow-y: auto; padding: 16px;
          display: flex; flex-direction: column; gap: 12px;
          scroll-behavior: smooth;
        }
        #sk-ai-messages::-webkit-scrollbar { width: 5px; }
        #sk-ai-messages::-webkit-scrollbar-thumb { background: rgba(0,200,232,0.25); border-radius: 4px; }

        .sk-msg { max-width: 85%; padding: 11px 14px; border-radius: 14px; font-size: 13.5px; line-height: 1.55; white-space: pre-wrap; word-break: break-word; }
        .sk-msg.bot  { background: #132233; color: #E8F4FC; align-self: flex-start; border-bottom-left-radius: 4px; }
        .sk-msg.user { background: linear-gradient(135deg, #00C8E8, #00A8C8); color: #041018; align-self: flex-end; border-bottom-right-radius: 4px; font-weight: 500; }
        .sk-msg.typing { color: #8BA3B8; font-style: italic; }

        .sk-feedback { display: flex; gap: 6px; margin-top: 6px; }
        .sk-fb-btn {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          color: #8BA3B8; font-size: 11px; padding: 3px 10px; border-radius: 20px; cursor: pointer;
        }
        .sk-fb-btn:hover { background: rgba(0,200,232,0.15); color: #00C8E8; }
        .sk-fb-btn.done { opacity: 0.5; pointer-events: none; }
        .sk-continue { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
        .sk-c-btn {
          background: rgba(0,200,232,0.12); border: 1px solid rgba(0,200,232,0.28);
          color: #7FE4F4; font-size: 12px; padding: 7px 12px; border-radius: 20px;
          cursor: pointer; font-family: inherit;
        }
        .sk-c-btn:hover { background: rgba(0,200,232,0.22); color: #fff; }
        .sk-c-btn.close { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.12); color:#C5D4E0; }

        #sk-ai-input-area {
          padding: 12px 14px; border-top: 1px solid rgba(0,200,232,0.12);
          display: flex; gap: 8px; align-items: flex-end;
          background: #0A1826;
        }
        #sk-ai-input {
          flex: 1; background: #132233; border: 1px solid rgba(0,200,232,0.18);
          border-radius: 12px; padding: 11px 14px; color: #F0F8FF;
          font-size: 13.5px; resize: none; outline: none; max-height: 100px;
          font-family: inherit; line-height: 1.4;
        }
        #sk-ai-input:focus { border-color: #00C8E8; }
        #sk-ai-input::placeholder { color: #5A7A90; }
        #sk-ai-send {
          width: 42px; height: 42px; border-radius: 12px;
          background: linear-gradient(135deg, #00C8E8, #0090B0);
          border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: opacity .15s;
        }
        #sk-ai-send:disabled { opacity: 0.4; cursor: not-allowed; }
        #sk-ai-send svg { width: 18px; height: 18px; fill: white; }

        @media (max-width: 480px) {
          #sk-ai-panel { bottom: 0; right: 0; left: 0; width: 100%; max-width: 100%; height: 85vh; max-height: 85vh; border-radius: 20px 20px 0 0; }
          #sk-ai-btn { bottom: 16px; right: 16px; }
        }
      </style>

      <button id="sk-ai-btn" aria-label="Open SmartKembo AI">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/><circle cx="8" cy="10" r="1.2"/><circle cx="12" cy="10" r="1.2"/><circle cx="16" cy="10" r="1.2"/></svg>
        <span id="sk-ai-badge"></span>
      </button>

      <div id="sk-ai-panel">
        <div id="sk-ai-header">
          <div id="sk-ai-avatar">🤖</div>
          <div id="sk-ai-header-info">
            <div id="sk-ai-header-name">${BOT_NAME}</div>
            <div id="sk-ai-header-status">Online</div>
          </div>
          <button id="sk-ai-close" aria-label="Close">×</button>
        </div>
        <div id="sk-ai-messages"></div>
        <div id="sk-ai-input-area">
          <textarea id="sk-ai-input" rows="1" placeholder="Andika swali lako... / Type your question..."></textarea>
          <button id="sk-ai-send" aria-label="Send">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(root);

    const btn = document.getElementById('sk-ai-btn');
    const panel = document.getElementById('sk-ai-panel');
    const closeBtn = document.getElementById('sk-ai-close');
    const input = document.getElementById('sk-ai-input');
    const sendBtn = document.getElementById('sk-ai-send');
    const messages = document.getElementById('sk-ai-messages');

    let isOpen = false;
    let isSending = false;
    let idleTimer = null;
    const CLOSE_WORDS = ['hapana','no','nope','sitaki','enough','bas','basi','close','funga','stop','that\'s all','thats all','no thanks','sihitaji'];

    function clearIdle() {
      if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
    }

    function startIdle() {
      clearIdle();
      idleTimer = setTimeout(function () {
        if (!isOpen) return;
        endChat(true);
      }, 90000);
    }

    function endChat(fromIdle) {
      clearIdle();
      var bye = preferSw
        ? (fromIdle
            ? 'Asante kwa kuwasiliana na SmartKembo AI.\nMazungumzo yamefungwa kwa sababu hakukuwa na swali jingine.\n\nThank you. The chat is now closed.'
            : 'Asante. Mazungumzo yamefungwa.\nKaribu tena unapohitaji msaada.\n\nThank you. The chat is closed. You are welcome back anytime.')
        : (fromIdle
            ? 'Thank you for chatting with SmartKembo AI.\nThe conversation is closed because there was no further question.\n\nAsante. Mazungumzo yamefungwa.'
            : 'Thank you. The chat is now closed.\nYou are welcome back anytime you need help.\n\nAsante. Karibu tena.');
      addBotMessage(bye);
      setTimeout(function () {
        panel.classList.remove('open');
        isOpen = false;
      }, 1800);
    }

    function showContinuePrompt() {
      document.querySelectorAll('.sk-continue').forEach(function (el) { el.remove(); });
      var wrap = document.createElement('div');
      wrap.className = 'sk-msg bot';
      wrap.innerHTML =
        '<div>' + (preferSw
          ? 'Una swali lingine?\nDo you have another question?'
          : 'Do you have another question?\nUna swali lingine?') + '</div>' +
        '<div class="sk-continue">' +
          '<button type="button" class="sk-c-btn" data-act="yes">' + (preferSw ? 'Ndiyo — endelea' : 'Yes — continue') + '</button>' +
          '<button type="button" class="sk-c-btn close" data-act="no">' + (preferSw ? 'Hapana — funga' : 'No — close chat') + '</button>' +
        '</div>';
      messages.appendChild(wrap);
      messages.scrollTop = messages.scrollHeight;
      wrap.querySelector('[data-act="yes"]').onclick = function () {
        wrap.remove();
        input.focus();
        startIdle();
      };
      wrap.querySelector('[data-act="no"]').onclick = function () {
        wrap.remove();
        endChat(false);
      };
    }

    function toggle() {
      isOpen = !isOpen;
      panel.classList.toggle('open', isOpen);
      if (isOpen) {
        input.focus();
        document.getElementById('sk-ai-badge').style.display = 'none';
        startIdle();
      } else {
        clearIdle();
      }
    }

    btn.addEventListener('click', toggle);
    closeBtn.addEventListener('click', toggle);

    // Welcome — lugha ya browser, kisha ujumbe wa lugha zote mbili
    var browserLang = (navigator.language || 'en').toLowerCase();
    var preferSw = browserLang.indexOf('sw') === 0;
    var welcomeEn =
      'Hello.\nI am SmartKembo AI.\n\nWe can start talking now.\nAsk about WiFi Vending, Water Vending, Shop & POS, pricing, or how to get started.\n\nYou can write in English or Kiswahili.';
    var welcomeSw =
      'Habari.\nMimi ni SmartKembo AI.\n\nTunaweza kuanza kuwasiliana sasa.\nUliza kuhusu WiFi Vending, Water Vending, Shop & POS, bei, au jinsi ya kuanza.\n\nAndika kwa English au Kiswahili.';
    addBotMessage(preferSw ? (welcomeSw + '\n\n—\n\n' + welcomeEn) : (welcomeEn + '\n\n—\n\n' + welcomeSw));

    function addBotMessage(text, messageId) {
      const div = document.createElement('div');
      div.className = 'sk-msg bot';
      div.textContent = text;

      if (messageId) {
        const fb = document.createElement('div');
        fb.className = 'sk-feedback';
        fb.innerHTML = `
          <button class="sk-fb-btn" data-fb="good" data-id="${messageId}">👍 Vizuri</button>
          <button class="sk-fb-btn" data-fb="bad" data-id="${messageId}">👎 Si vizuri</button>
        `;
        div.appendChild(fb);
        fb.querySelectorAll('.sk-fb-btn').forEach(b => {
          b.addEventListener('click', async () => {
            const id = b.dataset.id;
            const feedback = b.dataset.fb;
            try {
              await fetch(API_BASE + '/api/chat/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId: id, feedback })
              });
            } catch (e) {}
            fb.querySelectorAll('.sk-fb-btn').forEach(x => x.classList.add('done'));
            b.textContent = feedback === 'good' ? '✓ Asante!' : '✓ Tumeona';
          });
        });
      }

      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    function addUserMessage(text) {
      const div = document.createElement('div');
      div.className = 'sk-msg user';
      div.textContent = text;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    function addTyping() {
      const div = document.createElement('div');
      div.className = 'sk-msg bot typing';
      div.id = 'sk-typing';
      div.textContent = 'Inafikiri...';
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    function removeTyping() {
      const t = document.getElementById('sk-typing');
      if (t) t.remove();
    }

    async function send() {
      const text = input.value.trim();
      if (!text || isSending) return;

      isSending = true;
      sendBtn.disabled = true;
      input.value = '';
      input.style.height = 'auto';

      document.querySelectorAll('.sk-continue').forEach(function (el) { el.remove(); });
      clearIdle();

      var low = text.toLowerCase();
      var wantsClose = CLOSE_WORDS.some(function (w) { return low === w || low.indexOf(w) !== -1; }) && text.length < 40;
      addUserMessage(text);
      if (wantsClose) {
        isSending = false;
        sendBtn.disabled = false;
        endChat(false);
        return;
      }

      addTyping();

      try {
        const res = await fetch(API_BASE + '/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: getSessionId(),
            message: text
          })
        });

        const data = await res.json();
        removeTyping();

        if (data.success && data.data) {
          addBotMessage(data.data.reply, data.data.messageId);
        } else {
          addBotMessage(data.message || 'Sorry, something went wrong. / Samahani, kuna hitilafu.');
        }
        showContinuePrompt();
        startIdle();
      } catch (err) {
        removeTyping();
        addBotMessage('I cannot connect right now. Please try again later.\nSiwezi kuunganisha sasa. Jaribu baadaye.\n\nWhatsApp: +255 767 830 319');
        showContinuePrompt();
        startIdle();
      }

      isSending = false;
      sendBtn.disabled = false;
      input.focus();
    }

    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });

    // Auto-resize textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    });
  }

  // Start when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
