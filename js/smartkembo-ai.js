/**
 * SmartKembo AI — Chat Widget
 * v2: polished "pro" visual redesign — same API/logic as before.
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

  function formatTime(d) {
    try {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }

  function createWidget() {
    if (document.getElementById('sk-ai-root')) return;

    const root = document.createElement('div');
    root.id = 'sk-ai-root';
    root.innerHTML = `
      <style>
        #sk-ai-root {
          --sk-accent: #00C8E8;
          --sk-accent-2: #00E0B8;
          --sk-bg: #071422;
          --sk-panel: #0A1929;
          --sk-header: #0B1B2E;
          --sk-bubble-bot: #10233A;
          --sk-border: rgba(0, 200, 232, 0.14);
          --sk-text: #EAF4FB;
          --sk-text-dim: #85A3B8;
          font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
          z-index: 2147483000;
        }
        #sk-ai-root * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

        /* ---------- Launcher button ---------- */
        #sk-ai-btn {
          position: fixed; bottom: 20px; right: 20px; z-index: 2147483646;
          width: 58px; height: 58px; border-radius: 50%;
          background: linear-gradient(145deg, var(--sk-accent), var(--sk-accent-2));
          border: none; cursor: pointer;
          box-shadow: 0 8px 24px rgba(0, 200, 232, .38), 0 2px 6px rgba(0,0,0,.25);
          display: flex; align-items: center; justify-content: center;
          transition: transform .18s ease, box-shadow .18s ease;
        }
        #sk-ai-btn:hover { transform: translateY(-2px) scale(1.04); box-shadow: 0 12px 30px rgba(0,200,232,.48); }
        #sk-ai-btn:active { transform: scale(.94); }
        #sk-ai-btn svg { width: 25px; height: 25px; fill: #06101E; }
        #sk-ai-root.sk-open #sk-ai-btn { display: none !important; }
        #sk-ai-badge {
          position: absolute; top: 3px; right: 3px;
          width: 11px; height: 11px; background: #22C55E;
          border-radius: 50%; border: 2px solid var(--sk-bg);
          animation: sk-blink 1.6s ease-out infinite;
        }

        /* ---------- Panel ---------- */
        #sk-ai-panel {
          position: fixed; right: 20px; bottom: 88px; z-index: 2147483645;
          width: 372px; max-width: calc(100vw - 24px);
          height: 560px; max-height: min(560px, calc(100vh - 112px));
          background: linear-gradient(180deg, var(--sk-panel) 0%, var(--sk-bg) 100%);
          border: 1px solid var(--sk-border);
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 30px 70px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.02);
          opacity: 0; visibility: hidden; transform: translateY(14px) scale(.97);
          transform-origin: bottom right;
          transition: opacity .2s ease, transform .22s cubic-bezier(.2,.9,.3,1.2), visibility 0s linear .22s;
        }
        #sk-ai-panel.open {
          opacity: 1; visibility: visible; transform: translateY(0) scale(1);
          transition: opacity .22s ease, transform .24s cubic-bezier(.2,.9,.3,1.2), visibility 0s linear 0s;
        }

        /* ---------- Header ---------- */
        #sk-ai-header {
          flex: 0 0 auto;
          padding: 14px 14px;
          display: flex; align-items: center; gap: 11px;
          background: linear-gradient(135deg, var(--sk-header), #0D2338);
          border-bottom: 1px solid var(--sk-border);
          position: relative;
        }
        #sk-ai-header::after {
          content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 1px;
          background: linear-gradient(90deg, transparent, var(--sk-accent), transparent);
          opacity: .5;
        }
        #sk-ai-avatar {
          width: 38px; height: 38px; border-radius: 12px;
          background: linear-gradient(145deg, var(--sk-accent), var(--sk-accent-2));
          color: #06101E;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0,200,232,.3);
        }
        #sk-ai-header-info { flex: 1; min-width: 0; }
        #sk-ai-header-name {
          color: #FFFFFF; font-size: 14.5px; font-weight: 700; letter-spacing: .1px;
          display: flex; align-items: center; gap: 6px;
        }
        #sk-ai-header-badge {
          font-size: 9px; font-weight: 700; letter-spacing: .4px;
          color: #06101E; background: linear-gradient(90deg, var(--sk-accent), var(--sk-accent-2));
          padding: 1.5px 6px; border-radius: 999px; text-transform: uppercase;
        }
        #sk-ai-header-status { color: var(--sk-text-dim); font-size: 11.5px; margin-top: 2px; display:flex; align-items:center; gap:6px; }
        #sk-ai-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #22C55E;
          box-shadow: 0 0 0 0 rgba(34,197,94,.7);
          animation: sk-blink 1.6s ease-out infinite;
          flex-shrink: 0;
        }
        @keyframes sk-blink {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,.65); }
          70% { box-shadow: 0 0 0 7px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        #sk-ai-close {
          background: rgba(255,255,255,.05); border: 0; color: #A9C0D2;
          width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 18px;
          display: flex; align-items: center; justify-content: center;
          transition: background .15s ease, color .15s ease;
        }
        #sk-ai-close:hover { background: rgba(255,255,255,.12); color: #fff; }

        /* ---------- Messages ---------- */
        #sk-ai-messages {
          flex: 1 1 auto; min-height: 0;
          overflow-y: auto; padding: 16px 13px;
          display: flex; flex-direction: column; gap: 14px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin; scrollbar-color: rgba(0,200,232,.35) transparent;
        }
        #sk-ai-messages::-webkit-scrollbar { width: 6px; }
        #sk-ai-messages::-webkit-scrollbar-track { background: transparent; }
        #sk-ai-messages::-webkit-scrollbar-thumb { background: rgba(0,200,232,.3); border-radius: 999px; }

        .sk-row { display: flex; align-items: flex-end; gap: 8px; max-width: 100%; }
        .sk-row.user { flex-direction: row-reverse; }
        .sk-row-avatar {
          width: 26px; height: 26px; border-radius: 9px; flex-shrink: 0;
          background: linear-gradient(145deg, var(--sk-accent), var(--sk-accent-2));
          display: flex; align-items: center; justify-content: center; font-size: 13px;
          margin-bottom: 2px;
        }
        .sk-bubble-col { display: flex; flex-direction: column; max-width: 82%; }
        .sk-row.user .sk-bubble-col { align-items: flex-end; }

        .sk-msg {
          padding: 10px 13px; border-radius: 15px;
          font-size: 13.6px; line-height: 1.58; color: var(--sk-text);
          word-break: break-word;
          animation: sk-pop .22s cubic-bezier(.2,.9,.3,1.2);
        }
        @keyframes sk-pop {
          from { opacity: 0; transform: translateY(6px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .sk-msg.bot {
          background: var(--sk-bubble-bot);
          border: 1px solid rgba(255,255,255,.04);
          border-bottom-left-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,.18);
        }
        .sk-msg.user {
          background: linear-gradient(135deg, var(--sk-accent), var(--sk-accent-2));
          color: #06101E; border-bottom-right-radius: 4px; font-weight: 500;
          box-shadow: 0 3px 10px rgba(0,200,232,.28);
        }
        .sk-msg.bot a { color: #6FE3FF; text-decoration: underline; text-underline-offset: 2px; }
        .sk-msg.bot ul.sk-list { margin: 4px 0; padding-left: 18px; }
        .sk-msg.bot ul.sk-list li { margin: 3px 0; }
        .sk-time { font-size: 10px; color: var(--sk-text-dim); margin: 3px 4px 0; }

        /* ---------- Typing indicator ---------- */
        .sk-typing-bubble {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 12px 14px;
        }
        .sk-typing-bubble span {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--sk-text-dim);
          animation: sk-dot 1.1s ease-in-out infinite;
        }
        .sk-typing-bubble span:nth-child(2) { animation-delay: .15s; }
        .sk-typing-bubble span:nth-child(3) { animation-delay: .3s; }
        @keyframes sk-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: .5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }

        /* ---------- Feedback / continue pills ---------- */
        .sk-feedback, .sk-continue { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 9px; }
        .sk-fb-btn, .sk-c-btn {
          background: rgba(255,255,255,.04); border: 1px solid var(--sk-border);
          color: #B7D4E4; font-size: 11.5px; padding: 6px 11px; border-radius: 999px;
          cursor: pointer; font-family: inherit; transition: background .15s ease, border-color .15s ease;
        }
        .sk-fb-btn:hover, .sk-c-btn:hover { background: rgba(0,200,232,.1); border-color: rgba(0,200,232,.4); }
        .sk-c-btn.close { border-color: rgba(255,255,255,.12); color: #9BB3C4; }
        .sk-fb-btn.done { opacity: .55; pointer-events: none; }

        /* ---------- Input area ---------- */
        #sk-ai-input-area {
          flex: 0 0 auto;
          display: flex; align-items: flex-end; gap: 9px;
          padding: 11px 12px calc(11px + env(safe-area-inset-bottom, 0px));
          background: var(--sk-header);
          border-top: 1px solid var(--sk-border);
        }
        #sk-ai-input-wrap {
          flex: 1 1 auto; min-width: 0;
          background: var(--sk-bubble-bot);
          border: 1px solid rgba(0,200,232,.16);
          border-radius: 14px;
          padding: 2px 4px 2px 13px;
          display: flex; align-items: center;
          transition: border-color .15s ease, box-shadow .15s ease;
        }
        #sk-ai-input-wrap:focus-within {
          border-color: rgba(0,200,232,.55);
          box-shadow: 0 0 0 3px rgba(0,200,232,.12);
        }
        #sk-ai-input {
          flex: 1 1 auto; min-width: 0;
          height: 40px; max-height: 92px;
          background: transparent; color: var(--sk-text);
          border: 0; padding: 9px 4px;
          font-size: 16px; line-height: 1.35; font-family: inherit;
          resize: none; outline: none;
        }
        #sk-ai-input::placeholder { color: var(--sk-text-dim); }
        #sk-ai-send {
          flex: 0 0 40px; width: 40px; height: 40px; border: 0; border-radius: 11px;
          background: linear-gradient(145deg, var(--sk-accent), var(--sk-accent-2));
          color: #06101E; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 3px 10px rgba(0,200,232,.3);
          transition: transform .15s ease, opacity .15s ease;
        }
        #sk-ai-send:hover:not(:disabled) { transform: translateY(-1px) scale(1.04); }
        #sk-ai-send:active:not(:disabled) { transform: scale(.92); }
        #sk-ai-send:disabled { opacity: .35; box-shadow: none; cursor: default; }
        #sk-ai-send svg { width: 16px; height: 16px; fill: #06101E; margin-left: 1px; }

        #sk-ai-footer-note {
          text-align: center; font-size: 9.5px; color: var(--sk-text-dim);
          padding: 6px 0 9px; letter-spacing: .2px;
        }

        @media (max-width: 640px) {
          #sk-ai-btn { bottom: 14px; right: 14px; width: 54px; height: 54px; }
          #sk-ai-panel {
            right: 8px; left: 8px; bottom: 76px;
            width: auto; max-width: none;
            height: 64vh; max-height: 500px;
            border-radius: 18px;
          }
        }
      </style>

      <button id="sk-ai-btn" aria-label="Open SmartKembo AI">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
        <span id="sk-ai-badge"></span>
      </button>
      <div id="sk-ai-panel">
        <div id="sk-ai-header">
          <div id="sk-ai-avatar">✨</div>
          <div id="sk-ai-header-info">
            <div id="sk-ai-header-name">${BOT_NAME} <span id="sk-ai-header-badge">AI</span></div>
            <div id="sk-ai-header-status"><span id="sk-ai-dot"></span> Online · SMD's SmartKembo</div>
          </div>
          <button id="sk-ai-close" aria-label="Close">×</button>
        </div>
        <div id="sk-ai-messages"></div>
        <div id="sk-ai-input-area">
          <div id="sk-ai-input-wrap">
            <textarea id="sk-ai-input" rows="1" placeholder="Andika ujumbe… / Write a message…"></textarea>
          </div>
          <button id="sk-ai-send" aria-label="Send">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
        <div id="sk-ai-footer-note">Powered by SmartKembo AI</div>
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
      panel.style.bottom = (covered > 40 ? (covered + 8) : 76) + 'px';
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
    // Touch devices have no real Shift key — treating Enter as "send" there
    // meant the message went out the instant someone tried a new line.
    var isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

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
        setTimeout(function () { fitMobileKeyboard(); input.focus(); }, 60);
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
      wrap.className = 'sk-row bot';
      wrap.innerHTML =
        '<div class="sk-row-avatar">🤖</div>' +
        '<div class="sk-bubble-col">' +
          '<div class="sk-msg bot">' +
            '<div>' + (preferSw ? 'Would you like to ask anything else?\nUna swali lingine?' : 'Would you like to ask anything else?\nUna swali lingine?') + '</div>' +
            '<div class="sk-continue">' +
              '<button type="button" class="sk-c-btn" data-act="yes">Yes</button>' +
              '<button type="button" class="sk-c-btn close" data-act="no">No, close</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      messages.appendChild(wrap);
      messages.scrollTop = messages.scrollHeight;
      wrap.querySelector('[data-act="yes"]').onclick = function () { wrap.remove(); input.focus(); startIdle(); };
      wrap.querySelector('[data-act="no"]').onclick = function () { wrap.remove(); endChat(false); };
    }

    btn.addEventListener('click', toggle);
    closeBtn.addEventListener('click', toggle);

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
      const row = document.createElement('div');
      row.className = 'sk-row bot';

      const avatar = document.createElement('div');
      avatar.className = 'sk-row-avatar';
      avatar.textContent = '🤖';

      const col = document.createElement('div');
      col.className = 'sk-bubble-col';

      const div = document.createElement('div');
      div.className = 'sk-msg bot';
      div.innerHTML = renderBotHTML(text);
      col.appendChild(div);

      if (messageId) {
        const fb = document.createElement('div');
        fb.className = 'sk-feedback';
        fb.innerHTML =
          '<button class="sk-fb-btn" data-fb="good" data-id="' + messageId + '">👍 Helpful</button>' +
          '<button class="sk-fb-btn" data-fb="bad" data-id="' + messageId + '">👎 Not helpful</button>';
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
            b.textContent = '✓ Saved';
          });
        });
      }

      const time = document.createElement('div');
      time.className = 'sk-time';
      time.textContent = formatTime(new Date());
      col.appendChild(time);

      row.appendChild(avatar);
      row.appendChild(col);
      messages.appendChild(row);
      messages.scrollTop = messages.scrollHeight;
    }

    function addUserMessage(text) {
      const row = document.createElement('div');
      row.className = 'sk-row user';

      const col = document.createElement('div');
      col.className = 'sk-bubble-col';

      const div = document.createElement('div');
      div.className = 'sk-msg user';
      div.textContent = text;
      col.appendChild(div);

      const time = document.createElement('div');
      time.className = 'sk-time';
      time.textContent = formatTime(new Date());
      col.appendChild(time);

      row.appendChild(col);
      messages.appendChild(row);
      messages.scrollTop = messages.scrollHeight;
    }

    function addTyping() {
      const row = document.createElement('div');
      row.className = 'sk-row bot';
      row.id = 'sk-typing';

      const avatar = document.createElement('div');
      avatar.className = 'sk-row-avatar';
      avatar.textContent = '🤖';

      const bubble = document.createElement('div');
      bubble.className = 'sk-msg bot sk-typing-bubble';
      bubble.innerHTML = '<span></span><span></span><span></span>';

      row.appendChild(avatar);
      row.appendChild(bubble);
      messages.appendChild(row);
      messages.scrollTop = messages.scrollHeight;
    }
    function removeTyping() {
      const t = document.getElementById('sk-typing');
      if (t) t.remove();
    }

    addBotMessage(
      preferSw
        ? '👋 Hello. I am SmartKembo AI.\nHabari. Mimi ni SmartKembo AI.\n\nHow can I help you today?\nNaweza kukusaidiaje leo?\n\n📶 WiFi Vending\n💧 Water Vending\n🛒 Shop & POS\n💳 Pricing'
        : '👋 Hello. I am SmartKembo AI.\nHabari. Mimi ni SmartKembo AI.\n\nHow can I help you today?\nNaweza kukusaidiaje leo?\n\n📶 WiFi Vending\n💧 Water Vending\n🛒 Shop & POS\n💳 Pricing'
    );

    async function send() {
      const text = input.value.trim();
      if (!text || isSending) return;
      isSending = true;
      sendBtn.disabled = true;
      input.value = '';
      input.style.height = '40px';
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
      if (e.isComposing) return; // don't hijack Enter during autocomplete/IME
      if (e.key === 'Enter' && !e.shiftKey && !isTouch) { e.preventDefault(); send(); }
      // On touch devices, Enter inserts a newline as normal; sending is
      // done via the send button.
    });
    input.addEventListener('input', function () {
      input.style.height = '40px';
      input.style.height = Math.min(input.scrollHeight, 92) + 'px';
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', createWidget);
  else createWidget();
})();
