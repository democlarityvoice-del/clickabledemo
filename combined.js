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

<!-- -------- CALL SIMULATION: HOME CALL STRUCTURE -------- -->
<script>
(function(){
  // pools
  const names = ["Carlos Rivera","Emily Tran","Mike Johnson","Ava Chen","Sarah Patel","Liam Nguyen","Monica Alvarez","Raj Patel","Chloe Bennett","Grace Smith","Jason Tran","Zoe Miller","Ruby Foster","Leo Knight"];
  const extensions = [201,203,204,207,211,215,218,219,222,227,231,235];
  const areaCodes = ["989","517","248","810","313"];
  const CALL_QUEUE="CallQueue", VMAIL="VMail", SPEAK="SpeakAccount";
  const calls = [];
  const pad2 = (n)=>String(n).padStart(2,'0');

  function randomName(){ let name,g=0; do{ name=names[Math.floor(Math.random()*names.length)]; g++; }while(calls.some(c=>c.cnam===name)&&g<50); return name; }
  function randomPhone(){ let num; do{ const ac=areaCodes[Math.floor(Math.random()*areaCodes.length)]; const last2=pad2(Math.floor(Math.random()*100)); num=\`\${ac}-555-01\${last2}\`; }while(calls.some(c=>c.from===num)||/666/.test(num)); return num; }
  function randomDialed(){ let num; do{ num=\`800-\${100+Math.floor(Math.random()*900)}-\${1000+Math.floor(Math.random()*9000)}\`; }while(/666/.test(num)); return num; }
  function randomExtension(){ let ext,g=0; do{ ext=extensions[Math.floor(Math.random()*extensions.length)]; g++; }while(calls.some(c=>c.ext===ext)&&g<50); return ext; }

  function generateCall(){
    const from=randomPhone(), cnam=randomName(), dialed=randomDialed(), ext=randomExtension();
    const to = Math.random()<0.05 ? (Math.random()<0.03 ? SPEAK : VMAIL) : CALL_QUEUE;
    const start=Date.now();
    return { from, cnam, dialed, to, ext, start,
      t:()=>{ const elapsed=Math.min(Date.now()-start,(4*60+32)*1000); const s=Math.floor(elapsed/1000); return \`\${Math.floor(s/60)}:\${pad2(s%60)}\`; }
    };
  }

  function updateCalls(){
    if(calls.length>5 || Math.random()<0.3){ if(calls.length) calls.splice(Math.floor(Math.random()*calls.length),1); }
    if(calls.length<5) calls.push(generateCall());
    const now=Date.now();
    calls.forEach(c=>{
      if(c.to==="CallQueue" && now-c.start>5000){ const first=c.cnam.split(" ")[0]||""; c.to=\`Ext. \${c.ext} (\${first})\`; }
      if(c.to==="SpeakAccount" && now-c.start>2000){ c.to="VMail"; }
    });
  }

  function render(){
    const tb=document.getElementById('callsTableBody'); if(!tb) return;
    tb.innerHTML='';
    calls.forEach(c=>{
      const tr=document.createElement('tr');
      tr.innerHTML=\`
        <td>\${c.from}</td><td>\${c.cnam}</td><td>\${c.dialed}</td><td>\${c.to}</td><td>\${c.t()}</td>
        <td><button class="listen-btn" aria-pressed="false" title="Listen in">
          <svg class="svgbak" viewBox="0 0 24 24" role="img" aria-label="Listen in">
            <path d="M3 10v4h4l5 5V5L7 10H3z"></path>
            <path d="M14.5 3.5a.75.75 0 0 1 1.06 0 9 9 0 0 1 0 12.73.75.75 0 0 1-1.06-1.06 7.5 7.5 0 0 0 0-10.6.75.75 0 0 1 0-1.06z"></path>
          </svg>
        </button></td>\`;
      tb.appendChild(tr);
    });
  }

  (function seed(){ calls.push(generateCall()); render(); })();
  setInterval(()=>{ updateCalls(); render(); },1500);

  document.addEventListener('click',(e)=>{
    const el = e.target instanceof Element ? e.target : null;
    const btn = el && el.closest('.listen-btn');
    if(!btn) return;
    document.querySelectorAll('.listen-btn[aria-pressed="true"]').forEach(b=>{
      b.classList.remove('is-active'); b.setAttribute('aria-pressed','false');
    });
    btn.classList.add('is-active'); btn.setAttribute('aria-pressed','true');
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



// ==============================
// ==============================
// Clarity Voice Grid Stats Inject (CALL CENTER MANAGER) — inject INTO inner iframe
// ==============================
if (!window.__cvGridStatsInit) {
  window.__cvGridStatsInit = true;

  const GRID_STATS_REGEX    = /\/portal\/agents\/manager(?:[\/?#]|$)/;
  const GRID_TABLE_SELECTOR = '.dash-stats-grid-table';
  const GRID_BODY_SELECTOR  = '#dash-stats-body';
  const CARD_ID             = 'cv-grid-stats-card';
  const CARD_STYLE_ID       = 'cv-grid-stats-style';

  function buildGridStatsCardHTML() {
    return `
      <div id="${CARD_ID}" style="box-sizing:border-box;border:1px solid #ccc;border-radius:8px;padding:12px 16px;width:260px;margin:10px 10px 14px 10px;box-shadow:0 2px 5px rgba(0,0,0,0.1);font-family:Arial,sans-serif;background:#fff;">
        <div style="display:flex;justify-content:space-between;font-weight:bold;margin-bottom:8px;font-size:13px;">
          <span>ALL QUEUES</span>
          <span style="color:#2196F3;cursor:default;">GRID SETTINGS</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div style="background:#7fff7f;padding:10px;border-radius:6px;text-align:center;font-weight:bold;font-size:16px;">
            <div>2</div><div style="font-size:12px;color:#555;font-weight:normal;">CW</div>
          </div>
          <div style="background:#7fff7f;padding:10px;border-radius:6px;text-align:center;font-weight:bold;font-size:16px;">
            <div>2:42</div><div style="font-size:12px;color:#555;font-weight:normal;">AWT</div>
          </div>
          <div style="background:#ffeb3b;padding:10px;border-radius:6px;text-align:center;font-weight:bold;font-size:16px;">
            <div>3:14</div><div style="font-size:12px;color:#555;font-weight:normal;">AHT</div>
          </div>
          <div style="background:#7fff7f;padding:10px;border-radius:6px;text-align:center;font-weight:bold;font-size:16px;">
            <div>27</div><div style="font-size:12px;color:#555;font-weight:normal;">CA</div>
          </div>
        </div>
      </div>`;
  }

  function getSameOriginDocs() {
    const docs = [document];
    const iframes = document.querySelectorAll('iframe');
    for (const ifr of iframes) {
      try {
        const idoc = ifr.contentDocument || (ifr.contentWindow && ifr.contentWindow.document);
        if (idoc) docs.push(idoc);
      } catch { /* cross-origin — ignore */ }
    }
    return docs;
  }

  function findGridInnerDoc() {
    for (const doc of getSameOriginDocs()) {
      const tableInBody = doc.querySelector(`${GRID_BODY_SELECTOR} ${GRID_TABLE_SELECTOR}`);
      const anyTable    = tableInBody || doc.querySelector(GRID_TABLE_SELECTOR);
      if (anyTable) {
        return {
          doc,
          table: anyTable,
          bodyContainer: anyTable.closest(GRID_BODY_SELECTOR) || null
        };
      }
    }
    return null;
  }

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

    // Place BEFORE the whole dash body; fallback: before first table; last resort: end of body
    if (bodyContainer && bodyContainer.parentNode) {
      bodyContainer.parentNode.insertBefore(card, bodyContainer);
    } else if (table && table.parentNode) {
      table.parentNode.insertBefore(card, table);
    } else {
      doc.body.appendChild(card);
    }
  }

  function removeGridStatsCard() {
    for (const doc of getSameOriginDocs()) {
      const card = doc.getElementById(CARD_ID);
      if (card) card.remove();
    }
  }

  function waitForGridStatsAndInject(tries = 0) {
    const found = findGridInnerDoc();
    if (found && (found.bodyContainer || tries >= 3)) {
      requestAnimationFrame(() => requestAnimationFrame(() => injectGridStatsCard()));
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

    if (GRID_STATS_REGEX.test(location.href)) onGridStatsPageEnter();
  })();
} // closes __cvGridStatsInit


