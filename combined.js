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

  // -------- BUILD HOME SOURCE -------- //
  function buildSrcdoc() {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { box-sizing: border-box; }
  html, body { width: 100%; overflow-x: hidden; }
  :root { --icon-muted: rgba(0,0,0,.38); --icon-hover: rgba(0,0,0,.60); --icon-active: #000; --icon-size: 18px; }
  body { font-family: Arial, sans-serif; margin: 0; background: #fff; color: #000; }
  .call-container { background:#fff; padding:0 16px 20px; border-radius:6px; box-shadow:0 2px 5px rgba(0,0,0,0.1); width:100%; max-width:100%; }
  table { width:100%; table-layout:auto; border-collapse:collapse; background:#fff; }
  thead th { font-weight:700; padding:10px 12px; font-size:14px; text-align:left; border-bottom:1px solid #ddd; white-space:nowrap; }
  td { padding:10px 12px; text-align:left; font-size:14px; border-bottom:1px solid #ddd; white-space:nowrap; }
  tr:hover { background:#f5f5f5; }
  .listen-btn { display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; background:#f0f0f0; border-radius:50%; border:none; cursor:pointer; }
  .listen-btn:focus { outline:none; }
  .svgbak { width:var(--icon-size); height:var(--icon-size); }
  .svgbak path { fill:var(--icon-muted); transition:fill .2s ease; }
  tr:hover .svgbak path { fill:var(--icon-hover); }
  .listen-btn.is-active .svgbak path { fill:var(--icon-active); }
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
            <svg class="svgbak" viewBox="0 0 24 24" role="img" aria-label="Listen in">
              <path d="M3 10v4h4l5 5V5L7 10H3z"></path>
              <path d="M14.5 3.5a.75.75 0 0 1 1.06 0 9 9 0 0 1 0 12.73.75.75 0 0 1-1.06-1.06 7.5 7.5 0 0 0 0-10.6.75.75 0 0 1 0-1.06z"></path>
            </svg>
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
        hidden.style.display = '';
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
      anchor.style.display = 'none';
      anchor.setAttribute('data-cv-demo-hidden','1');
    }

    const iframe = document.createElement('iframe');
    iframe.id = IFRAME_ID;
    iframe.style.cssText = 'border:none;width:100%;display:block;margin-top:0;height:360px;';
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
  const CARD_STYLE_ID       = 'cv-grid-stats-style';

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
// ==============================
// Clarity Voice Queues Tiles (CALL CENTER MANAGER) — full injection
// ==============================
if (!window.__cvQueuesTilesInit) {
  window.__cvQueuesTilesInit = true;

  // ---- CONSTANTS ----
  const QUEUES_REGEX        = /\/portal\/agents\/manager(?:[\/?#]|$)/;
  const BODY_SEL            = '#home-queues-body';
  const CONTAINER_SEL       = '.table-container';
  const TABLE_SEL           = '#manager_queues';
  const PANEL_ID            = 'cvq-panel';
  const PANEL_STYLE_ID      = 'cvq-panel-style';

  // ---- UTIL ----
  function scheduleInject(fn){ let f=false; requestAnimationFrame(()=>requestAnimationFrame(()=>{f=true;fn();})); setTimeout(()=>{if(!f)fn();},64); }
  function getSameOriginDocs(){
    const docs=[document];
    document.querySelectorAll('iframe').forEach(ifr=>{
      try{ const d=ifr.contentDocument || (ifr.contentWindow&&ifr.contentWindow.document); if(d) docs.push(d); }catch{}
    });
    return docs;
  }
  function findQueuesDoc(){
    for (const doc of getSameOriginDocs()) {
      const body = doc.querySelector(BODY_SEL);
      if (!body) continue;
      const container = body.querySelector(CONTAINER_SEL);
      const table = body.querySelector(TABLE_SEL);
      return { doc, body, container, table };
    }
    return null;
  }

  // ---- DATA ----
const QUEUE_DATA = [
  { key:'main',     title:'Main Routing (300)',      active:0, waiting:0, timer:false, idle:7 },
  { key:'sales',    title:'New Sales (301)',         active:3, waiting:1, timer:true,  idle:6 },
  { key:'existing', title:'Existing Customer (302)', active:1, waiting:1, timer:true,  idle:4 },
  { key:'billing',  title:'Billing (303)',           active:0, waiting:0, timer:false, idle:1 }
];
const fmt = (sec)=>{ sec|=0; const m=String((sec/60|0)).padStart(2,'0'); const s=String(sec%60).padStart(2,'0'); return `${m}:${s}`; };


  // ---- STYLES ----
  function ensureStyles(doc){
  if (doc.getElementById(PANEL_STYLE_ID)) return;
  const s = doc.createElement('style');
  s.id = PANEL_STYLE_ID;
  s.textContent = `
/* wrapper behaves like the native one so placement/alignment match */
#${PANEL_ID}.table-container{margin-top:6px;}
#${PANEL_ID} table{width:100%;}

/* typography/spacing to match the house style */
#${PANEL_ID} thead th{white-space:nowrap;}
#${PANEL_ID} td, #${PANEL_ID} th{vertical-align:middle;}

/* numeric cells look like links in the UI (blue & boldish) */
#${PANEL_ID} .cvq-num{color:#0b84ff; font-weight:700;}

/* wait cell */
#${PANEL_ID} .cvq-wait{color:#333;}

/* simple placeholders for the 3 action icons on the right */
#${PANEL_ID} .cvq-actions{white-space:nowrap; text-align:center;}
#${PANEL_ID} .cvq-actions .cvq-icon{
  display:inline-block; width:18px; height:18px; border-radius:50%;
  background:#f5f5f5; border:1px solid #e2e2e2; margin-left:6px; vertical-align:middle;
}
@media (max-width: 900px){
  #${PANEL_ID} .hide-sm{display:none;}
}
  `;
  if (doc.head) doc.head.appendChild(s);
}
s.textContent += `
/* ——— actions column ——— */
#${PANEL_ID} table .cvq-actions,
${TABLE_SEL} .cvq-actions{ text-align:right; white-space:nowrap; width:64px; }

.cvq-icon{
  display:inline-flex; align-items:center; justify-content:center;
  width:22px; height:22px; border-radius:50%;
  background:#f7f7f7; border:1px solid #e1e1e1;
  margin-left:6px; opacity:.35; transition:opacity .15s, transform .04s;
}
tr:hover .cvq-icon{ opacity:.75; }
.cvq-icon:hover{ opacity:1; }
.cvq-icon svg{ width:14px; height:14px; }
`;


function buildActionCellHTML(){
  // Two round buttons: “monitor” and “settings” (fake actions for now)
  return `
    <td class="cvq-actions">
      <button class="cvq-icon" data-act="monitor" title="Monitor queue" aria-label="Monitor queue">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm0 12h16v2H4z"></path>
        </svg>
      </button>
      <button class="cvq-icon" data-act="settings" title="Queue settings" aria-label="Queue settings">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19.14 12.94a7.07 7.07 0 0 0 .05-.94 7.07 7.07 0 0 0-.05-.94l2.03-1.58a.5.5 0 0 0 .12-.65l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.35 7.35 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 1h-3.8a.5.5 0 0 0-.49.41l-.36 2.54a7.35 7.35 0 0 0-1.63.94l-2.39-.96a.5.5 0 0 0-.61.22L1.7 7.97a.5.5 0 0 0 .12.65l2.03 1.58a7.07 7.07 0 0 0-.05.94c0 .32.02.63.05.94L1.82 14.66a.5.5 0 0 0-.12.65l1.92 3.32a.5.5 0 0 0 .61.22l2.39-.96c.5.4 1.05.72 1.63.94l.36 2.54a.5.5 0 0 0 .49.41h3.8a.5.5 0 0 0 .49-.41l.36-2.54c.58-.22 1.13-.54 1.63-.94l2.39.96a.5.5 0 0 0 .61-.22l1.92-3.32a.5.5 0 0 0-.12-.65l-2.03-1.58zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z"></path>
        </svg>
      </button>
    </td>
  `;
}

function addActionIcons(doc){
  // Prefer our injected table; if not found, fall back to the native one
  const table = doc.querySelector(`#${PANEL_ID} table`) || doc.querySelector(`${TABLE_SEL}`);
  if (!table) return;

  // Ensure header cell exists (empty header for icons)
  const theadRow = table.tHead && table.tHead.rows[0];
  if (theadRow && !theadRow.querySelector('.cvq-actions-h')){
    const th = doc.createElement('th');
    th.className = 'cvq-actions-h cvq-actions';
    theadRow.appendChild(th);
  }

  // Append the two icons to each data row if not present
  Array.from(table.tBodies[0]?.rows || []).forEach(tr => {
    if (!tr.querySelector('.cvq-actions')){
      const wrap = doc.createElement('div');
      wrap.innerHTML = buildActionCellHTML();
      tr.appendChild(wrap.firstElementChild);
    }
  });
}

// Simple delegated click handler (optional; easy to replace later)
document.addEventListener('click', (e) => {
  const btn = e.target.closest && e.target.closest('.cvq-icon');
  if (!btn) return;
  const row = btn.closest('tr');
  const queueName = row ? row.cells[0].textContent.trim() : '';
  const act = btn.getAttribute('data-act');
  // TODO: hook up real behaviors
  console.log(`[cv] ${act} → ${queueName}`);
});
  

  // ---- BUILD PANEL ----
  function buildPanelHTML(){
  const rows = QUEUE_DATA.map(d => {
    const waitCell = d.timer
      ? `<span class="cvq-wait" id="cvq-wait-${d.key}" data-tick="1" data-sec="0">00:00</span>`
      : `<span class="cvq-wait">-</span>`;
    return `
      <tr>
        <td class="text-center"><input type="checkbox" tabindex="-1" /></td>
        <td class="cvq-queue">${d.title}</td>
        <td class="text-center"><span class="cvq-num">${d.active}</span></td>
        <td class="text-center"><span class="cvq-num">${d.waiting}</span></td>
        <td class="text-center">${waitCell}</td>
        <td class="text-center"><span class="cvq-num">${d.idle}</span></td>
        <td class="cvq-actions">
          <span class="cvq-icon" title="Action 1"></span>
          <span class="cvq-icon" title="Action 2"></span>
          <span class="cvq-icon" title="Action 3"></span>
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

 addActionIcons(doc);
 

  // ---- TIMERS ----
  function startTimers(doc){
    if (doc.__cvqTimer) return;
    doc.__cvqTimer = setInterval(()=>{
      doc.querySelectorAll(`#${PANEL_ID} [data-tick="1"]`).forEach(el=>{
        const n = (parseInt(el.getAttribute('data-sec'),10)||0) + 1;
        el.setAttribute('data-sec', String(n));
        el.textContent = fmt(n);
      });
    },1000);
  }
  function stopTimers(doc){ if(doc.__cvqTimer){ clearInterval(doc.__cvqTimer); doc.__cvqTimer=null; } }

  // ---- INJECT / REMOVE ----
  function injectQueuesTiles(){
    const found = findQueuesDoc();
    if (!found) return;
    const { doc, body, container } = found;

    ensureStyles(doc);

    // Already injected?
    if (doc.getElementById(PANEL_ID)) return;

    // Build panel
    const wrap = doc.createElement('div');
    wrap.innerHTML = buildPanelHTML();
    const panel = wrap.firstElementChild;

    // Hide the original table container and insert our panel in its place
    if (container && container.parentNode) {
      if (!container.hasAttribute('data-cv-hidden')) {
        container.setAttribute('data-cv-hidden','1');
        container.style.display = 'none';
      }
      container.parentNode.insertBefore(panel, container); // same stack position under the header
    } else if (body) {
      body.insertBefore(panel, body.firstChild);
    } else {
      (doc.body || doc.documentElement).appendChild(panel);
    }

    startTimers(doc);
    attachObserver(doc);
  }

  function removeQueuesTiles(){
    for (const doc of getSameOriginDocs()){
      // remove panel
      const p = doc.getElementById(PANEL_ID);
      if (p) p.remove();
      // unhide native container
      doc.querySelectorAll(`${BODY_SEL} ${CONTAINER_SEL}[data-cv-hidden="1"]`).forEach(n=>{
        n.style.display = ''; n.removeAttribute('data-cv-hidden');
      });
      stopTimers(doc);
      detachObserver(doc);
    }
  }

  // ---- OBSERVE SPA RERENDERS ----
  function attachObserver(doc){
    if (doc.__cvqMO) return;
    const mo = new MutationObserver(()=>{
      if (!QUEUES_REGEX.test(location.href)) return;
      const body = doc.querySelector(BODY_SEL);
      if (!body) return;

      // If our panel vanished or the app re-added the container, fix it
      const panel = doc.getElementById(PANEL_ID);
      const container = body.querySelector(CONTAINER_SEL);
      if (container && container.style.display !== 'none') {
        // Re-hide and re-inject panel in correct spot
        scheduleInject(injectQueuesTiles);
      } else if (!panel && (body || container)) {
        scheduleInject(injectQueuesTiles);
      }
    });
    mo.observe(doc.documentElement || doc, { childList:true, subtree:true });
    doc.__cvqMO = mo;
  }
  function detachObserver(doc){ if(doc.__cvqMO){ try{doc.__cvqMO.disconnect();}catch{} delete doc.__cvqMO; } }

  // ---- ROUTING WATCH ----
  function waitAndInject(tries=0){
    const found = findQueuesDoc();
    if (found && (found.body || tries>=3)) { scheduleInject(injectQueuesTiles); return; }
    if (tries>=12) return;
    setTimeout(()=>waitAndInject(tries+1),300);
  }
  function onEnter(){ waitAndInject(); }
  function handleRoute(prev,next){
    const was = QUEUES_REGEX.test(prev), is = QUEUES_REGEX.test(next);
    if (!was && is) onEnter();
    if ( was && !is) removeQueuesTiles();
  }

  (function watchURL(){
    let last = location.href;
    const push = history.pushState, rep = history.replaceState;

    history.pushState = function(){ const prev=last; const ret=push.apply(this,arguments); const now=location.href; last=now; handleRoute(prev,now); return ret; };
    history.replaceState = function(){ const prev=last; const ret=rep.apply(this,arguments); const now=location.href; last=now; handleRoute(prev,now); return ret; };

    new MutationObserver(()=>{ if(location.href!==last){ const prev=last, now=location.href; last=now; handleRoute(prev,now); } })
      .observe(document.documentElement,{childList:true,subtree:true});

    window.addEventListener('popstate',()=>{ const prev=last, now=location.href; if(now!==prev){ last=now; handleRoute(prev,now); } });

    if (QUEUES_REGEX.test(location.href)) onEnter();
  })();
}


