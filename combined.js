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
        hidden..display = '';
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
      anchor..display = 'none';
      anchor.setAttribute('data-cv-demo-hidden','1');
    }

    const iframe = document.createElement('iframe');
    iframe.id = IFRAME_ID;
    iframe..cssText = 'border:none;width:100%;display:block;margin-top:0;height:360px;';
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
  const CARD__ID       = 'cv-grid-stats-style';

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
// Clarity Voice Queues Tiles (CALL CENTER MANAGER) — full injection w/ tooltips + modal
// ==============================
if (!window.__cvQueuesTilesInit) {
  window.__cvQueuesTilesInit = true;

  // ---- CONSTANTS ----
  const QUEUES_REGEX   = /\/portal\/agents\/manager(?:[\/?#]|$)/;
  const BODY_SEL       = '#home-queues-body';
  const CONTAINER_SEL  = '.table-container';
  const TABLE_SEL      = '#manager_queues';
  const PANEL_ID       = 'cvq-panel';
  const PANEL_STYLE_ID = 'cvq-panel-style';

  // ---- UTIL ----
  function scheduleInject(fn){
    let fired = false;
    if ('requestAnimationFrame' in window) {
      requestAnimationFrame(()=>requestAnimationFrame(()=>{ fired = true; fn(); }));
    }
    setTimeout(()=>{ if(!fired) fn(); }, 64);
  }
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
  const fmt = (sec)=>{ sec|=0; const m=String((sec/60|0)).padStart(2,'0'); const s=String(sec%60).padStart(2,'0'); return `${m}:${s}`; };
  const asPhone = (num)=> {
    // expects ###-###-#### ; tolerates already formatted strings
    const m = String(num).replace(/[^\d]/g,'').match(/^(\d{3})(\d{3})(\d{4})$/);
    return m ? `(${m[1]}) ${m[2]}-${m[3]}` : num;
  };

  // ---- CALL CENTER QUEUE DATA ----
  const QUEUE_DATA = [
    { key:'main',     title:'Main Routing (300)',      active:0, waiting:0, timer:false, idle:7 },
    { key:'sales',    title:'New Sales (301)',         active:3, waiting:1, timer:true,  idle:6 },
    { key:'existing', title:'Existing Customer (302)', active:1, waiting:1, timer:true,  idle:4 },
    { key:'billing',  title:'Billing (303)',           active:0, waiting:0, timer:false, idle:1 }
  ];

  // lightweight fake callers per queue (only where waiting>0)
  const NOW = Date.now();
  const WAITING = {
    sales:    [{ id: '313-555-0108', name:'WIRELESS CALLER', status:'Waiting', start: NOW }],
    existing: [{ id: '517-555-0119', name:'WIRELESS CALLER', status:'Waiting', start: NOW }]
  };

  // ---- CALL CENTER QUEUE STYLES ----
  // ---- STYLES ----
function ensureStyles(doc){
  if (doc.getElementById(PANEL_STYLE_ID)) return;
  const s = doc.createElement('style');
  s.id = PANEL_STYLE_ID;
  s.textContent = `
/* table container (keep native spacing) */
#${PANEL_ID}.table-container{margin-top:6px;}
#${PANEL_ID} table{width:100%;}
#${PANEL_ID} thead th{white-space:nowrap;}
#${PANEL_ID} td,#${PANEL_ID} th{vertical-align:middle;}

/* numeric cells look like native links */
#${PANEL_ID} .cvq-link{color:#0b84ff; font-weight:700; text-decoration:none; cursor:pointer;}
#${PANEL_ID} .cvq-link:hover{text-decoration:underline;}

/* wait cell */
#${PANEL_ID} .cvq-wait{color:#333;}

/* actions column (icons at far right of main grid) */
#${PANEL_ID} .cvq-actions{ text-align:right; white-space:nowrap; width:64px; }
.cvq-icon{
  display:inline-flex; align-items:center; justify-content:center;
  width:22px; height:22px; border-radius:50%;
  background:#f7f7f7; border:1px solid #e1e1e1;
  margin-left:6px; opacity:.35; transition:opacity .15s, transform .04s;
}
tr:hover .cvq-icon{ opacity:.75; }
.cvq-icon:hover{ opacity:1; }
.cvq-icon svg{ width:14px; height:14px; }

/* ---------- Modal ---------- */
.cvq-modal-backdrop{
  position:fixed; inset:0; background:rgba(0,0,0,.35); z-index:9998; display:none;
}
.cvq-modal{
  position:fixed; left:50%; top:50%; transform:translate(-50%,-50%);
  background:#fff; border-radius:6px; box-shadow:0 8px 24px rgba(0,0,0,.25);
  width:min(940px, 96vw); max-height:80vh; display:none; z-index:9999;
  overflow:hidden;
}
.cvq-modal header{
  padding:14px 16px; border-bottom:1px solid #eee; font-size:18px; font-weight:600;
}
.cvq-modal .cvq-modal-body{ overflow:auto; max-height:calc(80vh - 110px); }
.cvq-modal footer{
  padding:12px 16px; border-top:1px solid #eee; display:flex; justify-content:flex-end; gap:10px;
}
.cvq-btn{ padding:6px 12px; border-radius:4px; border:1px solid #cfcfcf; background:#f7f7f7; cursor:pointer; }
.cvq-btn.primary{ background:#0b84ff; border-color:#0b84ff; color:#fff; }
.cvq-modal table{ width:100%; }
.cvq-modal thead th{ white-space:nowrap; }
.cvq-badge{ display:inline-block; padding:2px 6px; border-radius:4px; background:#2a77a8; color:#fff; font-size:12px; }
.cvq-kebab{ position:relative; }
.cvq-menu{
  position:absolute; right:0; top:100%; margin-top:6px; background:#fff; border:1px solid #ddd; border-radius:6px;
  box-shadow:0 8px 24px rgba(0,0,0,.16); min-width:160px; display:none; z-index:10;
}
.cvq-menu a{ display:block; padding:8px 12px; color:#222; text-decoration:none; }
.cvq-menu a:hover{ background:#f5f5f5; }
@media (max-width:900px){ #${PANEL_ID} .hide-sm{display:none;} }
  `;
  if (doc.head) doc.head.appendChild(s);

  // host for modals, once
  if (!doc.getElementById('cvq-modal-host')) {
    const host = doc.createElement('div');
    host.id = 'cvq-modal-host';
    host.innerHTML = `
      <div class="cvq-modal-backdrop" id="cvq-backdrop"></div>
      <div class="cvq-modal" id="cvq-modal">
        <header id="cvq-modal-title">Modal</header>
        <div class="cvq-modal-body"><div id="cvq-modal-content"></div></div>
        <footer><button class="cvq-btn" id="cvq-close">Close</button></footer>
      </div>`;
    (doc.body || doc.documentElement).appendChild(host);
  }
}


  // ---- CALL CENTER PANEL HTML ----
  // ---- BUILD PANEL ----
function buildPanelHTML(){
  const rows = QUEUE_DATA.map(d => {
    const waitCell = d.timer
      ? `<span class="cvq-wait" id="cvq-wait-${d.key}" data-tick="1" data-sec="0">00:00</span>`
      : `<span class="cvq-wait">-</span>`;
    return `
      <tr data-qkey="${d.key}">
        <td class="text-center"><input type="checkbox" tabindex="-1" /></td>
        <td class="cvq-queue">${d.title}</td>
        <td class="text-center"><a class="cvq-link" data-act="active">${d.active}</a></td>
        <td class="text-center"><a class="cvq-link" data-act="waiting">${d.waiting}</a></td>
        <td class="text-center">${waitCell}</td>
        <td class="text-center"><span class="cvq-link" data-act="agents">${d.idle ?? 0}</span></td>
        <td class="cvq-actions">
          <span class="cvq-icon" title="Queue tools"></span>
          <span class="cvq-icon" title="More"></span>
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


  // ---- CALL CENTER TOOLTIPS ----
  function mountTip(doc){ if (doc.getElementById('cvq-tip')) return;
    const t = doc.createElement('div'); t.id='cvq-tip'; t.className='cvq-tip'; t.style.display='none';
    doc.body.appendChild(t);
  }
  function showTip(doc, el, text){
    if (!text) return;
    const tip = doc.getElementById('cvq-tip'); if (!tip) return;
    tip.textContent = text; tip.style.display='block';
    const r = el.getBoundingClientRect();
    const top = r.top + (doc.defaultView?.scrollY||doc.documentElement.scrollTop) - 8;
    const left = r.left + r.width/2 + (doc.defaultView?.scrollX||doc.documentElement.scrollLeft);
    tip.style.top  = `${Math.max(8, top)}px`;
    tip.style.left = `${left}px`;
    tip.style.transform = 'translate(-50%, -100%)';
  }
  function hideTip(doc){ const tip = doc.getElementById('cvq-tip'); if (tip) tip.style.display='none'; }

  // ---- MODAL utils ----
function openModal(doc, title, tableHTML){
  const bd = doc.getElementById('cvq-backdrop');
  const md = doc.getElementById('cvq-modal');
  doc.getElementById('cvq-modal-title').textContent = title;
  doc.getElementById('cvq-modal-content').innerHTML = tableHTML;
  bd.style.display = 'block'; md.style.display = 'block';
  // start modal timer
  if (doc.__cvqModalTimer) clearInterval(doc.__cvqModalTimer);
  doc.__cvqModalTimer = setInterval(()=>{
    doc.querySelectorAll('[data-cvq-start]').forEach(el=>{
      const t0 = +el.getAttribute('data-cvq-start');
      el.textContent = mmss(((Date.now()-t0)/1000)|0);
    });
  },1000);
}
function closeModal(doc){
  const bd = doc.getElementById('cvq-backdrop');
  const md = doc.getElementById('cvq-modal');
  bd.style.display = 'none'; md.style.display = 'none';
  if (doc.__cvqModalTimer){ clearInterval(doc.__cvqModalTimer); doc.__cvqModalTimer = null; }
}
// one-time close wiring
(function wireGlobalClose(){
  document.addEventListener('click', (e)=>{
    const d = e.target.ownerDocument || document;
    if (e.target.id === 'cvq-close' || e.target.id === 'cvq-backdrop') closeModal(d);
  }, { once:false });
})();

// ---- build modal tables ----
function buildActiveTable(title, rows){
  const body = rows.map(r=>`
    <tr>
      <td>${r.from}</td>
      <td>${r.dialed}</td>
      <td>${r.status}</td>
      <td>${r.agent}</td>
      <td class="text-center"><span data-cvq-start="${r.start}">${mmss(((Date.now()-r.start)/1000)|0)}</span></td>
      <td class="text-center"><span class="cvq-icon" title="Listen in">👂</span></td>
    </tr>`).join('');
  return `
    <table class="table table-condensed table-hover">
      <thead>
        <tr><th>From</th><th>Dialed</th><th>Status</th><th>Agent</th><th>Duration</th><th class="text-center"></th></tr>
      </thead>
      <tbody>${body || `<tr><td colspan="6" class="text-center">No active calls</td></tr>`}</tbody>
    </table>`;
}

function buildWaitingTable(title, rows){
  const body = rows.map((r,i)=>`
    <tr data-row="${i}">
      <td>${r.caller}</td>
      <td>${r.name}</td>
      <td>${r.status} ${r.priority ? `<span class="cvq-badge">Priority</span>`:''}</td>
      <td class="text-center"><span data-cvq-start="${r.start}">${mmss(((Date.now()-r.start)/1000)|0)}</span></td>
      <td class="text-center">
        <span class="cvq-icon" title="Prioritize" data-cvq="prio">⬆️</span>
        <span class="cvq-icon cvq-kebab" title="Transfer" data-cvq="menu">⛓️
          <div class="cvq-menu">
            <a href="#" data-cvq="pickup">Pick up call</a>
            <a href="#" data-cvq="transfer">Transfer call</a>
          </div>
        </span>
      </td>
    </tr>`).join('');
  return `
    <table class="table table-condensed table-hover">
      <thead>
        <tr><th>Caller ID</th><th>Name</th><th>Status</th><th>Duration</th><th class="text-center"></th></tr>
      </thead>
      <tbody>${body || `<tr><td colspan="5" class="text-center">No waiting callers</td></tr>`}</tbody>
    </table>`;
}

// ---- click handlers on the main grid ----
function addQueuesClickHandlers(doc){
  if (doc.__cvqClicksWired) return;
  doc.__cvqClicksWired = true;

  // open modals from counts
  doc.addEventListener('click', (e)=>{
    const link = e.target.closest?.('.cvq-link');
    if (!link || !doc.getElementById(PANEL_ID)?.contains(link)) return;
    e.preventDefault();
    const tr = link.closest('tr');
    const qkey = tr?.getAttribute('data-qkey');
    const q = QUEUE_DATA.find(x=>x.key===qkey);
    if (!q) return;

    if (link.getAttribute('data-act') === 'active'){
      const rows = makeActiveRows(qkey, q.active);
      openModal(doc, `Calls active in ${q.title}`, buildActiveTable(q.title, rows));
      return;
    }
    if (link.getAttribute('data-act') === 'waiting'){
      const rows = makeWaitingRows(qkey, q.waiting);
      openModal(doc, `Callers in ${q.title}`, buildWaitingTable(q.title, rows));
      return;
    }
    // agents click = no-op for now
  });

  // waiting table: prioritize toggle, open/close menu
  doc.addEventListener('click', (e)=>{
    const inModal = e.target.closest?.('#cvq-modal-content');
    if (!inModal) return;

    // prioritize
    if (e.target.closest?.('[data-cvq="prio"]')){
      const rowEl = e.target.closest('tr');
      const idx = +rowEl.getAttribute('data-row');
      const title = doc.getElementById('cvq-modal-title').textContent;
      // find qkey by title match
      const q = QUEUE_DATA.find(q=> title.includes(q.title));
      if (!q) return;
      const rows = makeWaitingRows(q.key, q.waiting);
      rows[idx].priority = !rows[idx].priority;
      // re-render status cell
      rowEl.cells[2].innerHTML = `Waiting ${rows[idx].priority ? `<span class="cvq-badge">Priority</span>`:''}`;
      return;
    }

    // kebab menu open/close
    const menuBtn = e.target.closest?.('[data-cvq="menu"]');
    if (menuBtn){
      const menu = menuBtn.querySelector('.cvq-menu');
      const all = inModal.querySelectorAll('.cvq-menu');
      all.forEach(m=>{ if(m!==menu) m.style.display='none'; });
      menu.style.display = menu.style.display==='block' ? 'none' : 'block';
      e.stopPropagation();
      return;
    }

    // menu items (just close menu for demo)
    if (e.target.matches('.cvq-menu a')){
      e.preventDefault();
      const menu = e.target.closest('.cvq-menu');
      menu.style.display='none';
      return;
    }
  });

  // close any open transfer menus when clicking elsewhere
  document.addEventListener('click', (e)=>{
    const c = document.getElementById('cvq-modal-content');
    if (!c) return;
    c.querySelectorAll('.cvq-menu').forEach(m=> m.style.display='none');
  });
}

  // ---- CALL CENTER MODAL ----
  function closeMenus(doc){ doc.querySelectorAll('.cvq-menu').forEach(n=>n.remove()); }
  function closeModal(doc){
    closeMenus(doc);
    const bd = doc.getElementById('cvq-backdrop'); if (bd) bd.remove();
    const m  = doc.getElementById('cvq-modal');    if (m)  m.remove();
    if (doc.__cvqModalTimer){ clearInterval(doc.__cvqModalTimer); doc.__cvqModalTimer=null; }
  }
  function openModal(doc, kind, qkey){
    const q = QUEUE_DATA.find(x=>x.key===qkey); if(!q) return;
    // content rows (waiting vs active are the same shape for this demo)
    const rows = (kind==='waiting' ? (WAITING[qkey]||[]) : [])
      .map((c,i)=>`
        <tr data-i="${i}">
          <td>${asPhone(c.id)}</td>
          <td>${c.name}</td>
          <td><span data-status>${c.status}</span></td>
          <td>
            <span data-sec="${Math.floor((Date.now()-c.start)/1000)}" data-tick="1">${fmt((Date.now()-c.start)/1000)}</span>
            <button class="cvq-icon" data-mact="prio"    data-tip="Prioritize" aria-label="Prioritize"><svg viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z"/></svg></button>
            <button class="cvq-icon" data-mact="transfer" data-tip="Transfer"  aria-label="Transfer"><svg viewBox="0 0 24 24"><path d="M8 5v2h8.59L4 19.59 5.41 21 18 8.41V17h2V5z"/></svg></button>
          </td>
        </tr>`).join('') || '';
    // ---- DATA for modals ----
const REAL_DIDS = ['(248) 436-3443','(248) 436-3449','(313) 995-9080'];
const SAFE_FAKE_AC = ['900','700','999','888','511','600','311','322','456']; // never real
const AGENT_EXT_POOL = [201,203,204,207,211,215,218,219,222,227,231,235];

const mmss = (sec)=>{ sec|=0; const m=String((sec/60|0)).padStart(2,'0'); const s=String(sec%60).padStart(2,'0'); return `${m}:${s}`; };

// session cache so numbers remain stable while page is open
const CVQ_CACHE = { active:{}, waiting:{} };

function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function safeCallerID(){
  const ac = rand(SAFE_FAKE_AC);
  const last2 = String(Math.floor(Math.random()*100)).padStart(2,'0');
  return `(${ac}) 555-01${last2}`;
}
function pickAgentExt(i=0){ return AGENT_EXT_POOL[i % AGENT_EXT_POOL.length]; }
function pickRealDID(i=0){ return REAL_DIDS[i % REAL_DIDS.length]; }

function makeActiveRows(qkey, count){
  if (!CVQ_CACHE.active[qkey]) {
    const now = Date.now();
    CVQ_CACHE.active[qkey] = Array.from({length:count}, (_,i)=>({
      from: safeCallerID(),
      dialed: pickRealDID(i),
      status: 'Talking',
      agent: String(pickAgentExt(i)),
      start: now - Math.floor(Math.random()*90)*1000  // start somewhere in past 0..90s
    }));
  } else {
    // grow/shrink to requested size
    const cur = CVQ_CACHE.active[qkey];
    while (cur.length < count) cur.push({
      from: safeCallerID(),
      dialed: pickRealDID(cur.length),
      status: 'Talking',
      agent: String(pickAgentExt(cur.length)),
      start: Date.now()
    });
    CVQ_CACHE.active[qkey] = cur.slice(0, count);
  }
  return CVQ_CACHE.active[qkey];
}

function makeWaitingRows(qkey, count){
  if (!CVQ_CACHE.waiting[qkey]) {
    const now = Date.now();
    CVQ_CACHE.waiting[qkey] = Array.from({length:count}, ()=>({
      caller: safeCallerID(),
      name: 'WIRELESS CALLER',
      status: 'Waiting',
      priority: false,
      start: now - Math.floor(Math.random()*20)*1000
    }));
  } else {
    const cur = CVQ_CACHE.waiting[qkey];
    while (cur.length < count) cur.push({
      caller: safeCallerID(),
      name: 'WIRELESS CALLER',
      status: 'Waiting',
      priority: false,
      start: Date.now()
    });
    CVQ_CACHE.waiting[qkey] = cur.slice(0, count);
  }
  return CVQ_CACHE.waiting[qkey];
}


    const title =
      kind==='waiting' ? `Callers in ${q.title.replace(/\s+\(\d+\)$/, '')}` :
      kind==='active'  ? `Active Calls in ${q.title.replace(/\s+\(\d+\)$/, '')}` : 'Queue';

    const wrap = doc.createElement('div');
    wrap.innerHTML = `
      <div id="cvq-backdrop" class="cvq-backdrop"></div>
      <div id="cvq-modal" class="cvq-modal" role="dialog" aria-modal="true">
        <div class="hd">
          <div>${title}</div>
          <div style="display:flex;gap:6px;">
            ${kind==='waiting' ? '<button class="cvq-pill" style="background:#3a3a3a;cursor:default">Prioritize</button>' : ''}
            ${kind!=='waiting' ? '' : ''}
            <button class="x" aria-label="Close">×</button>
          </div>
        </div>
        <div class="bd">
          <table class="table table-condensed">
            <thead><tr><th>Caller ID</th><th>Name</th><th>Status</th><th>Duration</th></tr></thead>
            <tbody>${rows || `<tr><td colspan="4" style="padding:16px;">No ${kind==='waiting'?'callers waiting':'active calls'}.</td></tr>`}</tbody>
          </table>
        </div>
      </div>`;
    doc.body.appendChild(wrap);

    // tick durations inside modal
    if (doc.__cvqModalTimer) clearInterval(doc.__cvqModalTimer);
    doc.__cvqModalTimer = setInterval(()=>{
      doc.querySelectorAll('#cvq-modal [data-tick="1"]').forEach(el=>{
        const n = (parseInt(el.getAttribute('data-sec'),10)||0) + 1;
        el.setAttribute('data-sec', String(n));
        el.textContent = fmt(n);
      });
    }, 1000);

    const m = doc.getElementById('cvq-modal');
    m.addEventListener('click', (e)=>{
      const closeBtn = e.target.closest('.x');
      if (closeBtn) { closeModal(doc); return; }

      // modal actions
      const prio = e.target.closest('[data-mact="prio"]');
      if (prio){
        const row = prio.closest('tr'); const st = row.querySelector('[data-status]');
        if (st && !st.querySelector('.cvq-pill')){
          const b = doc.createElement('span'); b.className='cvq-pill'; b.textContent='Priority';
          st.appendChild(b);
        }
        return;
      }
      const tx = e.target.closest('[data-mact="transfer"]');
      if (tx){
        closeMenus(doc);
        const r = tx.getBoundingClientRect();
        const menu = doc.createElement('div'); menu.className='cvq-menu';
        menu.style.top  = `${r.bottom + (doc.defaultView?.scrollY||doc.documentElement.scrollTop)+4}px`;
        menu.style.left = `${r.right  + (doc.defaultView?.scrollX||doc.documentElement.scrollLeft)-160}px`;
        menu.innerHTML = `<button data-pick>Pick up call</button><button data-xfer>Transfer call</button>`;
        doc.body.appendChild(menu);
        menu.addEventListener('click', (ev)=>{
          if (ev.target.closest('[data-pick]')) { console.log('[cv] pick up'); }
          if (ev.target.closest('[data-xfer]')) { console.log('[cv] transfer'); }
          closeMenus(doc);
        });
        return;
      }
    });
    doc.getElementById('cvq-backdrop').addEventListener('click', ()=>closeModal(doc));
  }

  // ---- CALL CENTER IFRAME INJECT / REMOVE ----
  function injectQueuesTiles(){
    const found = findQueuesDoc(); if (!found) return;
    const { doc, body, container } = found;
    ensureStyles(doc);
    mountTip(doc);

    // Already injected?
    if (doc.getElementById(PANEL_ID)) return;

    // Build panel
    const wrap = doc.createElement('div'); wrap.innerHTML = buildPanelHTML();
    const panel = wrap.firstElementChild;

    // Hide the original table container and insert our panel right above it
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

    // timers for the “Wait” column in the panel
    if (!doc.__cvqTimer){
      doc.__cvqTimer = setInterval(()=>{
        doc.querySelectorAll(`#${PANEL_ID} [data-tick="1"]`).forEach(el=>{
          const n = (parseInt(el.getAttribute('data-sec'),10)||0) + 1;
          el.setAttribute('data-sec', String(n));
          el.textContent = fmt(n);
        });
      }, 1000);
    }

    // one-time delegated listeners INSIDE the inner doc
    if (!doc.__cvqBound){
      doc.__cvqBound = true;

      // tooltips
      doc.addEventListener('mouseover', (e)=>{
        const t = e.target.closest('[data-tip]'); if (!t || !doc.getElementById(PANEL_ID)?.contains(t)) return;
        showTip(doc, t, t.getAttribute('data-tip')||'');
      }, true);
      doc.addEventListener('mouseout', (e)=>{
        const t = e.target.closest('[data-tip]'); if (!t) return; hideTip(doc);
      }, true);

      // clicks: numbers + icons
      doc.addEventListener('click', (e)=>{
        const num = e.target.closest(`#${PANEL_ID} .cvq-num`);
        if (num){
          const kind = num.getAttribute('data-kind');
          const q    = num.getAttribute('data-q');
          if (num.classList.contains('is-disabled')) return; // 0 does nothing
          if (kind==='waiting' || kind==='active') { openModal(doc, kind, q); return; }
          if (kind==='agents') { console.log('[cv] edit agents:', q); return; }
        }
        const ico = e.target.closest(`#${PANEL_ID} .cvq-icon`);
        if (ico){
          const act = ico.getAttribute('data-act'), q=ico.getAttribute('data-q');
          if (act==='agents') { console.log('[cv] edit agents:', q); return; }
          if (act==='queue')  { console.log('[cv] edit queue:',  q); return; }
        }
      }, true);
    }

    attachObserver(doc);
  }

  function removeQueuesTiles(){
    for (const doc of getSameOriginDocs()){
      const p = doc.getElementById(PANEL_ID); if (p) p.remove();
      closeModal(doc);
      doc.querySelectorAll(`${BODY_SEL} ${CONTAINER_SEL}[data-cv-hidden="1"]`).forEach(n=>{ n.style.display=''; n.removeAttribute('data-cv-hidden'); });
      if (doc.__cvqTimer){ clearInterval(doc.__cvqTimer); doc.__cvqTimer=null; }
      detachObserver(doc);
    }
  }

  // ---- OBSERVE SPA RERENDERS ----
  function attachObserver(doc){
    if (doc.__cvqMO) return;
    const mo = new MutationObserver(()=>{
      if (!QUEUES_REGEX.test(location.href)) return;
      const body = doc.querySelector(BODY_SEL); if (!body) return;
      const container = body.querySelector(CONTAINER_SEL);
      const panel = doc.getElementById(PANEL_ID);
      if (container && container.style.display !== 'none') scheduleInject(injectQueuesTiles);
      else if (!panel && (body || container))          scheduleInject(injectQueuesTiles);
    });
    mo.observe(doc.documentElement || doc, { childList:true, subtree:true });
    doc.__cvqMO = mo;
  }
  function detachObserver(doc){ if(doc.__cvqMO){ try{doc.__cvqMO.disconnect();}catch{} delete doc.__cvqMO; } }

  // ---- CALL CENTER ROUTING WATCH ----
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
    history.pushState    = function(){ const prev=last; const ret=push.apply(this,arguments); const now=location.href; last=now; handleRoute(prev,now); return ret; };
    history.replaceState = function(){ const prev=last; const ret=rep.apply(this,arguments);  const now=location.href; last=now; handleRoute(prev,now); return ret; };
    new MutationObserver(()=>{ if(location.href!==last){ const prev=last, now=location.href; last=now; handleRoute(prev,now); } })
      .observe(document.documentElement,{childList:true,subtree:true});
    window.addEventListener('popstate',()=>{ const prev=last, now=location.href; if(now!==prev){ last=now; handleRoute(prev,now); } });
    if (QUEUES_REGEX.test(location.href)) onEnter();
  })();
}

