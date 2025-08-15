// ==============================
// Clarity Voice Demo Calls Inject (HOME)
// ==============================
if (window.__cvDemoInit) {
  // already initialized
} else {
  window.__cvDemoInit = true;

  // -------- DECLARE HOME CONSTANTS -------- //
  const HOME_REGEX = /\/portal\/home(?:[/?#]|$)/;
  const HOME_SELECTOR = '#nav-home a, #nav-home';
  const SLOT_SELECTOR = '#omp-active-body';
  const IFRAME_ID = 'cv-demo-calls-iframe';

  // -------- BUILD HOME SOURCE -------- //
  function buildSrcdoc() {
    return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { box-sizing: border-box; }
  html, body { width: 100%; overflow-x: hidden; }
  :root {
    --icon-muted: rgba(0,0,0,.38);
    --icon-hover: rgba(0,0,0,.60);
    --icon-active: #000;
    --icon-size: 18px;
  }
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
          <th>From</th>
          <th>CNAM</th>
          <th>Dialed</th>
          <th>To</th>
          <th>Duration</th>
          <th><!-- Listen icon column --></th>
        </tr>
      </thead>
      <tbody id="callsTableBody"></tbody>
    </table>
  </div>

<!-- -------- CALL SIMULATION: HOME CALL STRUCTURE -------- -->
<script>
(function(){
  // Pools — names, extensions, and area codes (area code is real, but 555-01xx makes the full number fictional)
  const names = ["Carlos Rivera","Emily Tran","Mike Johnson","Ava Chen","Sarah Patel","Liam Nguyen","Monica Alvarez","Raj Patel","Chloe Bennett","Grace Smith","Jason Tran","Zoe Miller","Ruby Foster","Leo Knight"];
  const extensions = [201,203,204,207,211,215,218,219,222,227,231,235];
  const areaCodes = ["989","517","248","810","313"]; // 555-01xx makes the full number fictional

  const CALL_QUEUE = "CallQueue";
  const VMAIL = "VMail";
  const SPEAK = "SpeakAccount";

  const calls = [];
  const pad2 = (n) => String(n).padStart(2,'0');

  function randomName() {
    let name, guard = 0;
    do { name = names[Math.floor(Math.random()*names.length)]; guard++; }
    while (calls.some(c => c.cnam === name) && guard < 50);
    return name;
  }

  function randomPhone() {
    // Fictional per NANPA: 555-01xx range; also avoid '666'
    let num;
    do {
      const ac = areaCodes[Math.floor(Math.random()*areaCodes.length)];
      const last2 = pad2(Math.floor(Math.random()*100)); // 00..99
      num = \`\${ac}-555-01\${last2}\`;
    } while (calls.some(c => c.from === num) || /666/.test(num));
    return num;
  }

  function randomDialed() {
    let num;
    do { num = \`800-\${100+Math.floor(Math.random()*900)}-\${1000+Math.floor(Math.random()*9000)}\`; }
    while (/666/.test(num));
    return num;
  }

  function randomExtension() {
    let ext, guard = 0;
    do { ext = extensions[Math.floor(Math.random()*extensions.length)]; guard++; }
    while (calls.some(c => c.ext === ext) && guard < 50);
    return ext;
  }

  function generateCall() {
    const from = randomPhone();
    const cnam = randomName();
    const dialed = randomDialed();
    const ext = randomExtension();
    const to = Math.random() < 0.05 ? (Math.random() < 0.03 ? SPEAK : VMAIL) : CALL_QUEUE;
    const start = Date.now();
    return {
      from, cnam, dialed, to, ext, start,
      t: () => {
        const elapsed = Math.min(Date.now()-start, (4*60+32)*1000); // cap at 4:32
        const s = Math.floor(elapsed/1000);
        return \`\${Math.floor(s/60)}:\${pad2(s%60)}\`;
      }
    };
  }

  function updateCalls() {
    if (calls.length > 5 || Math.random() < 0.3) { if (calls.length) calls.splice(Math.floor(Math.random()*calls.length), 1); }
    if (calls.length < 5) calls.push(generateCall());
    const now = Date.now();
    calls.forEach(c => {
      if (c.to === "CallQueue" && now - c.start > 5000) {
        const firstName = c.cnam.split(" ")[0] || "";
        c.to = \`Ext. \${c.ext} (\${firstName})\`;
      }
      if (c.to === "SpeakAccount" && now - c.start > 2000) c.to = "VMail";
    });
  }

  function render() {
    const tb = document.getElementById('callsTableBody');
    if (!tb) return;
    tb.innerHTML = '';
    calls.forEach(c => {
      const tr = document.createElement('tr');
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

  // Seed + loop + toggle
  (function seed(){ calls.push(generateCall()); render(); })();
  setInterval(() => { updateCalls(); render(); }, 1500);
  document.addEventListener('click', (e) => {
    const el = e.target instanceof Element ? e.target : null;
    const btn = el && el.closest('.listen-btn');
    if (!btn) return;
    document.querySelectorAll('.listen-btn[aria-pressed="true"]').forEach(b => {
      b.classList.remove('is-active'); b.setAttribute('aria-pressed','false');
    });
    btn.classList.add('is-active'); btn.setAttribute('aria-pressed','true');
  });
})();
<\/script>
</body></html>`;
  }

  // -------- REMOVE HOME  -------- //
  function remove() {
    const ifr = document.getElementById(_ID);
    if (ifr && ifr.parentNode) ifr.parentNode.removeChild(ifr);

    // unhide the exact element we hid (if any)
    const slot = document.querySelector(SLOT_SELECTOR);
    if (slot) {
      const hidden = slot.querySelector('[data-cv-demo-hidden="1"]');
      if (hidden && hidden.nodeType === Node.ELEMENT_NODE) {
        hidden.style.display = '';
        hidden.removeAttribute('data-cv-demo-hidden');
      }
    }
  }

  // -------- INJECT HOME  -------- //
  function inject() {
    if (document.getElementById(_ID)) return;
    const slot = document.querySelector(SLOT_SELECTOR);
    if (!slot) return;

    // robust anchor finder
    function findAnchor(el) {
      const preferred = el.querySelector('.table-container.scrollable-small');
      if (preferred) return preferred;
      if (el.firstElementChild) return el.firstElementChild;
      let n = el.firstChild;
      while (n && n.nodeType !== Node.ELEMENT_NODE) n = n.nextSibling;
      return n || null;
    }

    const anchor = findAnchor(slot);

    // hide what we anchor against, tag it so we can unhide later
    if (anchor && anchor.nodeType === Node.ELEMENT_NODE) {
      anchor.style.display = 'none';
      anchor.setAttribute('data-cv-demo-hidden', '1');
    }

    const  = document.createElement('');
    .id = _ID;
    .style.cssText = 'border:none;width:100%;display:block;margin-top:0;height:360px;';
    .setAttribute('scrolling', 'yes');
    .srcdoc = buildSrcdoc();

    if (anchor && anchor.parentNode === slot) slot.insertBefore(, anchor);
    else slot.appendChild();
  }

  // -------- WAIT HOME AND INJECT -------- //
  function waitForSlotAndInject(tries = 0) {
    const slot = document.querySelector(SLOT_SELECTOR);
    if (slot && slot.isConnected) {
      requestAnimationFrame(() => requestAnimationFrame(() => inject()));
      return;
    }
    if (tries >= 12) return;
    setTimeout(() => waitForSlotAndInject(tries + 1), 250);
  }

  // -------- HOME ROUTING -------- //
  function onHomeEnter() { setTimeout(() => waitForSlotAndInject(), 600); }

  function handleRouteChange(prevHref, nextHref) {
    const wasHome = HOME_REGEX.test(prevHref);
    const isHome  = HOME_REGEX.test(nextHref);
    if (!wasHome && isHome) onHomeEnter();
    if ( wasHome && !isHome) remove();
  }

  (function watchURLChanges() {
    let last = location.href;
    const origPush = history.pushState;
    const origReplace = history.replaceState;

    history.pushState = function () {
      const prev = last;
      const ret  = origPush.apply(this, arguments);
      const now  = location.href; last = now;
      handleRouteChange(prev, now);
      return ret;
    };
    history.replaceState = function () {
      const prev = last;
      const ret  = origReplace.apply(this, arguments);
      const now  = location.href; last = now;
      handleRouteChange(prev, now);
      return ret;
    };

    new MutationObserver(() => {
      if (location.href !== last) {
        const prev = last, now = location.href; last = now;
        handleRouteChange(prev, now);
      }
    }).observe(document.documentElement, { childList: true, subtree: true });

    document.addEventListener('click', (e) => {
      const el = e.target instanceof Element ? e.target : null;
      if (el && el.closest(HOME_SELECTOR)) setTimeout(onHomeEnter, 0);
    });

    if (HOME_REGEX.test(location.href)) onHomeEnter();
  })();
} // closes __cvDemoInit


// ==============================
// Clarity Voice Grid Stats Inject (CALL CENTER MANAGER)
// ==============================
if (window.__cvGridStatsInit) {
  // already initialized
} else {
  window.__cvGridStatsInit = true;

  // -------- GRID STATS CONSTANTS -------- //
  const GRID_STATS_REGEX = /\/portal\/agents\/manager(?:[\/?#]|$)/;
  const GRID_STATS_SELECTOR = '.dash-stats-grid-table';   // targets any of the actual tables
  const GRID_STATS__ID = 'cv-grid-stats-';

  // -------- BUILD GRID STATS SRCDOC -------- //
  function buildGridStatsSrcdoc() {
    return `<!doctype html><html><head><meta charset="utf-8">
<style>
  body { font-family: Arial, sans-serif; margin:0; background:#fff; }
  .grid-box { border:1px solid #ccc; border-radius:8px; padding:12px 16px; width:260px; margin:10px; box-shadow:0 2px 5px rgba(0,0,0,0.1); font-size:14px; }
  .header-row { display:flex; justify-content:space-between; font-weight:bold; margin-bottom:8px; font-size:13px; }
  .metric-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .stat { background:#7fff7f; padding:10px; border-radius:6px; text-align:center; font-weight:bold; font-size:16px; }
  .stat.yellow { background:#ffeb3b; }
  .label { font-size:12px; color:#555; }
</style>
</head><body>
  <div class="grid-box">
    <div class="header-row">
      <span>ALL QUEUES</span>
      <span style="color:#2196F3;cursor:pointer;">GRID SETTINGS</span>
    </div>
    <div class="metric-row">
      <div class="stat"><div>2</div><div class="label">CW</div></div>
      <div class="stat"><div>2:42</div><div class="label">AWT</div></div>
      <div class="stat yellow"><div>3:14</div><div class="label">AHT</div></div>
      <div class="stat"><div>27</div><div class="label">CA</div></div>
    </div>
  </div>
</body></html>`;
  }

  // -------- GRID STATS INJECT -------- //
  function injectGridStatsIframe() {
  if (document.getElementById(GRID_STATS_IFRAME_ID)) return;

  // Prefer a table inside #dash-stats-body; otherwise fall back to any matching table
  const table =
    document.querySelector('#dash-stats-body .dash-stats-grid-table') ||
    document.querySelector(GRID_STATS_SELECTOR);

  if (!table) return; // table not mounted yet

  const body = table.closest('#dash-stats-body');

  const iframe = document.createElement('iframe');
  iframe.id = GRID_STATS_IFRAME_ID;
  iframe.style.cssText = 'border:none;width:280px;height:160px;margin:10px;display:block;';
  iframe.srcdoc = buildGridStatsSrcdoc();

  if (body && body.parentNode) {
    // Insert the iframe directly BEFORE the whole dash body container (fixes “append at bottom” + scroll)
    body.parentNode.insertBefore(iframe, body);
  } else if (table.parentNode) {
    // Fallback: insert before the table itself
    table.parentNode.insertBefore(iframe, table);
  } else {
    // Last resort: append near top-level container to avoid bottom-of-page append
    (document.querySelector('#omp-active-body') ||
     document.querySelector('.page-container') ||
     document.body
    ).appendChild(iframe);
  }
}


  // -------- WAIT GRID AND INJECT -------- //
  function waitForGridStatsSlotAndInject(tries = 0) {
  const table =
    document.querySelector('#dash-stats-body .dash-stats-grid-table') ||
    document.querySelector(GRID_STATS_SELECTOR);

  const body = table && table.closest('#dash-stats-body');

  if (table && (body || tries >= 3)) {
    // if body isn’t ready after ~1 second, proceed with the table fallback
    requestAnimationFrame(() =>
      requestAnimationFrame(() => injectGridStatsIframe())
    );
    return;
  }

  if (tries >= 10) return;

  setTimeout(() => waitForGridStatsSlotAndInject(tries + 1), 300);
}


  // -------- PAGE GRID ENTRY -------- //
  function onGridStatsPageEnter() {
    waitForGridStatsSlotAndInject();
  }

  // -------- ROUTE GRID STATS CHANGE -------- //
  function handleGridStatsRouteChange(prevHref, nextHref) {
    const wasOn = GRID_STATS_REGEX.test(prevHref);
    const isOn  = GRID_STATS_REGEX.test(nextHref);
    if (!wasOn && isOn) onGridStatsPageEnter();
    if ( wasOn && !isOn) {
      const ifr = document.getElementById(GRID_STATS_IFRAME_ID);
      if (ifr && ifr.parentNode) ifr.parentNode.removeChild(ifr);
    }
  }

  // -------- GRID STATS WATCHER -------- //
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






