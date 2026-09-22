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

    // Interface language: auto-detected from the device/browser locale
    // (navigator.language), applied consistently to every label, greeting
    // and message in the widget — not a bilingual mash-up of both.
    var browserLang = (navigator.language || 'en').toLowerCase();
    var preferSw = browserLang.indexOf('sw') === 0;
    var STR_SW = {
      headerStatus: "Mtandaoni · SMD's SmartKembo",
      placeholder: 'Andika ujumbe…',
      greeting: '👋 Habari! Mimi ni SmartKembo AI.\n\nNaweza kukusaidiaje leo?\n\n📶 WiFi Vending\n💧 Water Vending\n🛒 Duka & POS\n💳 Bei',
      continuePrompt: 'Una swali lingine?',
      yes: 'Ndiyo',
      no: 'Hapana, funga',
      closeMsg: 'Asante. Mazungumzo yamefungwa.',
      cannotConnect: 'Siwezi kuunganisha sasa.\nWhatsApp: +255 767 830 319',
      genericError: 'Kuna hitilafu. Jaribu tena.',
      helpful: '👍 Msaada',
      notHelpful: '👎 Haikusaidia',
      savedGood: '✓ Asante',
      savedBad: '✓ Tumepokea',
      footer: 'Inaendeshwa na SmartKembo AI',
      // Fomu KAMILI ya kujiunga (sio jina+namba tu) — inafanana na fomu
      // halisi ya "Apply" ya website, na inatuma kwenye /api/applications
      // ile ile (Super Admin anaikagua kwenye "Applications" kama kawaida).
      joinPrompt: 'Karibu SmartKembo! Jaza fomu fupi kujiunga:',
      joinNamePh: 'Jina lako kamili',
      joinBusinessPh: 'Jina la biashara yako',
      joinEmailPh: 'Barua pepe',
      joinPhonePh: 'Namba ya simu (mfano 07XXXXXXXX)',
      joinLocationPh: 'Eneo (mfano: Kinondoni, Dar es Salaam)',
      joinPlanLabel: 'Plan unayopendelea',
      joinSubmit: 'Tuma Ombi',
      joinSending: 'Inatuma…',
      joinInvalidName: 'Jina linahitajika.',
      joinInvalidBusiness: 'Jina la biashara linahitajika.',
      joinInvalidEmail: 'Weka barua pepe sahihi.',
      joinInvalidPhone: 'Namba ya simu ianze na 06 au 07 na iwe na tarakimu 10 (mfano 07XXXXXXXX).',
      joinInvalidLocation: 'Eneo linahitajika.',
      handoffMsg: 'Samahani, inaonekana sijakusaidia vizuri. Ungependa kuongea moja kwa moja na mtu wa timu yetu?',
      handoffBtn: '💬 Ongea na binadamu (WhatsApp)'
    };
    var STR_EN = {
      headerStatus: "Online · SMD's SmartKembo",
      placeholder: 'Write a message…',
      greeting: '👋 Hello! I am SmartKembo AI.\n\nHow can I help you today?\n\n📶 WiFi Vending\n💧 Water Vending\n🛒 Shop & POS\n💳 Pricing',
      continuePrompt: 'Would you like to ask anything else?',
      yes: 'Yes',
      no: 'No, close',
      closeMsg: 'Thank you. The chat is closed.',
      cannotConnect: 'Cannot connect right now.\nWhatsApp: +255 767 830 319',
      genericError: 'Something went wrong. Please try again.',
      helpful: '👍 Helpful',
      notHelpful: '👎 Not helpful',
      savedGood: '✓ Saved',
      savedBad: '✓ Noted',
      footer: 'Powered by SmartKembo AI',
      joinPrompt: 'Welcome to SmartKembo! Fill this short form to join:',
      joinNamePh: 'Your full name',
      joinBusinessPh: 'Your business name',
      joinEmailPh: 'Email address',
      joinPhonePh: 'Phone number (e.g. 07XXXXXXXX)',
      joinLocationPh: 'Location (e.g. Kinondoni, Dar es Salaam)',
      joinPlanLabel: 'Preferred plan',
      joinSubmit: 'Submit Application',
      joinSending: 'Sending…',
      joinInvalidName: 'Name is required.',
      joinInvalidBusiness: 'Business name is required.',
      joinInvalidEmail: 'Please enter a valid email.',
      joinInvalidPhone: 'Phone must start with 06 or 07 and have 10 digits (e.g. 07XXXXXXXX).',
      joinInvalidLocation: 'Location is required.',
      handoffMsg: "Sorry, it seems I haven't helped much. Would you like to talk directly to someone on our team?",
      handoffBtn: '💬 Talk to a human (WhatsApp)'
    };
    var STR = preferSw ? STR_SW : STR_EN;
    // Lugha ya vipengele vinavyotokea PAKATI ya mazungumzo (fomu ya
    // kujiunga, handoff, feedback, "una swali lingine") inafuata LUGHA
    // HALISI ya mazungumzo (kile alichoandika mtu, kinachogunduliwa na
    // backend kwa kila ujumbe) — si mpangilio wa kifaa. Kwa mfano simu
    // ya Kiingereza + mtu anayeandika Kiswahili → vipengele hivi
    // vitaonekana kwa Kiswahili, sio Kiingereza, kwa sababu ndivyo
    // mazungumzo yenyewe yanavyokwenda.
    var lastDetectedLang = preferSw ? 'sw' : 'en';
    function dynStr() { return lastDetectedLang === 'sw' ? STR_SW : STR_EN; }

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
        a.sk-c-btn { text-decoration: none; display: inline-block; }

        /* ---------- Inline lead-capture form ---------- */
        .sk-lead-input {
          width: 100%; background: rgba(255,255,255,.05); border: 1px solid rgba(0,200,232,.2);
          border-radius: 9px; color: var(--sk-text); font: 13px/1.4 inherit; padding: 8px 10px;
          outline: none; margin-top: 6px;
        }
        .sk-lead-input:first-of-type { margin-top: 2px; }
        .sk-lead-input:focus { border-color: rgba(0,200,232,.55); }
        .sk-lead-submit { width: 100%; margin-top: 8px; text-align: center; }
        .sk-lead-status { margin-top: 6px; font-size: 11px; color: var(--sk-text-dim); min-height: 14px; }

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
            <div id="sk-ai-header-status"><span id="sk-ai-dot"></span> ${STR.headerStatus}</div>
          </div>
          <button id="sk-ai-close" aria-label="Close">×</button>
        </div>
        <div id="sk-ai-messages"></div>
        <div id="sk-ai-input-area">
          <div id="sk-ai-input-wrap">
            <textarea id="sk-ai-input" rows="1" placeholder="${STR.placeholder}"></textarea>
          </div>
          <button id="sk-ai-send" aria-label="Send">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
        <div id="sk-ai-footer-note">${STR.footer}</div>
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
    // Mfululizo wa majibu yenye confidence=0 (AI "haijui") — likifika 2,
    // tunapendekeza "ongea na binadamu" badala ya kumwacha mtu akizungushwa.
    let lowConfidenceStreak = 0;
    const CLOSE_WORDS = ['hapana','no','nope','sitaki','enough','bas','basi','close','funga','stop',"that's all",'thats all','no thanks','sihitaji'];
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
      addBotMessage(STR.closeMsg);
      setTimeout(function () { setOpen(false); }, 1400);
    }

    function showContinuePrompt() {
      document.querySelectorAll('.sk-continue').forEach(function (el) { el.remove(); });
      var S = dynStr();
      var wrap = document.createElement('div');
      wrap.className = 'sk-row bot';
      wrap.innerHTML =
        '<div class="sk-row-avatar">🤖</div>' +
        '<div class="sk-bubble-col">' +
          '<div class="sk-msg bot">' +
            '<div>' + S.continuePrompt + '</div>' +
            '<div class="sk-continue">' +
              '<button type="button" class="sk-c-btn" data-act="yes">' + S.yes + '</button>' +
              '<button type="button" class="sk-c-btn close" data-act="no">' + S.no + '</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      messages.appendChild(wrap);
      messages.scrollTop = messages.scrollHeight;
      wrap.querySelector('[data-act="yes"]').onclick = function () { wrap.remove(); input.focus(); startIdle(); };
      wrap.querySelector('[data-act="no"]').onclick = function () { wrap.remove(); endChat(false); };
    }

    function showHandoffPrompt(lastUserText) {
      var S = dynStr();
      var wrap = document.createElement('div');
      wrap.className = 'sk-row bot';
      var waMsg = (lastDetectedLang === 'sw' ? 'Habari, nilikuwa naongea na SmartKembo AI kuhusu: ' : 'Hi, I was chatting with SmartKembo AI about: ') + (lastUserText || '');
      var waHref = 'https://wa.me/255767830319?text=' + encodeURIComponent(waMsg);
      wrap.innerHTML =
        '<div class="sk-row-avatar">🤖</div>' +
        '<div class="sk-bubble-col">' +
          '<div class="sk-msg bot">' +
            '<div>' + S.handoffMsg + '</div>' +
            '<div class="sk-continue">' +
              '<a class="sk-c-btn" href="' + waHref + '" target="_blank" rel="noopener noreferrer">' + S.handoffBtn + '</a>' +
            '</div>' +
          '</div>' +
        '</div>';
      messages.appendChild(wrap);
      messages.scrollTop = messages.scrollHeight;
    }

    // Inagundua ni MODULE gani (WiFi/Maji/Duka) mtu alikuwa akiongea
    // kuihusu, ili tuweke maelezo ya ziada kwenye "message" ya ombi lake
    // la kujiunga — bila kumuuliza swali la ziada kwenye fomu.
    function detectInterest(text) {
      var t = String(text || '').toLowerCase();
      if (/wifi|mtandao|internet|router|mikrotik|voucher/.test(t)) return 'WiFi';
      if (/maji|water|swv|tokeni|rfid|valve|lita/.test(t)) return 'Water';
      if (/duka|shop|pos|bidhaa|stock|mauzo/.test(t)) return 'Shop';
      return '';
    }

    // Fomu KAMILI ya kujiunga — sawa na ile ya website ("Apply"), inatuma
    // moja kwa moja kwenye /api/applications HALISI. Hii inamaanisha
    // mtu anaweza "kujiunga kabisa" akiwa ndani ya chat, bila kuondoka
    // kwenda ukurasa mwingine — Super Admin ataona ombi lake kwenye
    // "Applications" kama maombi mengine yoyote (idhini bado inahitajika,
    // sawa kabisa na njia ya kawaida).
    function showJoinForm(interestHint) {
      var S = dynStr();
      var wrap = document.createElement('div');
      wrap.className = 'sk-row bot';
      wrap.innerHTML =
        '<div class="sk-row-avatar">🤖</div>' +
        '<div class="sk-bubble-col">' +
          '<div class="sk-msg bot sk-lead-form">' +
            '<div style="margin-bottom:6px;">' + S.joinPrompt + '</div>' +
            '<input type="text" class="sk-lead-input" data-f="name" placeholder="' + S.joinNamePh + '">' +
            '<input type="text" class="sk-lead-input" data-f="businessName" placeholder="' + S.joinBusinessPh + '">' +
            '<input type="email" class="sk-lead-input" data-f="email" placeholder="' + S.joinEmailPh + '">' +
            '<input type="tel" class="sk-lead-input" data-f="phone" placeholder="' + S.joinPhonePh + '">' +
            '<input type="text" class="sk-lead-input" data-f="location" placeholder="' + S.joinLocationPh + '">' +
            '<select class="sk-lead-input" data-f="planInterest">' +
              '<option value="Basic">Basic</option>' +
              '<option value="Pro">Pro</option>' +
              '<option value="Enterprise">Enterprise</option>' +
            '</select>' +
            '<button type="button" class="sk-c-btn sk-lead-submit" style="margin-top:8px;width:100%;">' + S.joinSubmit + '</button>' +
            '<div class="sk-lead-status"></div>' +
          '</div>' +
        '</div>';
      messages.appendChild(wrap);
      messages.scrollTop = messages.scrollHeight;

      var box = wrap.querySelector('.sk-lead-form');
      var f = {};
      ['name', 'businessName', 'email', 'phone', 'location', 'planInterest'].forEach(function (k) {
        f[k] = wrap.querySelector('[data-f="' + k + '"]');
      });
      var statusEl = wrap.querySelector('.sk-lead-status');

      wrap.querySelector('.sk-lead-submit').addEventListener('click', async function () {
        var name = f.name.value.trim();
        var businessName = f.businessName.value.trim();
        var email = f.email.value.trim();
        var phone = f.phone.value.trim();
        var location = f.location.value.trim();
        var planInterest = f.planInterest.value;

        if (name.length < 2) { statusEl.textContent = S.joinInvalidName; return; }
        if (businessName.length < 2) { statusEl.textContent = S.joinInvalidBusiness; return; }
        if (!/^\S+@\S+\.\S+$/.test(email)) { statusEl.textContent = S.joinInvalidEmail; return; }
        if (!/^0[67]\d{8}$/.test(phone)) { statusEl.textContent = S.joinInvalidPhone; return; }
        if (location.length < 2) { statusEl.textContent = S.joinInvalidLocation; return; }

        statusEl.textContent = S.joinSending;
        try {
          var res = await fetch(API_BASE + '/api/applications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: name,
              businessName: businessName,
              email: email,
              phone: phone,
              location: location,
              planInterest: planInterest,
              message: interestHint ? ('Anavutiwa na: ' + interestHint + ' (kupitia SmartKembo AI)') : 'Kupitia SmartKembo AI'
            })
          });
          var data = await res.json();
          if (data.success) {
            box.innerHTML = '<div>✅ ' + escapeHtml(data.message || (S === STR_SW ? 'Ombi lako limepokelewa!' : 'Your application was received!')) + '</div>';
          } else {
            statusEl.textContent = data.message || S.joinInvalidEmail;
          }
        } catch (e) {
          statusEl.textContent = S.cannotConnect;
        }
      });
      messages.scrollTop = messages.scrollHeight;
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
      const b = startBotBubble();
      finalizeBotBubble(b, text, messageId);
      return b;
    }

    // Huanzisha "bubble" tupu ya bot (kwa streaming: tunaijaza taratibu
    // kadri maneno yanavyofika badala ya kuandika yote mara moja).
    function startBotBubble() {
      const row = document.createElement('div');
      row.className = 'sk-row bot';

      const avatar = document.createElement('div');
      avatar.className = 'sk-row-avatar';
      avatar.textContent = '🤖';

      const col = document.createElement('div');
      col.className = 'sk-bubble-col';

      const div = document.createElement('div');
      div.className = 'sk-msg bot';
      col.appendChild(div);

      row.appendChild(avatar);
      row.appendChild(col);
      messages.appendChild(row);
      messages.scrollTop = messages.scrollHeight;
      return { row: row, col: col, bubble: div };
    }

    // Huweka maandishi ya mwisho (kamili) kwenye bubble iliyoanzishwa na
    // startBotBubble, na kuongeza vitufe vya feedback + muhuri wa saa.
    function finalizeBotBubble(b, text, messageId) {
      b.bubble.innerHTML = renderBotHTML(text);
      var S = dynStr();

      if (messageId) {
        const fb = document.createElement('div');
        fb.className = 'sk-feedback';
        fb.innerHTML =
          '<button class="sk-fb-btn" data-fb="good">' + S.helpful + '</button>' +
          '<button class="sk-fb-btn" data-fb="bad">' + S.notHelpful + '</button>';
        b.bubble.appendChild(fb);
        fb.querySelectorAll('.sk-fb-btn').forEach(function (btn) {
          btn.addEventListener('click', async function () {
            try {
              await fetch(API_BASE + '/api/chat/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId: messageId, feedback: btn.dataset.fb })
              });
            } catch (e) {}
            fb.querySelectorAll('.sk-fb-btn').forEach(function (x) { x.classList.add('done'); });
            btn.textContent = btn.dataset.fb === 'good' ? S.savedGood : S.savedBad;
          });
        });
      }

      const time = document.createElement('div');
      time.className = 'sk-time';
      time.textContent = formatTime(new Date());
      b.col.appendChild(time);
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

    addBotMessage(STR.greeting);

    // Inasoma jibu la /api/chat/stream (Server-Sent Events) neno kwa neno.
    // onDelta(chunk) inaitwa kila neno linapofika; onDone(meta) mwishoni
    // (meta ina messageId, conversationId, confidence, showLeadForm);
    // onError(e) ikiwa kuna hitilafu — hata hapo, chochote kilichokwisha
    // andikwa (onDelta) kinabaki kwenye skrini.
    async function streamChat(text, onDelta, onDone, onError) {
      try {
        const res = await fetch(API_BASE + '/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: getSessionId(), message: text })
        });
        if (!res.ok || !res.body || !res.body.getReader) throw new Error('stream unavailable');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let idx;
          while ((idx = buffer.indexOf('\n\n')) !== -1) {
            const rawEvent = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);
            let eventType = 'message';
            let dataStr = '';
            rawEvent.split('\n').forEach(function (line) {
              if (line.indexOf('event:') === 0) eventType = line.slice(6).trim();
              else if (line.indexOf('data:') === 0) dataStr += line.slice(5).trim();
            });
            if (!dataStr) continue;
            let payload;
            try { payload = JSON.parse(dataStr); } catch (e) { continue; }
            if (eventType === 'delta') onDelta(payload.text);
            else if (eventType === 'done') onDone(payload);
            else if (eventType === 'error') onError(payload);
          }
        }
      } catch (err) {
        onError({ message: err.message });
      }
    }

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
      let bubble = null;
      let assembled = '';

      await streamChat(
        text,
        function onDelta(chunk) {
          if (!bubble) { removeTyping(); bubble = startBotBubble(); }
          assembled += chunk;
          bubble.bubble.textContent = assembled; // haraka wakati wa "kuandika"; renderBotHTML kamili mwishoni
          messages.scrollTop = messages.scrollHeight;
        },
        function onDone(meta) {
          removeTyping();
          if (meta.language === 'sw' || meta.language === 'en') lastDetectedLang = meta.language;
          if (!bubble) bubble = startBotBubble();
          finalizeBotBubble(bubble, assembled, meta.messageId);

          if (typeof meta.confidence === 'number') {
            if (meta.confidence > 0) {
              lowConfidenceStreak = 0;
            } else {
              lowConfidenceStreak += 1;
              if (lowConfidenceStreak >= 2) {
                lowConfidenceStreak = 0;
                showHandoffPrompt(text);
              }
            }
          }
          if (meta.showLeadForm) showJoinForm(detectInterest(text));

          showContinuePrompt();
          startIdle();
          isSending = false;
          sendBtn.disabled = false;
          if (!isTouch) input.focus();
        },
        function onError(e) {
          removeTyping();
          if (bubble && assembled) {
            finalizeBotBubble(bubble, assembled, null);
          } else {
            addBotMessage(STR.cannotConnect);
          }
          showContinuePrompt();
          startIdle();
          isSending = false;
          sendBtn.disabled = false;
          if (!isTouch) input.focus();
        }
      );
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
