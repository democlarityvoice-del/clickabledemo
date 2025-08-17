// ==============================
// Clarity Voice Demo Calls Inject (HOME)
// ==============================
if (!window.__cvDemoInit) {
  window.__cvDemoInit = true;

  // -------- DECLARE HOME CONSTANTS -------- //
  const HOME_REGEX     = /\/portal\/home(?:[\/?#]|$)/;
  const HOME_SELECTOR  = '#nav-home a, #nav-home';
  const SLOT_SELECTOR  = '#omp-active-body';
  const IFRAME_ID      = 'cv-demo-calls-iframe';
  const HOME_ICON_SPEAKER = 'https://raw.githubusercontent.com/democlarityvoice-del/clickabledemo/refs/heads/main/speakericon.svg';

  // -------- BUILD HOME SOURCE -------- //
  function buildSrcdoc() {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  /* ----- match portal table typography & weights ----- */
  :root{
    --font-stack: "Helvetica Neue", Helvetica, Arial, sans-serif;
    --text-color:#333;
    --muted:#666;
    --border:#ddd;
  }

  *{ box-sizing:border-box; }
  html, body{
    width:100%;
    margin:0;
    overflow-x:hidden;
    font: 13px/1.428 var(--font-stack);   /* size + line-height + stack */
    color: var(--text-color);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .call-container{
    background:#fff;
    padding:0 16px 18px;
    border-radius:6px;
    box-shadow:0 1px 3px rgba(0,0,0,.08);
    width:100%;
    max-width:100%;
  }

  table{ width:100%; border-collapse:collapse; background:#fff; table-layout:auto; }
  thead th{
    padding:8px 12px;
    font-weight:600;                 /* header is semi-bold like portal */
    font-size:13px;
    text-align:left;
    border-bottom:1px solid var(--border);
    white-space:nowrap;
  }
  td{
    padding:8px 12px;
    font-weight:400;                 /* body rows are normal weight */
    font-size:13px;
    border-bottom:1px solid #eee;
    white-space:nowrap;
    text-align:left;
  }

  tr:hover{ background:#f7f7f7; }

  /* “listen in” button (unchanged, just inherits the new font now) */
  .listen-btn{
    display:inline-flex; align-items:center; justify-content:center;
    width:28px; height:28px; background:#f0f0f0; border-radius:50%; border:none; cursor:pointer;
  }
  .listen-btn:focus{ outline:none; }
  .listen-btn img{ width:18px; height:18px; display:block; opacity:.38; transition:opacity .2s; }
  tr:hover .listen-btn img{ opacity:.60; }
  .listen-btn.is-active img{ opacity:1; }
</style>


</style>
</head><body>
  <div class="call-container">
    <table>
      <thead>
        <tr>
          <th>From</th><th>CNAM</th><th>Dialed</th><th>To</th><th>Duration</th><th></th>
        </tr>
      </thead>
      <tbody id="callsTableBody"></tbody>
    </table>
  </div>

<script>
(function () {
  // Pools
  const names = ["Carlos Rivera","Emily Tran","Mike Johnson","Ava Chen","Sarah Patel","Liam Nguyen","Monica Alvarez","Raj Patel","Chloe Bennett","Grace Smith","Jason Tran","Zoe Miller","Ruby Foster","Leo Knight"];
  const extensions = [201,203,204,207,211,215,218,219,222,227,231,235];
  const areaCodes = ["989","517","248","810","313"]; // real ACs; 555-01xx keeps full number fictional
  const CALL_QUEUE = "CallQueue", VMAIL = "VMail", SPEAK = "SpeakAccount";

  // Outbound agent display names
  const firstNames = ["Nick","Sarah","Mike","Lisa","Tom","Jenny","Alex","Maria","John","Kate","David","Emma","Chris","Anna","Steve","Beth","Paul","Amy","Mark","Jess"];
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const OUTBOUND_RATE = 0.30; // ~30% outbound, 70% inbound

  // State
  const calls = [];
  const pad2 = n => String(n).padStart(2,"0");

  // Helpers
  function randomName() {
    let name, guard = 0;
    do { name = names[Math.floor(Math.random()*names.length)]; guard++; }
    while (calls.some(c => c.cnam === name) && guard < 50);
    return name;
  }
  function randomAgentName() {
    const fn = firstNames[Math.floor(Math.random()*firstNames.length)];
    const init = alphabet[Math.floor(Math.random()*alphabet.length)];
    return fn + " " + init + ".";
  }
  function randomPhone() {
    // e.g. 313-555-01xx (NANPA-safe)
    let num;
    do {
      const ac = areaCodes[Math.floor(Math.random()*areaCodes.length)];
      const last2 = pad2(Math.floor(Math.random()*100));
      num = ac + "-555-01" + last2;
    } while (calls.some(c => c.from === num) || /666/.test(num));
    return num;
  }
  function randomDialed() {
    // 800-xxx-xxxx, avoid 666
    let num;
    do {
      num = "800-" + (100+Math.floor(Math.random()*900)) + "-" + (1000+Math.floor(Math.random()*9000));
    } while (/666/.test(num));
    return num;
  }
  function randomExtension() {
    let ext, guard = 0;
    do { ext = extensions[Math.floor(Math.random()*extensions.length)]; guard++; }
    while (calls.some(c => c.ext === ext) && guard < 50);
    return ext;
  }

  // New call (inbound or outbound)
  function generateCall() {
    const outbound = Math.random() < OUTBOUND_RATE;
    const ext = randomExtension();
    const start = Date.now();

    if (outbound) {
      // Agent dialing a customer
      const dial = randomPhone(); // external number
      return {
        from: "Ext. " + ext,
        cnam: randomAgentName(),   // agent display
        dialed: dial,
        to: dial,                  // outbound: To = dialed
        ext,
        outbound: true,
        start,
        t: () => {
          const elapsed = Math.min(Date.now()-start, (4*60+32)*1000);
          const s = Math.floor(elapsed/1000);
          return String(Math.floor(s/60)) + ":" + pad2(s%60);
        }
      };
    }

    // Inbound customer call
    const from = randomPhone();
    const cnam = randomName();
    const dialed = randomDialed();
    const to = Math.random() < 0.05
      ? (Math.random() < 0.03 ? SPEAK : VMAIL)
      : CALL_QUEUE;

    return {
      from, cnam, dialed, to, ext,
      outbound: false,
      start,
      t: () => {
        const elapsed = Math.min(Date.now()-start, (4*60+32)*1000);
        const s = Math.floor(elapsed/1000);
        return String(Math.floor(s/60)) + ":" + pad2(s%60);
      }
    };
  }

  // Lifecycle
  function updateCalls() {
    // Occasionally remove one
    if (calls.length > 5 || Math.random() < 0.3) {
      if (calls.length) calls.splice(Math.floor(Math.random()*calls.length), 1);
    }
    // Keep up to 5
    if (calls.length < 5) calls.push(generateCall());

    // State transitions for inbound only
    const now = Date.now();
    calls.forEach(c => {
      if (!c.outbound && c.to === CALL_QUEUE && now - c.start > 5000) {
        c.to = "Ext. " + c.ext;  // no agent name here
      }
      if (!c.outbound && c.to === SPEAK && now - c.start > 2000) {
        c.to = VMAIL;
      }
    });
  }

  function render() {
  const tb = document.getElementById("callsTableBody");
  if (!tb) return;
  tb.innerHTML = "";
  calls.forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = \`
      <td>\${c.from}</td>
      <td>\${c.cnam}</td>
      <td>\${c.dialed}</td>
      <td>\${c.to}</td>
      <td>\${c.t()}</td>
      <td>
        <button class="listen-btn" aria-pressed="false" title="Listen in">
          <img src="${HOME_ICON_SPEAKER}" alt="">
        </button>
      </td>\`;
    tb.appendChild(tr);
  });
}

  // Seed + loop
  (function seed(){ calls.push(generateCall()); render(); })();
  setInterval(() => { updateCalls(); render(); }, 1500);

  // Single-active toggle for "Listen in"
  document.addEventListener("click", (e) => {
    const el = e.target instanceof Element ? e.target : null;
    const btn = el && el.closest(".listen-btn");
    if (!btn) return;
    document.querySelectorAll('.listen-btn[aria-pressed="true"]').forEach(b => {
      b.classList.remove("is-active");
      b.setAttribute("aria-pressed","false");
    });
    btn.classList.add("is-active");
    btn.setAttribute("aria-pressed","true");
  });
})();
<\/script>
</body></html>`;
}



  // -------- REMOVE HOME -------- //
  function removeHome() {
  const ifr = document.getElementById(IFRAME_ID);
  if (ifr && ifr.parentNode) ifr.parentNode.removeChild(ifr);

  const slot = document.querySelector(SLOT_SELECTOR);
  if (slot) {
    const hidden = slot.querySelector('[data-cv-demo-hidden="1"]');
    if (hidden && hidden.nodeType === Node.ELEMENT_NODE) {
      hidden.style.display = '';                // <-- FIXED
      hidden.removeAttribute('data-cv-demo-hidden');
    }
  }
}


  // -------- INJECT HOME -------- //
  function injectHome() {
  if (document.getElementById(IFRAME_ID)) return;
  const slot = document.querySelector(SLOT_SELECTOR);
  if (!slot) return;

  function findAnchor(el){
    const preferred = el.querySelector('.table-container.scrollable-small');
    if (preferred) return preferred;
    if (el.firstElementChild) return el.firstElementChild;
    let n = el.firstChild; while (n && n.nodeType !== Node.ELEMENT_NODE) n = n.nextSibling;
    return n || null;
  }

  const anchor = findAnchor(slot);

  if (anchor && anchor.nodeType === Node.ELEMENT_NODE) {
    anchor.style.display = 'none';                 // <-- FIXED
    anchor.setAttribute('data-cv-demo-hidden','1');
  }

  const iframe = document.createElement('iframe');
  iframe.id = IFRAME_ID;
  iframe.style.cssText = 'border:none;width:100%;display:block;margin-top:0;height:360px;'; // <-- FIXED
  iframe.setAttribute('scrolling','yes');
  iframe.srcdoc = buildSrcdoc();

  if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(iframe, anchor);
  else slot.appendChild(iframe);
}


  // -------- WAIT HOME AND INJECT -------- //
  function waitForSlotAndInject(tries = 0) {
    const slot = document.querySelector(SLOT_SELECTOR);
    if (slot && slot.isConnected) {
      requestAnimationFrame(() => requestAnimationFrame(() => injectHome()));
      return;
    }
    if (tries >= 12) return;
    setTimeout(() => waitForSlotAndInject(tries + 1), 250);
  }

  // -------- HOME ROUTING -------- //
  function onHomeEnter() { setTimeout(() => waitForSlotAndInject(), 600); }

  function handleHomeRouteChange(prevHref, nextHref) {
    const wasHome = HOME_REGEX.test(prevHref);
    const isHome  = HOME_REGEX.test(nextHref);
    if (!wasHome && isHome) onHomeEnter();
    if ( wasHome && !isHome) removeHome();
  }

 (function watchHomeURLChanges() {
  let last = location.href;
  const origPush = history.pushState;
  const origReplace = history.replaceState;

  history.pushState = function () {
    const prev = last;
    const ret  = origPush.apply(this, arguments);
    const now  = location.href;
    last = now;
    handleHomeRouteChange(prev, now);
    return ret;
  };

  history.replaceState = function () {
    const prev = last;
    const ret  = origReplace.apply(this, arguments);
    const now  = location.href;
    last = now;
    handleHomeRouteChange(prev, now);
    return ret;
  };

  // Catch SPA mutations that don't use push/replace
  const mo = new MutationObserver(() => {
    if (location.href !== last) {
      const prev = last;
      const now  = location.href;
      last = now;
      handleHomeRouteChange(prev, now);
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });

  // Catch back/forward
  window.addEventListener('popstate', () => {
    const prev = last;
    const now  = location.href;
    if (now !== prev) {
      last = now;
      handleHomeRouteChange(prev, now);
    }
  });

  // Home nav click hook
  document.addEventListener('click', (e) => {
    const el = e.target instanceof Element ? e.target : null;
    if (el && el.closest(HOME_SELECTOR)) setTimeout(onHomeEnter, 0);
  });

  // Initial landing
  if (HOME_REGEX.test(location.href)) onHomeEnter();
})();
} // closes __cvDemoInit


// ==============================
// Clarity Voice Grid Stats Inject (CALL CENTER MANAGER) — inject INTO inner iframe
// ==============================

// -------- GRID: Init Guard -------- //
if (!window.__cvGridStatsInit) {
  window.__cvGridStatsInit = true;

  
// -------- GRID: Constants -------- //
const GRID_STATS_REGEX    = /\/portal\/agents\/manager(?:[\/?#]|$)/;
const GRID_BODY_SELECTOR  = '#dash-stats-body';
const GRID_TABLE_SELECTOR = '.dash-stats-grid-table';
const CARD_ID             = 'cv-grid-stats-card';
const CARD_STYLE_ID       = 'cv-grid-stats-style'; // <-- FIXED name


  // -------- GRID: Helpers (scheduler / hide / observe) -------- //
  function scheduleInject(fn) {
    let fired = false;
    if ('requestAnimationFrame' in window) {
      requestAnimationFrame(() => requestAnimationFrame(() => { fired = true; fn(); }));
    }
    setTimeout(() => { if (!fired) fn(); }, 64);
  }

  // Hide ONLY the tables; keep native header visible
  function hideGridOriginals(doc) {
    const nodes = doc.querySelectorAll(`${GRID_TABLE_SELECTOR}`);
    nodes.forEach(n => {
      if (n && !n.hasAttribute('data-cv-hidden')) {
        n.setAttribute('data-cv-hidden','1');
        n.style.display = 'none';
      }
    });
  }

  function unhideGridOriginals(doc) {
    const nodes = doc.querySelectorAll('[data-cv-hidden="1"]');
    nodes.forEach(n => { n.style.display = ''; n.removeAttribute('data-cv-hidden'); });
  }

  function attachGridDocObserver(doc) {
    if (doc.__cvGridStatsMO) return;
    const mo = new MutationObserver(() => {
      if (!GRID_STATS_REGEX.test(location.href)) return;

      // Re-hide any tables the SPA may have re-added
      hideGridOriginals(doc);

      // If our card vanished but grid exists, re-inject
      const card = doc.getElementById(CARD_ID);
      const gridPresent =
        doc.querySelector(`${GRID_BODY_SELECTOR} ${GRID_TABLE_SELECTOR}`) ||
        doc.querySelector(GRID_TABLE_SELECTOR);
      if (!card && gridPresent) scheduleInject(injectGridStatsCard);
    });
    mo.observe(doc.documentElement || doc, { childList: true, subtree: true });
    doc.__cvGridStatsMO = mo;
  }

  function detachGridDocObserver(doc) {
    if (doc.__cvGridStatsMO) {
      try { doc.__cvGridStatsMO.disconnect(); } catch {}
      delete doc.__cvGridStatsMO;
    }
  }

  // -------- GRID: Document utilities -------- //
  function getSameOriginDocs() {
    const docs = [document];
    const iframes = document.querySelectorAll('iframe');
    for (const ifr of iframes) {
      try {
        const idoc = ifr.contentDocument || (ifr.contentWindow && ifr.contentWindow.document);
        if (idoc) docs.push(idoc); // will throw if cross-origin; try/catch guards
      } catch {}
    }
    return docs;
  }

  function findGridInnerDoc() {
    for (const doc of getSameOriginDocs()) {
      const bodyContainer = doc.querySelector(GRID_BODY_SELECTOR);
      const table = bodyContainer
        ? bodyContainer.querySelector(GRID_TABLE_SELECTOR)
        : doc.querySelector(GRID_TABLE_SELECTOR);
      if (bodyContainer || table) return { doc, table, bodyContainer };
    }
    return null;
  }

  // -------- GRID: Card HTML (no duplicate header, labels above values) -------- //
  function buildGridStatsCardHTML() {
  return `
    <div id="${CARD_ID}" class="cv-metrics" style="box-sizing:border-box;margin:0;padding:0;">
      <style>
        .cv-metrics{width:100%;max-width:100%;margin:0;padding:0;}
        .cv-row{display:flex;gap:12px;margin:0 0 12px 0;}
        .cv-col{flex:1 1 0;min-width:0;}
        .cv-label{display:flex;align-items:center;gap:6px;justify-content:center;
                  font-weight:700;font-size:13px;color:#000;line-height:1;margin:0 0 6px;}
        .cv-info{display:inline-block;width:14px;height:14px;border-radius:50%;
                 border:1px solid rgba(0,0,0,.35);font-size:10px;line-height:14px;
                 text-align:center;opacity:.6;}
        .cv-tile{border-radius:8px;padding:12px 0 10px;text-align:center;
                 box-shadow:0 2px 5px rgba(0,0,0,.1);background:#7fff7f;}
        .cv-tile.yellow{background:#ffeb3b;}
        .cv-value{font-size:28px;line-height:1;font-weight:700;color:#000;}
        .cv-col:hover .cv-info{opacity:1;}
      </style>

      <div class="cv-row">
        <div class="cv-col">
          <div class="cv-label">CW <span class="cv-info" title="Calls Waiting">i</span></div>
          <div class="cv-tile"><div class="cv-value">2</div></div>
        </div>
        <div class="cv-col">
          <div class="cv-label">AWT <span class="cv-info" title="Average Wait Time">i</span></div>
          <div class="cv-tile"><div class="cv-value">2:42</div></div>
        </div>
      </div>

      <div class="cv-row" style="margin-bottom:0;">
        <div class="cv-col">
          <div class="cv-label">AHT <span class="cv-info" title="Average Handle Time">i</span></div>
          <div class="cv-tile yellow"><div class="cv-value">3:14</div></div>
        </div>
        <div class="cv-col">
          <div class="cv-label">CA <span class="cv-info" title="Calls Answered">i</span></div>
          <div class="cv-tile"><div class="cv-value">27</div></div>
        </div>
      </div>
    </div>`;
}

  // -------- GRID: Inject / remove -------- //
  function injectGridStatsCard() {
    const found = findGridInnerDoc();
    if (!found) return;

    const { doc, table, bodyContainer } = found;
    if (doc.getElementById(CARD_ID)) return;

    if (!doc.getElementById(CARD_STYLE_ID)) {
      const styleEl = doc.createElement('style');
      styleEl.id = CARD_STYLE_ID;
      styleEl.textContent = `/* reserved for future styles */`;
      if (doc.head) doc.head.appendChild(styleEl);
    }

    const wrap = doc.createElement('div');
    wrap.innerHTML = buildGridStatsCardHTML();
    const card = wrap.firstElementChild;

    // Insert inside the body container, at the top; fallbacks maintain alignment
    if (bodyContainer) {
      bodyContainer.insertBefore(card, bodyContainer.firstChild);
    } else if (table && table.parentNode) {
      table.parentNode.insertBefore(card, table);
    } else {
      doc.body.appendChild(card);
    }

    hideGridOriginals(doc);
    attachGridDocObserver(doc);
  }

  function removeGridStatsCard() {
    for (const doc of getSameOriginDocs()) {
      const card = doc.getElementById(CARD_ID);
      if (card) card.remove();
      unhideGridOriginals(doc);
      detachGridDocObserver(doc);
    }
  }

  // -------- GRID: Wait / route / watch -------- //
  function waitForGridStatsAndInject(tries = 0) {
    const found = findGridInnerDoc();
    if (found && (found.bodyContainer || tries >= 3)) {
      scheduleInject(injectGridStatsCard);
      return;
    }
    if (tries >= 12) return;
    setTimeout(() => waitForGridStatsAndInject(tries + 1), 300);
  }

  function onGridStatsPageEnter() { waitForGridStatsAndInject(); }

  function handleGridStatsRouteChange(prevHref, nextHref) {
    const wasOn = GRID_STATS_REGEX.test(prevHref);
    const isOn  = GRID_STATS_REGEX.test(nextHref);
    if (!wasOn && isOn) onGridStatsPageEnter();
    if ( wasOn && !isOn) removeGridStatsCard();
  }

  (function watchGridStatsURLChanges() {
    let last = location.href;
    const origPush = history.pushState;
    const origReplace = history.replaceState;

    history.pushState = function () {
      const prev = last;
      const ret  = origPush.apply(this, arguments);
      const now  = location.href; last = now;
      handleGridStatsRouteChange(prev, now);
      return ret;
    };
    history.replaceState = function () {
      const prev = last;
      const ret  = origReplace.apply(this, arguments);
      const now  = location.href; last = now;
      handleGridStatsRouteChange(prev, now);
      return ret;
    };

    new MutationObserver(() => {
      if (location.href !== last) {
        const prev = last, now = location.href; last = now;
        handleGridStatsRouteChange(prev, now);
      }
    }).observe(document.documentElement, { childList: true, subtree: true });

    window.addEventListener('popstate', () => {
      const prev = last, now = location.href;
      if (now !== prev) { last = now; handleGridStatsRouteChange(prev, now); }
    });

    if (GRID_STATS_REGEX.test(location.href)) onGridStatsPageEnter();
  })();
}   // closes __cvGridStatsInit




// ==============================
// Clarity Voice Queues Tiles (CALL CENTER MANAGER)
// ==============================
if (!window.__cvQueuesTilesInit) {
  window.__cvQueuesTilesInit = true;

  // ---- DECLARE CALL CENTER QUEUE TILE CONSTANTS ----
  const QUEUES_REGEX   = /\/portal\/agents\/manager(?:[\/?#]|$)/;
  const BODY_SEL       = '#home-queues-body';
  const CONTAINER_SEL  = '.table-container';
  const TABLE_SEL      = '#manager_queues';
  const PANEL_ID       = 'cvq-panel';
  const PANEL_STYLE_ID = 'cvq-panel-style';

  // ---- DECLARE CALL CENTER ICON URL CONSTANTS (HOSTED SVGs) ----
  const ICON_USER    = 'https://raw.githubusercontent.com/democlarityvoice-del/clickabledemo/refs/heads/main/user-solid-full.svg';
  const ICON_EDIT    = 'https://raw.githubusercontent.com/democlarityvoice-del/clickabledemo/refs/heads/main/pen-to-square-regular-full.svg';
  const ICON_SPEAKER = 'https://raw.githubusercontent.com/democlarityvoice-del/clickabledemo/refs/heads/main/speakericon.svg';
  const ICON_PHONE   = 'https://raw.githubusercontent.com/democlarityvoice-del/clickabledemo/refs/heads/main/phone-solid-full.svg';
  const ICON_ARROW   = 'https://raw.githubusercontent.com/democlarityvoice-del/clickabledemo/refs/heads/main/arrow-up-solid-full.svg';

  // ---- DECLARE CALL CENTER REAL ROUTES (claritydemo) ----
  const IDLE_LINKS = {
    main:     '/portal/callqueues/editagents/300@claritydemo/Ring+All',
    sales:    '/portal/callqueues/editagents/301@claritydemo/Round-robin',
    existing: '/portal/callqueues/editagents/302@claritydemo/Linear+Cascade',
    billing:  '/portal/callqueues/editagents/303@claritydemo/Ring+All'
  };
  const QUEUE_EDIT_LINKS = {
    main:     '/portal/callqueues/edit/300@claritydemo',
    sales:    '/portal/callqueues/edit/301@claritydemo',
    existing: '/portal/callqueues/edit/302@claritydemo',
    billing:  '/portal/callqueues/edit/303@claritydemo'
  };

  // ---- DECLARE CALL CENTER QUEUE DATA (demo counts) ----
  const QUEUE_DATA = [
    { key:'main',     title:'Main Routing (300)',      active:0, waiting:0, timer:false, idle:7 },
    { key:'sales',    title:'New Sales (301)',         active:3, waiting:1, timer:true,  idle:6 },
    { key:'existing', title:'Existing Customer (302)', active:1, waiting:1, timer:true,  idle:4 },
    { key:'billing',  title:'Billing (303)',           active:0, waiting:0, timer:false, idle:1 }
  ];

  // ---- UTIL: CALL CENTER scheduleInject (safe RAF/timeout) ----
  function scheduleInject(fn) {
    let fired = false;
    if ('requestAnimationFrame' in window) {
      requestAnimationFrame(() => requestAnimationFrame(() => { fired = true; fn(); }));
    }
    setTimeout(() => { if (!fired) fn(); }, 64);
  }

  // ---- UTIL: CALL CENTER getSameOriginDocs (document + inner iframes) ----
  function getSameOriginDocs(){
    const docs = [document];
    const ifrs = document.querySelectorAll('iframe');
    for (let i=0;i<ifrs.length;i++){
      try {
        const idoc = ifrs[i].contentDocument || (ifrs[i].contentWindow && ifrs[i].contentWindow.document);
        if (idoc) docs.push(idoc);
      } catch {}
    }
    return docs;
  }

  // ---- UTIL: CALL CENTER findQueuesDoc (locate body/container/table) ----
  function findQueuesDoc(){
    const docs = getSameOriginDocs();
    for (let i=0;i<docs.length;i++){
      const doc = docs[i];
      const body = doc.querySelector(BODY_SEL);
      if (!body) continue;
      const container = body.querySelector(CONTAINER_SEL);
      const table = body.querySelector(TABLE_SEL);
      return { doc, body, container, table };
    }
    return null;
  }

  // ---- UTIL: CALL CENTER mmss (format seconds) ----
  function mmss(sec){
    sec |= 0;
    const m = String((sec/60|0)).padStart(2,'0');
    const s = String(sec%60).padStart(2,'0');
    return m + ':' + s;
  }

  // ---- UTIL: CALL CENTER matches / closest (compat) ----
  function matches(el, sel){
    if (!el || el.nodeType !== 1) return false;
    const p = Element.prototype;
    const fn = p.matches || p.msMatchesSelector || p.webkitMatchesSelector;
    return fn ? fn.call(el, sel) : false;
  }
  function closest(el, sel){
    while (el && el.nodeType === 1) {
      if (matches(el, sel)) return el;
      el = el.parentNode;
    }
    return null;
  }

  // ---- UTIL: CALL CENTER find loadModal on window/parent/top ----
  function getLoadModal(doc){
    const w = (doc && doc.defaultView) || window;
    return (typeof w.loadModal === 'function' && w.loadModal) ||
           (w.parent && typeof w.parent.loadModal === 'function' && w.parent.loadModal) ||
           (w.top && typeof w.top.loadModal === 'function' && w.top.loadModal) ||
           null;
  }

  // ---- CALL CENTER CACHES FOR MODAL ROWS (stable while open) ----
  const REAL_DIDS      = ['(248) 436-3443','(248) 436-3449','(313) 995-9080'];
  const SAFE_FAKE_AC   = ['900','700','999','888','511','600','311','322','456'];
  const AGENT_EXT_POOL = [201,203,204,207,211,215,218,219,222,227,231,235];
  const CVQ_CACHE      = { active:{}, waiting:{} };

  function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function safeCallerID(){ return '(' + rand(SAFE_FAKE_AC) + ') 555-01' + String(Math.floor(Math.random()*100)).padStart(2,'0'); }
  function pickAgentExt(i){ return AGENT_EXT_POOL[i % AGENT_EXT_POOL.length]; }
  function pickRealDID(i){ return REAL_DIDS[i % REAL_DIDS.length]; }

  // ---- ACTION: Build "Active Calls" rows for modal CALL CENTER ----
  function makeActiveRows(qkey, count){
    if (!CVQ_CACHE.active[qkey]) {
      const now = Date.now();
      CVQ_CACHE.active[qkey] = Array.from({length:count}, (_,i) => ({
        from: safeCallerID(),
        dialed: pickRealDID(i),
        status: 'Talking',
        agent: String(pickAgentExt(i)),
        start: now - Math.floor(Math.random()*90)*1000
      }));
    } else {
      const cur = CVQ_CACHE.active[qkey];
      while (cur.length < count) {
        cur.push({
          from: safeCallerID(),
          dialed: pickRealDID(cur.length),
          status: 'Talking',
          agent: String(pickAgentExt(cur.length)),
          start: Date.now()
        });
      }
      CVQ_CACHE.active[qkey] = cur.slice(0, count);
    }
    return CVQ_CACHE.active[qkey];
  }

  // ---- ACTION: Build "Callers Waiting" rows for modal ----
  function makeWaitingRows(qkey, count){
    if (!CVQ_CACHE.waiting[qkey]) {
      const now = Date.now();
      CVQ_CACHE.waiting[qkey] = Array.from({length:count}, () => ({
        caller: safeCallerID(),
        name: 'WIRELESS CALLER',
        status: 'Waiting',
        priority: false,
        start: now - Math.floor(Math.random()*20)*1000
      }));
    } else {
      const cur = CVQ_CACHE.waiting[qkey];
      while (cur.length < count) {
        cur.push({
          caller: safeCallerID(),
          name: 'WIRELESS CALLER',
          status: 'Waiting',
          priority: false,
          start: Date.now()
        });
      }
      CVQ_CACHE.waiting[qkey] = cur.slice(0, count);
    }
    return CVQ_CACHE.waiting[qkey];
  }



// ---- ACTION: CALL CENTER Ensure Styles + Modal Host (create/update once) ----
function ensureStyles(doc){
  // move modal slightly right (affects BOTH Active Calls & Callers Waiting)
  var SHIFT_PX = 80;

  var css =
`/* container spacing to match native */
#${PANEL_ID}.table-container{margin-top:6px;}
#${PANEL_ID} table{width:100%;}
#${PANEL_ID} thead th{white-space:nowrap;}
#${PANEL_ID} td,#${PANEL_ID} th{vertical-align:middle;}

/* clickable counts (blue, boldish) */
#${PANEL_ID} .cvq-link{color:#0b84ff; font-weight:700; text-decoration:none; cursor:pointer;}
#${PANEL_ID} .cvq-link:hover{text-decoration:underline;}

/* actions column: round icon buttons */
#${PANEL_ID} .cvq-actions{ text-align:right; white-space:nowrap; width:86px; }
.cvq-icon{
  display:inline-flex; align-items:center; justify-content:center;
  width:24px; height:24px; border-radius:50%;
  background:#f7f7f7; border:1px solid #e1e1e1;
  margin-left:6px; opacity:.45; transition:opacity .15s, transform .04s;
  cursor:pointer; padding:0; line-height:0;
}
tr:hover .cvq-icon{ opacity:.85; }
.cvq-icon:hover{ opacity:1; }
.cvq-icon:focus{ outline:2px solid #0b84ff33; outline-offset:2px; }
.cvq-icon img{ width:14px; height:14px; display:block; pointer-events:none; }

/* --- CVQ MODAL: default hidden; open with .is-open --- */
.cvq-modal-backdrop{
  position:fixed; inset:0; background:rgba(0,0,0,.35);
  z-index:9998; display:none;
}
.cvq-modal{
  position:fixed; left:50%; top:50%; transform:translate(-50%,-50%);
  background:#fff; border-radius:6px; box-shadow:0 8px 24px rgba(0,0,0,.25);
  width:min(980px,96vw); height:88vh; max-height:88vh;
  z-index:9999; overflow:hidden; display:none; flex-direction:column;
}

.cvq-modal.is-open{ display:flex; }
.cvq-modal-backdrop.is-open{ display:block; }

/* header/body/footer */
.cvq-modal header{ padding:14px 16px; border-bottom:1px solid #eee; font-size:18px; font-weight:600; }
.cvq-modal .cvq-modal-body{ overflow:auto; flex:1 1 auto; min-height:0; max-height:none; }
.cvq-modal footer{ padding:12px 16px; border-top:1px solid #eee; display:flex; justify-content:flex-end; gap:10px; }

.cvq-btn{ padding:6px 12px; border-radius:4px; border:1px solid #cfcfcf; background:#f7f7f7; cursor:pointer; }
.cvq-btn.primary{ background:#0b84ff; border-color:#0b84ff; color:#fff; }

.cvq-modal table{ width:100%; }
.cvq-modal thead th{ white-space:nowrap; }
.cvq-badge{ display:inline-block; padding:2px 6px; border-radius:4px; background:#2a77a8; color:#fff; font-size:12px; }

/* kebab menu inside modal */
.cvq-kebab{ position:relative; }
.cvq-menu{ position:absolute; right:0; top:100%; margin-top:6px; background:#fff; border:1px solid #ddd; border-radius:6px;
  box-shadow:0 8px 24px rgba(0,0,0,.16); min-width:160px; display:none; z-index:10; }
.cvq-menu a{ display:block; padding:8px 12px; color:#222; text-decoration:none; }
.cvq-menu a:hover{ background:#f5f5f5; }

@media (max-width:1200px){
  /* recenters on smaller screens so it doesn't clip */
  .cvq-modal{ left:50% !important; }
}
/* match first column padding for header + cells */
.cvq-modal table th:first-child,
.cvq-modal table td:first-child{ padding-left:22px; }

/* center Agent / Duration / Actions (works for both modals) */
.cvq-modal table thead th:nth-child(4),
.cvq-modal table thead th:nth-child(5),
.cvq-modal table thead th:nth-child(6),
.cvq-modal table tbody td:nth-child(4),
.cvq-modal table tbody td:nth-child(5),
.cvq-modal table tbody td:nth-child(6){ text-align:center; }

@media (max-width:900px){ #${PANEL_ID} .hide-sm{display:none;} }`;

  // always create OR update (so later CSS edits take effect)
  var s = doc.getElementById(PANEL_STYLE_ID);
  if (!s) {
    s = doc.createElement('style');
    s.id = PANEL_STYLE_ID;
    (doc.head || doc.documentElement).appendChild(s);
  }
  s.textContent = css;

  // modal host (once)
  if (!doc.getElementById('cvq-modal-host')) {
    var host = doc.createElement('div');
    host.id = 'cvq-modal-host';
    host.innerHTML =
      '<div class="cvq-modal-backdrop" id="cvq-backdrop"></div>'+
      '<div class="cvq-modal" id="cvq-modal" role="dialog" aria-modal="true">'+
        '<header id="cvq-modal-title">Modal</header>'+
        '<div class="cvq-modal-body"><div id="cvq-modal-content"></div></div>'+
        '<footer><button class="cvq-btn" id="cvq-close">Close</button></footer>'+
      '</div>';
    (doc.body || doc.documentElement).appendChild(host);

    host.addEventListener('click', function(e){
      if (e.target && (e.target.id === 'cvq-backdrop' || e.target.id === 'cvq-close')) closeModal(doc);
    });
  }
}


  // ---- ACTION: Open / Close CALL CENTER Modal (single, canonical) ----
  function openModal(doc, title, tableHTML){
    const bd = doc.getElementById('cvq-backdrop');
    const md = doc.getElementById('cvq-modal');
    doc.getElementById('cvq-modal-title').textContent = title;
    doc.getElementById('cvq-modal-content').innerHTML = tableHTML;
    if (bd) bd.classList.add('is-open');
    if (md) md.classList.add('is-open');
    if (doc.__cvqModalTimer) clearInterval(doc.__cvqModalTimer);
    doc.__cvqModalTimer = setInterval(()=>{
      const nodes = doc.querySelectorAll('[data-cvq-start]');
      for (let i=0;i<nodes.length;i++){
        const t0 = +nodes[i].getAttribute('data-cvq-start');
        nodes[i].textContent = mmss(((Date.now()-t0)/1000)|0);
      }
    },1000);
  }
  function closeModal(doc){
    const bd = doc.getElementById('cvq-backdrop');
    const md = doc.getElementById('cvq-modal');
    if (bd) bd.classList.remove('is-open');
    if (md) md.classList.remove('is-open');
    if (doc.__cvqModalTimer){ clearInterval(doc.__cvqModalTimer); doc.__cvqModalTimer=null; }
  }

  // ---- ACTION: Build Panel CALL CENTER QUEUES HTML (renders all queue rows) ----
  function buildPanelHTML(){
    const rows = QUEUE_DATA.map((d)=>{
      const waitCell = d.timer
        ? `<span class="cvq-wait" id="cvq-wait-${d.key}" data-tick="1" data-sec="0">00:00</span>`
        : `<span class="cvq-wait">-</span>`;
      const idleCount = d.waiting > 0 ? 0 : (d.idle || 0);

      // platform modal inline fallbacks for Edit Agents / Edit Queue
      const agentsHref = (IDLE_LINKS[d.key] || '#');
      const queueHref  = (QUEUE_EDIT_LINKS[d.key] || '#');
      const agentsOnClick = "try{var lm=(window.loadModal||parent.loadModal||top.loadModal);if(typeof lm==='function'){lm('#write-agents', this.href);return false;}}catch(e){}";
      const queueOnClick  = "try{var lm=(window.loadModal||parent.loadModal||top.loadModal);if(typeof lm==='function'){lm('#write-queue', this.href);return false;}}catch(e){}";

      return `
      <tr data-qkey="${d.key}">
        <td class="text-center"><input type="checkbox" tabindex="-1" /></td>
        <td class="cvq-queue">${d.title}</td>

        <!-- ---- ACTION: Active Calls count — opens modal ---- -->
        <td class="text-center">
          <a class="cvq-link" data-act="active">${d.active}</a>
        </td>

        <!-- ---- ACTION: Callers Waiting count — opens modal ---- -->
        <td class="text-center">
          <a class="cvq-link" data-act="waiting">${d.waiting}</a>
        </td>

        <td class="text-center">${waitCell}</td>

        <!-- ---- ACTION: Agents Idle — routes to real “Edit Agents” ---- -->
        <td class="text-center">
          <a class="cvq-link cvq-idle"
             href="${agentsHref}"
             data-target="#write-agents" data-toggle="modal" data-backdrop="static"
             onclick="${agentsOnClick}">${idleCount}</a>
        </td>

        <!-- ---- ACTIONS CELL: Edit Agents / Edit Queue buttons ---- -->
        <td class="cvq-actions">
          <a class="cvq-icon" title="Edit Agents" aria-label="Edit Agents"
             href="${agentsHref}"
             data-target="#write-agents" data-toggle="modal" data-backdrop="static"
             onclick="${agentsOnClick}">
            <img src="${ICON_USER}" alt="">
          </a>
          <a class="cvq-icon" title="Edit Queue" aria-label="Edit Queue"
             href="${queueHref}"
             data-target="#write-queue" data-toggle="modal" data-backdrop="static"
             onclick="${queueOnClick}">
            <img src="${ICON_EDIT}" alt="">
          </a>
        </td>
      </tr>`;
    }).join('');

    return `
      <div id="${PANEL_ID}" class="table-container scrollable-small">
        <table class="table table-condensed table-hover">
          <thead>
            <tr>
              <th class="text-center" style="width:28px;"><span class="hide-sm">&nbsp;</span></th>
              <th>Call Queue</th>
              <th class="text-center">Active Calls</th>
              <th class="text-center">Callers Waiting</th>
              <th class="text-center">Wait</th>
              <th class="text-center">Agents Idle</th>
              <th class="text-center hide-sm" style="width:86px;"></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  // ---- ACTION: Build "Active Calls" Modal Table CALL CENTER ----
  function buildActiveTable(rows){
    const body = rows.map((r)=>`
      <tr>
        <td>${r.from}</td>
        <td>${r.dialed}</td>
        <td>${r.status}</td>
        <td>${r.agent}</td>
        <td class="text-center"><span data-cvq-start="${r.start}">${mmss(((Date.now()-r.start)/1000)|0)}</span></td>
        <td class="text-center">
          <button class="cvq-icon" title="Listen in" aria-label="Listen in">
            <img src="${ICON_SPEAKER}" alt="">
          </button>
        </td>
      </tr>`).join('');

    return `
      <table class="table table-condensed table-hover">
        <thead><tr><th>From</th><th>Dialed</th><th>Status</th><th>Agent</th><th>Duration</th><th class="text-center"></th></tr></thead>
        <tbody>${body || `<tr><td colspan="6" class="text-center">No active calls</td></tr>`}</tbody>
      </table>`;
  }

  // ---- ACTION: CALL CENTER Build "Callers Waiting" Modal Table ----
  function buildWaitingTable(rows){
    const body = rows.map((r,i)=>`
      <tr data-row="${i}">
        <td>${r.caller}</td>
        <td>${r.name}</td>
        <td>${r.status}${r.priority ? ` <span class="cvq-badge">Priority</span>`:''}</td>
        <td class="text-center"><span data-cvq-start="${r.start}">${mmss(((Date.now()-r.start)/1000)|0)}</span></td>
        <td class="text-center">
          <span class="cvq-icon" title="Prioritize" data-cvq="prio" aria-label="Prioritize"><img src="${ICON_ARROW}" alt=""></span>
          <span class="cvq-icon cvq-kebab" title="Actions" data-cvq="menu" aria-haspopup="menu" aria-expanded="false">
            <img src="${ICON_PHONE}" alt="">
            <div class="cvq-menu" role="menu">
              <a href="#" data-cvq="pickup"   role="menuitem">Pick up call</a>
              <a href="#" data-cvq="transfer" role="menuitem">Transfer call</a>
            </div>
          </span>
        </td>
      </tr>`).join('');

    return `
      <table class="table table-condensed table-hover">
        <thead><tr><th>Caller ID</th><th>Name</th><th>Status</th><th>Duration</th><th class="text-center"></th></tr></thead>
        <tbody>${body || `<tr><td colspan="5" class="text-center">No waiting callers</td></tr>`}</tbody>
      </table>`;
  }

  // ---- ACTION: CALL CENTER Wire Clicks (counts → modals; agents/queue → route) ----
  function addQueuesClickHandlers(doc){
    if (doc.__cvqClicksWired) return;
    doc.__cvqClicksWired = true;

    // ---- ACTION: Active/Waiting Counts — open modals (capture to beat host) ----
    doc.addEventListener('click', (e)=>{
      const link = closest(e.target, '#'+PANEL_ID+' .cvq-link');
      if (!link) return;
      const act = link.getAttribute('data-act');
      if (!act) return;

      e.preventDefault();
      const tr = closest(link, 'tr'); if (!tr) return;
      const qkey = tr.getAttribute('data-qkey');
      let q = null; for (let i=0;i<QUEUE_DATA.length;i++){ if (QUEUE_DATA[i].key===qkey){ q=QUEUE_DATA[i]; break; } }
      if (!q) return;

      const titleBase = q.title.replace(/\s+\(\d+\)$/, '');
      if (act === 'active') {
        openModal(doc, 'Active Calls in ' + titleBase, buildActiveTable(makeActiveRows(qkey, q.active)));
      } else if (act === 'waiting') {
        openModal(doc, 'Callers in ' + titleBase, buildWaitingTable(makeWaitingRows(qkey, q.waiting)));
      }
    }, true);

    // ---- ACTION: CALL CENTER Agents Idle / Edit Agents / Edit Queue — platform modal or navigate ----
    doc.addEventListener('click', (e)=>{
      const nav = closest(e.target, '#'+PANEL_ID+' .cvq-idle, #'+PANEL_ID+' .cvq-actions a');
      if (!nav) return;
      const href = nav.getAttribute('href') || '#';
      const isAgents = matches(nav, '#'+PANEL_ID+' .cvq-idle') || (nav.getAttribute('aria-label') === 'Edit Agents');
      const targetSel = isAgents ? '#write-agents' : '#write-queue';

      const lm = getLoadModal(doc);
      if (lm) { e.preventDefault(); lm(targetSel, href); }
    }, true);

    // ---- ACTION: CALL CENTER Waiting-table Interactions (inside modal) ----
    doc.addEventListener('click', (e)=>{
      const modal = closest(e.target, '#cvq-modal');
      if (!modal) return;

      // prioritize toggle
      const pr = closest(e.target, '[data-cvq="prio"]');
      if (pr){
        const row = closest(pr, 'tr'); if (!row) return;
        const cell = row.cells[2];
        const txt = (cell.textContent || '').replace(/\s+/g,' ').trim();
        if (/Priority/.test(txt)) cell.innerHTML = txt.replace(/Priority/,'').replace(/\s+/g,' ').trim();
        else cell.innerHTML = txt + ' <span class="cvq-badge">Priority</span>';
        return;
      }

      // kebab open/close
      const kb = closest(e.target, '[data-cvq="menu"]');
      if (kb){
        const menu = kb.querySelector('.cvq-menu');
        const menus = modal.querySelectorAll('.cvq-menu');
        for (let i=0;i<menus.length;i++){ if (menus[i] !== menu) menus[i].style.display='none'; }
        menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
        e.stopPropagation();
        return;
      }

      if (matches(e.target, '.cvq-menu a')){
        e.preventDefault();
        const m = closest(e.target, '.cvq-menu'); if (m) m.style.display='none';
      }
    });

    // ---- ACTION: CALL CENTER Click-away inside modal closes kebabs ----
    doc.addEventListener('click', (e)=>{
      const modal = closest(e.target, '#cvq-modal');
      if (!modal) return;
      if (closest(e.target, '.cvq-kebab')) return;
      const menus = modal.querySelectorAll('.cvq-menu');
      for (let i=0;i<menus.length;i++) menus[i].style.display='none';
    });
  }

  // ---- ACTION: Inject CALL CENTER Queues Tiles into GRID (create panel + timers + handlers) ----
  function injectQueuesTiles(){
    const found = findQueuesDoc(); if (!found) return;
    const doc = found.doc, body = found.body, container = found.container;

    // styles/host once per doc
    ensureStyles(doc);

    // already injected? bail early (DON'T touch modal state here)
    if (doc.getElementById(PANEL_ID)) return;

    // build + insert panel
    const wrap = doc.createElement('div'); wrap.innerHTML = buildPanelHTML();
    const panel = wrap.firstElementChild;

    if (container && container.parentNode) {
      if (!container.hasAttribute('data-cv-hidden')) {
        container.setAttribute('data-cv-hidden','1'); container.style.display = 'none';
      }
      container.parentNode.insertBefore(panel, container);
    } else if (body) {
      body.insertBefore(panel, body.firstChild);
    } else {
      (doc.body || doc.documentElement).appendChild(panel);
    }

    // wait-column timers
    if (!doc.__cvqTimer){
      doc.__cvqTimer = setInterval(()=>{
        const nodes = doc.querySelectorAll('#'+PANEL_ID+' [data-tick="1"]');
        for (let i=0;i<nodes.length;i++){
          const n = (parseInt(nodes[i].getAttribute('data-sec'),10) || 0) + 1;
          nodes[i].setAttribute('data-sec', String(n));
          nodes[i].textContent = mmss(n);
        }
      }, 1000);
    }

    addQueuesClickHandlers(doc);
    attachObserver(doc);
  }

  // ---- ACTION: CALL CENTER Remove Queues Tiles (cleanup + unhide originals) ----
  function removeQueuesTiles(){
    const docs = getSameOriginDocs();
    for (let i=0;i<docs.length;i++){
      const doc = docs[i];
      const p = doc.getElementById(PANEL_ID); if (p) p.remove();
      const hidden = doc.querySelectorAll(BODY_SEL+' '+CONTAINER_SEL+'[data-cv-hidden="1"]');
      for (let j=0;j<hidden.length;j++){ hidden[j].style.display=''; hidden[j].removeAttribute('data-cv-hidden'); }
      if (doc.__cvqTimer){ clearInterval(doc.__cvqTimer); doc.__cvqTimer=null; }
      closeModal(doc);
      detachObserver(doc);
    }
  }

  // ---- WATCHER: CALL CENTER Observe SPA Rerenders (re-inject if needed) ----
  function attachObserver(doc){
    if (doc.__cvqMO) return;
    const mo = new MutationObserver(()=>{
      if (!QUEUES_REGEX.test(location.href)) return;

      // If our modal is OPEN, do nothing (prevents flicker close)
      const md = doc.getElementById('cvq-modal');
      if (md && md.classList.contains('is-open')) return;

      const body = doc.querySelector(BODY_SEL); if (!body) return;
      const container = body.querySelector(CONTAINER_SEL);
      const panel = doc.getElementById(PANEL_ID);

      if (container && container.style.display !== 'none') scheduleInject(injectQueuesTiles);
      else if (!panel && (body || container))            scheduleInject(injectQueuesTiles);
    });
    mo.observe(doc.documentElement || doc, { childList:true, subtree:true });
    doc.__cvqMO = mo;
  }
  function detachObserver(doc){ if(doc.__cvqMO){ try{doc.__cvqMO.disconnect();}catch{} delete doc.__cvqMO; } }

  // ---- WATCHER: CALL CENTER Route Changes (enter/leave manager page) ----
  function waitAndInject(tries){
    tries = tries || 0;
    const found = findQueuesDoc();
    if (found && (found.body || tries>=3)) { scheduleInject(injectQueuesTiles); return; }
    if (tries>=12) return;
    setTimeout(()=>waitAndInject(tries+1),300);
  }
  function onEnter(){ waitAndInject(0); }
 
  function route(prev, next){
  const was = AGENTS_REGEX.test(prev), is = AGENTS_REGEX.test(next);
  if (!was && is) { 
    waitAndInject(0);
    startGlobalLunchTicker();   // <-- ensure ticking even if panel pre-existed
  }
  if (was && !is) remove();
}


  // ---- CALL CENTER WATCHER: URL (push/replace/popstate + SPA) ----
  (function watchURL(){
    let last = location.href;
    const push = history.pushState, rep = history.replaceState;
    history.pushState    = function(){ const prev=last; const ret=push.apply(this,arguments); const now=location.href; last=now; handleRoute(prev,now); return ret; };
    history.replaceState = function(){ const prev=last; const ret=rep.apply(this,arguments);  const now=location.href; last=now; handleRoute(prev,now); return ret; };
    new MutationObserver(()=>{ if(location.href!==last){ const prev=last, now=location.href; last=now; handleRoute(prev,now); } })
      .observe(document.documentElement,{childList:true,subtree:true});
    window.addEventListener('popstate',()=>{ const prev=last, now=location.href; if(now!==prev){ last=now; handleRoute(prev,now); } });
    if (QUEUES_REGEX.test(location.href)) onEnter();
  })();
}


// ==============================
// ==============================
// Clarity Voice Agents Panel — fixed icon sizing + Stats modal
// ==============================
if (!window.__cvAgentsPanelInit) {
  window.__cvAgentsPanelInit = true;

  var AGENTS_REGEX     = /\/portal\/agents\/manager(?:[\/?#]|$)/;
  var NATIVE_TABLE_SEL = '#agents-table';
  var CONTAINER_SEL    = '.table-container';
  var PANEL_ID         = 'cv-agents-panel';
  var PANEL_STYLE_ID   = 'cv-agents-style';

  // Icons
  var ICON_USER   = 'https://raw.githubusercontent.com/democlarityvoice-del/clickabledemo/refs/heads/main/user-solid-full.svg';
  var ICON_PHONE  = 'https://raw.githubusercontent.com/democlarityvoice-del/clickabledemo/refs/heads/main/office-phone-svgrepo-com.svg';
  var ICON_STATS  = 'https://raw.githubusercontent.com/democlarityvoice-del/clickabledemo/refs/heads/main/signal-solid-full.svg';
  var ICON_QUEUES = 'https://raw.githubusercontent.com/democlarityvoice-del/clickabledemo/refs/heads/main/ellipsis-solid-full.svg';
  var ICON_LISTEN = 'https://raw.githubusercontent.com/democlarityvoice-del/clickabledemo/refs/heads/main/speakericon.svg';

  // Agents (Bob gray/offline — NO lunch)
  var AGENTS = [
    { name:'Mike Johnson',      ext:200, online:true,  icon:'phone' },
    { name:'Cathy Thomas',      ext:201, online:true,  icon:'user'  },
    { name:'Jake Lee',          ext:202, online:false, icon:'user'  },
    { name:'Bob Andersen',      ext:203, online:false, icon:'user'  },
    { name:'Brittany Lawrence', ext:204, online:true,  icon:'phone' },
    { name:'Alex Roberts',      ext:205, online:true,  icon:'user'  },
    { name:'Mark Sanchez',      ext:206, online:true,  icon:'phone' },
    { name:'John Smith',        ext:207, online:true,  icon:'user'  }
  ];

  // ---------- helpers ----------
  function getDocs(){
    var docs = [document], ifrs = document.getElementsByTagName('iframe');
    for (var i=0;i<ifrs.length;i++){
      try {
        var d = ifrs[i].contentDocument || (ifrs[i].contentWindow && ifrs[i].contentWindow.document);
        if (d) docs.push(d);
      } catch(e){}
    }
    return docs;
  }
  function findBits(){
    var docs = getDocs();
    for (var i=0;i<docs.length;i++){
      var doc = docs[i], table = doc.querySelector(NATIVE_TABLE_SEL);
      if (table){
        var container = (table.closest && table.closest(CONTAINER_SEL)) || table.parentElement || doc.body;
        return { doc:doc, table:table, container:container };
      }
    }
    return null;
  }

  // ---------- styles (ALWAYS refresh) ----------
  function ensureStyles(doc){
    var s = doc.getElementById(PANEL_STYLE_ID);
    if (!s){ s = doc.createElement('style'); s.id = PANEL_STYLE_ID; (doc.head||doc.documentElement).appendChild(s); }
    s.textContent = [
      '#',PANEL_ID,'{margin-top:6px;background:#fff;border-radius:6px;box-shadow:0 1px 3px rgba(0,0,0,.1);overflow:hidden}',
      '#',PANEL_ID,' .cv-row{display:block;padding:8px 12px;border-bottom:1px solid #eee}',
      '#',PANEL_ID,' .cv-row:last-child{border-bottom:none}',
      '#',PANEL_ID,' .cv-top{display:flex;align-items:center;justify-content:space-between;gap:10px}',
      '#',PANEL_ID,' .cv-left{display:flex;align-items:center;gap:10px;min-width:0}',
      '#',PANEL_ID,' .cv-name{font:400 13px/1.35 "Helvetica Neue", Arial, Helvetica, sans-serif;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',

      /* glyphs */
      '#',PANEL_ID,' .cv-glyph{width:20px;height:20px;display:inline-block;border-radius:3px;background:#167a32}',
      '#',PANEL_ID,' .cv-glyph[data-icon="user"]{-webkit-mask:url(',ICON_USER,') center/contain no-repeat;mask:url(',ICON_USER,') center/contain no-repeat;}',
      '#',PANEL_ID,' .cv-glyph[data-icon="phone"]{-webkit-mask:url(',ICON_PHONE,') center/contain no-repeat;mask:url(',ICON_PHONE,') center/contain no-repeat;}',

      /* tools */
      '#',PANEL_ID,' .cv-tools{display:flex;align-items:center;gap:10px;opacity:0;visibility:hidden;transition:opacity .15s}',
      '#',PANEL_ID,' .cv-row:hover .cv-tools{opacity:1;visibility:visible}',
      '#',PANEL_ID,' .cv-tool{width:20px;height:20px;opacity:.75;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}',
      '#',PANEL_ID,' .cv-tool:hover{opacity:1}',
      '#',PANEL_ID,' .cv-tool img{width:20px;height:20px;display:block}',

      /* offline */
      '#',PANEL_ID,' .is-offline .cv-glyph{background:#9ca3af}',
      '#',PANEL_ID,' .is-offline .cv-name{color:#9aa0a6}',

      /* modal */
      'body.cv-modal-open{overflow:hidden}',
      '#cv-modal-root{position:fixed;inset:0;z-index:2147483646;pointer-events:none}',
      '#cv-modal-root.is-open{pointer-events:auto}',
      '#cv-modal-root .cv-scrim{position:fixed;inset:0;background:rgba(0,0,0,.35);opacity:0;transition:opacity .18s}',
      '#cv-modal-root.is-open .cv-scrim{opacity:1}',
      '#cv-modal-root .cv-dialog{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(1);min-width:360px;max-width:1024px;max-height:80vh;background:#fff;border-radius:10px;box-shadow:0 12px 30px rgba(0,0,0,.18);display:flex;flex-direction:column;opacity:1}',
      '#cv-modal-root .cv-modal-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #eee}',
      '#cv-modal-root .cv-modal-title{font:600 14px/1.2 "Helvetica Neue", Arial, Helvetica, sans-serif;color:#222}',
      '#cv-modal-root .cv-modal-body{padding:16px;overflow:auto}',
      '#cv-modal-root .cv-modal-footer{padding:12px 16px;border-top:1px solid #eee;display:flex;justify-content:flex-end;gap:8px}',
      '#cv-modal-root .cv-btn{padding:8px 12px;border-radius:8px;font:600 13px/1.2 Arial;cursor:pointer;border:1px solid #ddd;background:#fff}',
      '#cv-modal-root .cv-btn-primary{background:#167a32;color:#fff;border-color:#167a32}',
      '#cv-modal-root .cv-stats-wrap{display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:auto;gap:16px;min-width:980px;}',
      '#cv-modal-root .cv-stats-list{list-style:none;margin:0;padding:0 0 0 8px;font:600 13px/1.6 Arial;color:#222;}',
      '#cv-modal-root .cv-stats-list li{display:flex;gap:12px;align-items:baseline;}',
      '#cv-modal-root .cv-stats-num{width:44px;text-align:right;color:#333;}',
      '#cv-modal-root .cv-chart{background:#fff;border:1px solid #eee;border-radius:8px;padding:12px;}',
      '#cv-modal-root .cv-chart h5{margin:0 0 8px 0;font:600 12px/1.2 Arial;color:#555;}',
      '#cv-modal-root .cv-chart-pie{width:var(--size);height:var(--size);border-radius:50%;background:conic-gradient(#2f66d0 var(--deg), #d33 0);} ',
      '#cv-modal-root .cv-chart-pie::after{content:"";width:calc(var(--size) - 70px);height:calc(var(--size) - 70px);background:#fff;border-radius:50%;display:block;margin:auto;margin-top:35px;}',
      '#cv-modal-root .cv-stats-title{font:700 18px/1.2 "Helvetica Neue", Arial;color:#222;margin:0 0 10px;}',
      '#cv-modal-root .cv-stats-head{grid-column:1 / span 2;border-bottom:1px solid #eee;margin-bottom:6px;padding-bottom:6px;}'
    ].join('');
  }

  // ---------- panel ----------
  function buildPanel(doc){
    var panel = doc.createElement('div');
    panel.id = PANEL_ID;

    var frag = doc.createDocumentFragment();
    for (var i=0;i<AGENTS.length;i++){
      var a = AGENTS[i];
      var row = doc.createElement('div');
      row.className = 'cv-row' + (!a.online ? ' is-offline' : '');
      row.setAttribute('data-ext', String(a.ext));

      var top = doc.createElement('div'); top.className = 'cv-top';
      var left = doc.createElement('div'); left.className = 'cv-left';

      var glyph = doc.createElement('span');
      glyph.className = 'cv-glyph';
      glyph.setAttribute('data-icon', a.icon === 'phone' ? 'phone' : 'user');

      var name = doc.createElement('div');
      name.className = 'cv-name';
      name.textContent = 'Ext ' + a.ext + ' (' + a.name + ')';

      left.appendChild(glyph); left.appendChild(name);

      var tools = doc.createElement('div');
      tools.className = 'cv-tools';
      // inline style fallback so icons NEVER blow up; width/height attributes too
      tools.setAttribute('style','display:flex;align-items:center;gap:10px;');

      tools.innerHTML =
        '<span class="cv-tool cv-tool-stats" data-tool="stats" title="Stats" aria-label="Stats">' +
          '<img alt="" width="20" height="20" style="width:20px;height:20px;display:block" src="'+ICON_STATS+'">' +
        '</span>' +
        '<span class="cv-tool" data-tool="queues" title="Queues" aria-label="Queues">' +
          '<img alt="" width="20" height="20" style="width:20px;height:20px;display:block" src="'+ICON_QUEUES+'">' +
        '</span>' +
        '<span class="cv-tool" data-tool="listen" title="Listen in" aria-label="Listen in">' +
          '<img alt="" width="20" height="20" style="width:20px;height:20px;display:block" src="'+ICON_LISTEN+'">' +
        '</span>';

      top.appendChild(left); top.appendChild(tools);
      row.appendChild(top); frag.appendChild(row);
    }
    panel.appendChild(frag);
    return panel;
  }

  // ---------- modal ----------
  function ensureModalHost(doc){
    if (!doc.getElementById('cv-modal-root')){
      var root = doc.createElement('div'); root.id = 'cv-modal-root';
      (doc.body||doc.documentElement).appendChild(root);
    }
  }
  function openStatsModal(doc, opts){
    ensureModalHost(doc);
    var root = doc.getElementById('cv-modal-root');
    var title = (opts && opts.title) || '';
    var bodyHTML = (opts && opts.bodyHTML) || '';
    root.innerHTML = [
      '<div class="cv-scrim"></div>',
      '<div class="cv-dialog" role="dialog" aria-modal="true" aria-labelledby="cv-modal-title">',
        '<div class="cv-modal-header"><div class="cv-modal-title" id="cv-modal-title">',title,'</div>',
          '<button class="cv-modal-close" aria-label="Close">×</button></div>',
        '<div class="cv-modal-body">',bodyHTML,'</div>',
        '<div class="cv-modal-footer"><button class="cv-btn cv-btn-primary" data-btn="primary">Close</button></div>',
      '</div>'
    ].join('');

    function close(){ root.classList.remove('is-open'); root.innerHTML=''; document.body.classList.remove('cv-modal-open'); }
    root.querySelector('.cv-scrim').addEventListener('click', close);
    root.querySelector('.cv-modal-close').addEventListener('click', close);
    root.querySelector('[data-btn="primary"]').addEventListener('click', close);
    root.classList.add('is-open'); document.body.classList.add('cv-modal-open');
  }

  // ----- canned stats -----
  var CV_STATS_SETS = {
    A: { metrics:{callCenterCallsToday:10,callCenterTalkTime:13,callCenterAvgTalk:'1:23',inboundCallsToday:10,inboundTalkTime:14,inboundAvgTalk:'1:23',outboundCallsToday:5,outboundTalkTime:22,outboundAvgTalk:'4:24',avgACW:'0.0'},
         perHour:[4,4,5,0,0,0,0,1,1,4,0,0,0,0,0,0,0,0,0,1,2,3,0,4],
         perDay:[27,38,30,24,27,29,28,47,29,42], pie:{pct1:100,pct2:0} },
    B: { metrics:{callCenterCallsToday:14,callCenterTalkTime:24,callCenterAvgTalk:'1:46',inboundCallsToday:16,inboundTalkTime:29,inboundAvgTalk:'1:45',outboundCallsToday:5,outboundTalkTime:22,outboundAvgTalk:'4:24',avgACW:'0.0'},
         perHour:[1,4,5,3,2,2,0,0,0,0,0,0,0,0,0,0,1,4,4,5,0,4,4,5],
         perDay:[36,65,39,44,46,27,30,48,50,43], pie:{pct1:88.9,pct2:11.1} }
  };
  function barSVG(values, max, w, h, gap){
    max = max || Math.max(1, Math.max.apply(null, values));
    var n=values.length, bw=Math.floor((w-(n+1)*gap)/n), x=gap, out=['<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'">'];
    for (var i=0;i<n;i++){ var v=values[i], bh=Math.round((v/max)*h), y=h-bh; out.push('<rect x="'+x+'" y="'+y+'" width="'+bw+'" height="'+bh+'" rx="2" ry="2" fill="#e57027"></rect>'); x+=bw+gap; }
    out.push('</svg>'); return out.join('');
  }
  function pieHTML(pct, size){
  pct = Math.max(0, Math.min(100, pct));
  var deg = (pct/100)*360;
  return '<div class="cv-chart-pie" data-pct="'+pct.toFixed(1)+'" style="--size:'+size+'px; --deg:'+deg+'deg;"></div>';
}
      '<div class="cv-stats-wrap">',
        '<div class="cv-stats-head"><div class="cv-stats-title">Statistics for ',name,' (',ext,')</div></div>',
        '<div><ul class="cv-stats-list">',
          '<li><span class="cv-stats-num">',m.callCenterCallsToday,'</span> <span>Call Center Calls Today</span></li>',
          '<li><span class="cv-stats-num">',m.callCenterTalkTime,'</span> <span>Call Center Talk Time</span></li>',
          '<li><span class="cv-stats-num">',m.callCenterAvgTalk,'</span> <span>Call Center Average Talk</span></li>',
          '<li><span class="cv-stats-num">',m.inboundCallsToday,'</span> <span>Inbound Calls Today</span></li>',
          '<li><span class="cv-stats-num">',m.inboundTalkTime,'</span> <span>Inbound Talk Time</span></li>',
          '<li><span class="cv-stats-num">',m.inboundAvgTalk,'</span> <span>Inbound Average Talk</span></li>',
          '<li><span class="cv-stats-num">',m.outboundCallsToday,'</span> <span>Outbound Calls Today</span></li>',
          '<li><span class="cv-stats-num">',m.outboundTalkTime,'</span> <span>Outbound Talk Time</span></li>',
          '<li><span class="cv-stats-num">',m.outboundAvgTalk,'</span> <span>Outbound Average Talk</span></li>',
          '<li><span class="cv-stats-num">',m.avgACW,'</span> <span>Avg ACW</span></li>',
        '</ul></div>',
        '<div class="cv-chart"><h5>My Calls Per Hour (last 24 hours)</h5>',b1,'</div>',
        '<div class="cv-chart"><h5>My Calls Per Day (last 10 days)</h5>',b2,'</div>',
        '<div class="cv-chart"><h5>Calls by Origination Source (last 24 hours)</h5>',p,(data.pie.pct2?'<div style="font:600 12px/1.2 Arial;color:#555;margin-top:8px;">'+data.pie.pct1.toFixed(1)+'% / '+data.pie.pct2.toFixed(1)+'%</div>':''),'</div>',
      '</div>'
    ].join('');
  }
  function openStatsForRow(doc,row){
    if (!row) return;
    var name = (row.querySelector('.cv-name')||{}).textContent || 'Agent';
    var ext  = (row.getAttribute('data-ext')||'').replace(/[^\d]/g,'') || (name.match(/Ext\s+(\d{2,6})/i)||[])[1] || '200';
    var v = (parseInt(ext,10)%2===0) ? 'B' : 'A';
    openStatsModal(doc, { title:'', bodyHTML: buildStatsHTML(doc,name,ext,CV_STATS_SETS[v]) });
  }

  // ---------- inject/remove ----------
  function inject(){
    var bits = findBits(); if (!bits) return;
    var doc = bits.doc, table = bits.table, container = bits.container;
    if (doc.getElementById(PANEL_ID)) return;

    ensureStyles(doc);

    if (table && table.style){ table.setAttribute('data-cv-hidden','1'); table.style.display='none'; }
    var panel = buildPanel(doc);
    if (container && container.insertBefore){ container.insertBefore(panel, table || null); }
    else { (doc.body||doc.documentElement).appendChild(panel); }

    // single delegated click
    if (!doc.__cvAgentsStatsWired){
      doc.addEventListener('click', function(e){
        var btn = e.target && e.target.closest && e.target.closest('#'+PANEL_ID+' .cv-tool-stats, #'+PANEL_ID+' [data-tool="stats"]');
        if (!btn) return;
        openStatsForRow(doc, btn.closest('.cv-row'));
      }, true);
      doc.__cvAgentsStatsWired = true;
    }
  }
  function remove(){
    var docs = getDocs();
    for (var i=0;i<docs.length;i++){
      var doc = docs[i];
      var p = doc.getElementById(PANEL_ID); if (p) p.remove();
      var t = doc.querySelector(NATIVE_TABLE_SEL+'[data-cv-hidden="1"]');
      if (t){ t.style.display=''; t.removeAttribute('data-cv-hidden'); }
    }
  }
  function waitAndInject(tries){
    tries=tries||0; if (!AGENTS_REGEX.test(location.href)) return;
    var bits = findBits(); if (bits){ inject(); return; }
    if (tries>=25) return; setTimeout(function(){ waitAndInject(tries+1); }, 250);
  }
  (function watch(){
    var last = location.href, push=history.pushState, rep=history.replaceState;
   // REPLACE the old route() with this (and keep the name handleRoute
  // because your watcher already calls handleRoute)
  function handleRoute(prev, next){
    const was = QUEUES_REGEX.test(prev), is = QUEUES_REGEX.test(next);
    if (!was && is) onEnter();
    if ( was && !is) removeQueuesTiles();
}

    history.pushState=function(){ var p=last; var r=push.apply(this,arguments); var n=location.href; last=n; route(p,n); return r; };
    history.replaceState=function(){ var p=last; var r=rep.apply(this,arguments); var n=location.href; last=n; route(p,n); return r; };
    new MutationObserver(function(){ if(location.href!==last){ var p=last,n=location.href; last=n; route(p,n);} }).observe(document.documentElement,{childList:true,subtree:true});
    window.addEventListener('popstate',function(){ var p=last,n=location.href; if(n!==p){ last=n; route(p,n);} });
    if (AGENTS_REGEX.test(location.href)) waitAndInject(0);
  })();
}

/* charts: flat/sparkline style to match reference */
(function(){
  var s = document.createElement('style');
  s.textContent =
    /* give SVG bars top/bottom margin so the bottom border doesn't look like an axis */
    '#cv-modal-root .cv-chart svg{display:block;margin:10px 8px 14px;}'+
    /* solid pie; center % label; no inner hole */
    '#cv-modal-root .cv-chart{overflow:visible;}'+
    '#cv-modal-root .cv-chart-pie{position:relative;display:block;width:var(--size);height:var(--size);margin:8px auto;border-radius:50%;'+
      'background:conic-gradient(#2f66d0 var(--deg), #d33 0);}'+
    '#cv-modal-root .cv-chart-pie::after{display:none;}'+
    '#cv-modal-root .cv-chart-pie::before{content:attr(data-pct) \"%\";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);'+
      'font:600 12px/1 Arial;color:#fff;}';
  (document.head||document.documentElement).appendChild(s);
})();


