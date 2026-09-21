/**
 * SmartKembo AI — Chat Widget
 */
(function () {
  'use strict';

  const API_BASE = 'https://smartkembo-backend.onrender.com';
  const BOT_NAME = 'SmartKembo AI';
  const STORAGE_KEY = 'sk_ai_session';

  function getSessionId() {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = 'sk_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  }

  function createWidget() {
    if (document.getElementById('sk-ai-root')) return;

    const root = document.createElement('div');
    root.id = 'sk-ai-root';
    root.innerHTML = `
      <style>
        #sk-ai-root {
          font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
          z-index: 2147483000;
        }
        #sk-ai-root * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

        #sk-ai-btn {
          position: fixed; bottom: 18px; right: 18px; z-index: 2147483646;
          width: 56px; height: 56px; border-radius: 50%;
          background: #00C8E8; border: none; cursor: pointer;
          box-shadow: 0 10px 28px rgba(0,200,232,.35);
          display: flex; align-items: center; justify-content: center;
        }
        #sk-ai-btn svg { width: 24px; height: 24px; fill: #06101E; }
        #sk-ai-root.sk-open #sk-ai-btn { display: none !important; }
        #sk-ai-badge {
          position: absolute; top: 4px; right: 4px;
          width: 10px; height: 10px; background: #22C55E;
          border-radius: 50%; border: 2px solid #06101E;
          animation: sk-blink 1.4s ease-out infinite;
        }

        #sk-ai-panel {
          position: fixed; right: 18px; bottom: 84px; z-index: 2147483645;
          width: 360px; max-width: calc(100vw - 24px);
          height: 520px; max-height: min(520px, calc(100vh - 110px));
          background: #071422;
          border: 1px solid rgba(0,200,232,.16);
          border-radius: 16px;
          overflow: hidden;
          display: none;
          flex-direction: column;
          box-shadow: 0 24px 60px rgba(0,0,0,.45);
        }
        #sk-ai-panel.open { display: flex; }

        #sk-ai-header {
          flex: 0 0 auto;
          padding: 12px 14px;
          display: flex; align-items: center; gap: 10px;
          background: #0B1B2E;
          border-bottom: 1px solid rgba(0,200,232,.1);
        }
        #sk-ai-avatar {
          width: 34px; height: 34px; border-radius: 9px;
          background: #00C8E8; color: #06101E;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; flex-shrink: 0;
        }
        #sk-ai-header-info { flex: 1; min-width: 0; }
        #sk-ai-header-name { color: #F2F8FF; font-size: 14px; font-weight: 600; letter-spacing: .2px; }
        #sk-ai-header-status { color: #7AA0B8; font-size: 11px; margin-top: 1px; display:flex; align-items:center; gap:6px; }
        #sk-ai-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #22C55E;
          box-shadow: 0 0 0 0 rgba(34,197,94,.7);
          animation: sk-blink 1.4s ease-out infinite;
          flex-shrink: 0;
        }
        @keyframes sk-blink {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,.7); }
          70% { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        #sk-ai-close {
          background: transparent; border: 0; color: #8BA3B8;
          width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 20px;
        }

        #sk-ai-messages {
          flex: 1 1 auto; min-height: 0;
          overflow-y: auto; padding: 14px 12px;
          display: flex; flex-direction: column; gap: 10px;
          -webkit-overflow-scrolling: touch;
        }
        .sk-msg {
          max-width: 88%; padding: 10px 12px; border-radius: 12px;
          font-size: 13.5px; line-height: 1.55; color: #E7F2FA;
          white-space: pre-wrap; word-break: break-word;
        }
        .sk-msg.bot { background: #102033; align-self: flex-start; border-bottom-left-radius: 4px; }
        .sk-msg.user { background: #00C8E8; color: #06101E; align-self: flex-end; border-bottom-right-radius: 4px; font-weight: 500; }
        .sk-msg.typing { color: #7AA0B8; font-style: italic; }
        .sk-msg.bot a { color: #6FE3FF; text-decoration: underline; }
        .sk-msg.bot ul.sk-list { margin: 4px 0; padding-left: 18px; }
        .sk-msg.bot ul.sk-list li { margin: 2px 0; }

        .sk-feedback, .sk-continue { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .sk-fb-btn, .sk-c-btn {
          background: #0B1B2E; border: 1px solid rgba(0,200,232,.22);
          color: #B7D4E4; font-size: 12px; padding: 6px 10px; border-radius: 999px;
          cursor: pointer; font-family: inherit;
        }
        .sk-c-btn.close { border-color: rgba(255,255,255,.12); color: #9BB3C4; }
        .sk-fb-btn.done { opacity: .5; pointer-events: none; }

        #sk-ai-input-area {
          flex: 0 0 auto;
          display: flex; align-items: center; gap: 8px;
          padding: 10px 10px calc(10px + env(safe-area-inset-bottom, 0px));
          background: #0B1B2E;
          border-top: 1px solid rgba(0,200,232,.1);
        }
        #sk-ai-input {
          flex: 1 1 auto; min-width: 0;
          height: 42px; max-height: 88px;
          background: #102033; color: #F2F8FF;
          border: 1px solid rgba(0,200,232,.18);
          border-radius: 10px; padding: 10px 12px;
          font-size: 16px; line-height: 1.35; font-family: inherit;
          resize: none; outline: none;
        }
        #sk-ai-send {
          flex: 0 0 42px; width: 42px; height: 42px; border: 0; border-radius: 10px;
          background: #00C8E8; color: #06101E; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        #sk-ai-send:disabled { opacity: .4; }
        #sk-ai-send svg { width: 16px; height: 16px; fill: #06101E; }

        @media (max-width: 640px) {
          #sk-ai-btn { bottom: 14px; right: 14px; width: 52px; height: 52px; }
          #sk-ai-panel {
            right: 10px; left: 10px; bottom: 74px;
            width: auto; max-width: none;
            height: 62vh; max-height: 480px;
            border-radius: 16px;
          }
        }
      </style>

      <button id="sk-ai-btn" aria-label="Open SmartKembo AI">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
        <span id="sk-ai-badge"></span>
      </button>
      <div id="sk-ai-panel">
        <div id="sk-ai-header">
          <div id="sk-ai-avatar">💬</div>
          <div id="sk-ai-header-info">
            <div id="sk-ai-header-name">${BOT_NAME}</div>
            <div id="sk-ai-header-status"><span id="sk-ai-dot"></span> Online · SMD's SmartKembo</div>
          </div>
          <button id="sk-ai-close" aria-label="Close">×</button>
        </div>
        <div id="sk-ai-messages"></div>
        <div id="sk-ai-input-area">
          <textarea id="sk-ai-input" rows="1" placeholder="💬 Write a message… / Andika ujumbe…"></textarea>
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

    function fitMobileKeyboard() {
      if (!window.visualViewport || window.innerWidth > 640) {
        panel.style.bottom = '';
        return;
      }
      var vv = window.visualViewport;
      var covered = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      panel.style.bottom = (covered > 40 ? (covered + 8) : 74) + 'px';
    }
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', fitMobileKeyboard);
      window.visualViewport.addEventListener('scroll', fitMobileKeyboard);
    }

    let isOpen = false;
    let isSending = false;
    let idleTimer = null;
    const CLOSE_WORDS = ['hapana','no','nope','sitaki','enough','bas','basi','close','funga','stop',"that's all",'thats all','no thanks','sihitaji'];
    var browserLang = (navigator.language || 'en').toLowerCase();
    var preferSw = browserLang.indexOf('sw') === 0;

    function clearIdle() {
      if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
    }
    function startIdle() {
      clearIdle();
      idleTimer = setTimeout(function () { if (isOpen) endChat(true); }, 90000);
    }
    function setOpen(next) {
      isOpen = next;
      panel.classList.toggle('open', isOpen);
      root.classList.toggle('sk-open', isOpen);
      if (isOpen) {
        var badge = document.getElementById('sk-ai-badge');
        if (badge) badge.style.display = 'none';
        startIdle();
        setTimeout(function () { fitMobileKeyboard(); input.focus(); }, 40);
      } else {
        clearIdle();
        panel.style.bottom = '';
      }
    }
    function toggle() { setOpen(!isOpen); }

    function endChat(fromIdle) {
      clearIdle();
      addBotMessage(preferSw
        ? 'Asante. Mazungumzo yamefungwa.\nThank you. The chat is closed.'
        : 'Thank you. The chat is closed.\nAsante. Mazungumzo yamefungwa.');
      setTimeout(function () { setOpen(false); }, 1400);
    }

    function showContinuePrompt() {
      document.querySelectorAll('.sk-continue').forEach(function (el) { el.remove(); });
      var wrap = document.createElement('div');
      wrap.className = 'sk-msg bot';
      wrap.innerHTML =
        '<div>' + (preferSw ? 'Would you like to ask anything else?\nUna swali lingine?' : 'Would you like to ask anything else?\nUna swali lingine?') + '</div>' +
        '<div class="sk-continue">' +
          '<button type="button" class="sk-c-btn" data-act="yes">Yes</button>' +
          '<button type="button" class="sk-c-btn close" data-act="no">No, close</button>' +
        '</div>';
      messages.appendChild(wrap);
      messages.scrollTop = messages.scrollHeight;
      wrap.querySelector('[data-act="yes"]').onclick = function () { wrap.remove(); input.focus(); startIdle(); };
      wrap.querySelector('[data-act="no"]').onclick = function () { wrap.remove(); endChat(false); };
    }

    btn.addEventListener('click', toggle);
    closeBtn.addEventListener('click', toggle);

    addBotMessage(
      preferSw
        ? '👋 Hello. I am SmartKembo AI.\nHabari. Mimi ni SmartKembo AI.\n\nHow can I help you today?\nNaweza kukusaidiaje leo?\n\n📶 WiFi Vending\n💧 Water Vending\n🛒 Shop & POS\n💳 Pricing'
        : '👋 Hello. I am SmartKembo AI.\nHabari. Mimi ni SmartKembo AI.\n\nHow can I help you today?\nNaweza kukusaidiaje leo?\n\n📶 WiFi Vending\n💧 Water Vending\n🛒 Shop & POS\n💳 Pricing'
    );

    // Safe "lite markdown" renderer: escapes all HTML first (XSS-safe), then
    // turns **bold**, "- " bullets and bare URLs/phone numbers into real
    // markup instead of showing raw ** and - to the user (Gemini answers
    // often contain markdown even though the prompt asks it not to).
    function escapeHtml(s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
    function renderBotHTML(text) {
      const lines = String(text || '').split('\n');
      let html = '';
      let inList = false;
      for (const rawLine of lines) {
        const line = rawLine.trim();
        const isBullet = /^[-•]\s+/.test(line);
        if (isBullet) {
          if (!inList) { html += '<ul class="sk-list">'; inList = true; }
          html += '<li>' + inlineFormat(line.replace(/^[-•]\s+/, '')) + '</li>';
        } else {
          if (inList) { html += '</ul>'; inList = false; }
          if (line === '') html += '<br>';
          else html += '<div>' + inlineFormat(line) + '</div>';
        }
      }
      if (inList) html += '</ul>';
      return html;
    }
    function inlineFormat(line) {
      let s = escapeHtml(line);
      // **bold**
      s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      // bare URLs
      s = s.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
      // WhatsApp-style phone numbers -> tap to chat
      s = s.replace(/(\+255\s?\d{3}\s?\d{3}\s?\d{3})/g, function (m) {
        var digits = m.replace(/\D/g, '');
        return '<a href="https://wa.me/' + digits + '" target="_blank" rel="noopener noreferrer">' + m + '</a>';
      });
      return s;
    }

    function addBotMessage(text, messageId) {
      const div = document.createElement('div');
      div.className = 'sk-msg bot';
      div.innerHTML = renderBotHTML(text);
      if (messageId) {
        const fb = document.createElement('div');
        fb.className = 'sk-feedback';
        fb.innerHTML =
          '<button class="sk-fb-btn" data-fb="good" data-id="' + messageId + '">Helpful</button>' +
          '<button class="sk-fb-btn" data-fb="bad" data-id="' + messageId + '">Not helpful</button>';
        div.appendChild(fb);
        fb.querySelectorAll('.sk-fb-btn').forEach(function (b) {
          b.addEventListener('click', async function () {
            try {
              await fetch(API_BASE + '/api/chat/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId: b.dataset.id, feedback: b.dataset.fb })
              });
            } catch (e) {}
            fb.querySelectorAll('.sk-fb-btn').forEach(function (x) { x.classList.add('done'); });
            b.textContent = 'Saved';
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
      div.textContent = preferSw ? '⏳ Inafikiri…' : '⏳ Thinking…';
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
      input.style.height = '42px';
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
          body: JSON.stringify({ sessionId: getSessionId(), message: text })
        });
        const data = await res.json();
        removeTyping();
        if (data.success && data.data) addBotMessage(data.data.reply, data.data.messageId);
        else addBotMessage(data.message || 'Something went wrong. / Kuna hitilafu.');
        showContinuePrompt();
        startIdle();
      } catch (err) {
        removeTyping();
        addBotMessage('Cannot connect right now.\nSiwezi kuunganisha sasa.\nWhatsApp: +255 767 830 319');
        showContinuePrompt();
        startIdle();
      }
      isSending = false;
      sendBtn.disabled = false;
      input.focus();
    }

    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });
    input.addEventListener('input', function () {
      input.style.height = '42px';
      input.style.height = Math.min(input.scrollHeight, 88) + 'px';
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', createWidget);
  else createWidget();
})();
