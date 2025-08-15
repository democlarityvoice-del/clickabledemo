// ==============================
// Clarity Voice Demo Calls Inject
// ==============================
if (window.__cvDemoInit) {
  // already initialized
} else {
  window.__cvDemoInit = true;

  // -------- DECLARE CONSTANTS -------- //
  const HOME_REGEX = /\/portal\/home(?:[/?#]|$)/;
  const HOME_SELECTOR = '#nav-home a, #nav-home';
  const SLOT_SELECTOR = '#omp-active-body';
  const IFRAME_ID = 'cv-demo-calls-iframe';

  // -------- BUILD SOURCE -------- //
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
  body {
    font-family: Arial, sans-serif;
    margin: 0;
    background: #fff;
    color: #000;
  }
  .call-container {
    background: #fff;
    padding: 0 16px 20px;
    border-radius: 6px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    width: 100%;
    max-width: 100%;
  }
  table {
    width: 100%;
    table-layout: auto;
    border-collapse: collapse;
    background: #fff;
  }
  thead th {
    font-weight: 700;
    padding: 10px 12px;
    font-size: 14px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    white-space: nowrap;
  }
  td {
    padding: 10px 12px;
    text-align: left;
    font-size: 14px;
    border-bottom: 1px solid #ddd;
    white-space: nowrap;
  }
  tr:hover { background: #f5f5f5; }

  .listen-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: #f0f0f0;
    border-radius: 50%;
    border: none;
    cursor: pointer;
  }
  .listen-btn:focus { outline: none; }
  .svgbak { width: var(--icon-size); height: var(--icon-size); }
  .svgbak path { fill: var(--icon-muted); transition: fill .2s ease; }
  tr:hover .svgbak path { fill: var(--icon-hover); }
  .listen-btn.is-active .svgbak path { fill: var(--icon-active); }
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

<!-- -------- CALL SIMULATION: CALL STRUCTURE -------- -->
<script>
(function(){
  // Pools — names, extensions, and area codes (area code is real, but 555-01xx makes the full number fictional)
  const names = ["Carlos Rivera","Emily Tran","Mike Johnson","Ava Chen","Sarah Patel","Liam Nguyen","Monica Alvarez","Raj Patel","Chloe Bennett","Grace Smith","Jason Tran","Zoe Miller","Ruby Foster","Leo Knight"];
  const extensions = [201,203,204,207,211,215,218,219,222,227,231,235];
  const areaCodes = ["989","517","248","810","313"]; // any is fine; 555-01xx keeps the number fictional

  const CALL_QUEUE = "CallQueue";
  const VMAIL = "VMail";
  const SPEAK = "SpeakAccount";

  const calls = [];

  // Utilities
  const pad2 = (n) => String(n).padStart(2,'0');

  function randomName() {
    // try to keep names unique among active calls
    let name, guard = 0;
    do {
      name = names[Math.floor(Math.random() * names.length)];
      guard++;
    } while (calls.some(c => c.cnam === name) && guard < 50);
    return name;
  }

  function randomPhone() {
    // Fictional per NANPA: 555-01xx range; also avoid '666' anywhere, just in case
    let num;
    do {
      const ac = areaCodes[Math.floor(Math.random() * areaCodes.length)];
      const last2 = pad2(Math.floor(Math.random() * 100)); // 00..99
      num = \`\${ac}-555-01\${last2}\`;
    } while (calls.some(c => c.from === num) || /666/.test(num));
    return num;
  }

  function randomDialed() {
    // Toll-free-ish looking number; avoid 666
    let num;
    do {
      num = \`800-\${100 + Math.floor(Math.random()*900)}-\${1000 + Math.floor(Math.random()*9000)}\`;
    } while (/666/.test(num));
    return num;
  }

  function randomExtension() {
    // Reserve unique ext up-front to avoid later collisions when flipping CallQueue->Ext
    let ext;
    let guard = 0;
    do {
      ext = extensions[Math.floor(Math.random() * extensions.length)];
      guard++;
    } while (calls.some(c => c.ext === ext) && guard < 50);
    return ext;
  }

  function generateCall() {
    const from = randomPhone();
    const cnam = randomName();
    const dialed = randomDialed();
    const ext = randomExtension();

    // 5% to voicemail; of those, 3% via SpeakAccount first
    const to = Math.random() < 0.05
      ? (Math.random() < 0.03 ? SPEAK : VMAIL)
      : CALL_QUEUE;

    const start = Date.now();
    return {
      from, cnam, dialed, to, ext, start,
      t: () => {
        const elapsed = Math.min(Date.now() - start, (4*60 + 32) * 1000); // cap at 4:32
        const s = Math.floor(elapsed / 1000);
        return \`\${Math.floor(s/60)}:\${pad2(s%60)}\`;
      }
    };
  }

  function updateCalls() {
    // Occasionally remove a random call (or if we ever exceeded 5)
    if (calls.length > 5 || Math.random() < 0.3) {
      if (calls.length) calls.splice(Math.floor(Math.random() * calls.length), 1);
    }

    // Maintain up to 5 visible calls
    if (calls.length < 5) {
      calls.push(generateCall());
    }

    // Promote CallQueue -> Ext after ~5s; SpeakAccount -> VMail after ~2s
    const now = Date.now();
    calls.forEach(c => {
      if (c.to === CALL_QUEUE && now - c.start > 5000) {
        const firstName = c.cnam.split(" ")[0] || "";
        c.to = \`Ext. \${c.ext} (\${firstName})\`;
      }
      if (c.to === SPEAK && now - c.start > 2000) {
        c.to = VMAIL;
      }
    });
  }

  function render() {
    const tb = document.getElementById('callsTableBody');
    if (!tb) return;
    tb.innerHTML = '';
    calls.forEach((c) => {
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

  // Paint immediately so the table isn't empty on load
  (function seed(){ calls.push(generateCall()); render(); })();

  // Main loop
  setInterval(() => { updateCalls(); render(); }, 1500);

  // Single-active toggle for "Listen in"
  document.addEventListener('click', (e) => {
    const el = (e.target && e.target.closest) ? e.target : null;
    const btn = el && el.closest ? el.closest('.listen-btn') : null;
    if (!btn) return;
    document.querySelectorAll('.listen-btn[aria-pressed="true"]').forEach(b => {
      b.classList.remove('is-active');
      b.setAttribute('aria-pressed','false');
    });
    btn.classList.add('is-active');
    btn.setAttribute('aria-pressed','true');
  });
})();
<\/script>
</body></html>`;
  }

  // -------- REMOVE IFRAME -------- //
  function removeIframe() {
    const ifr = document.getElementById(IFRAME_ID);
    if (ifr && ifr.parentNode) ifr.parentNode.removeChild(ifr);

    // unhide native anchor if we hid it
    const slot = document.querySelector(SLOT_SELECTOR);
    const anchor = slot && slot.querySelector('.table-container.scrollable-small');
    if (anchor) anchor.style.display = '';
  }

  // -------- INJECT IFRAME -------- //
  function injectIframe() {
    if (document.getElementById(IFRAME_ID)) return; // keep existing instance
    const slot = document.querySelector(SLOT_SELECTOR);
    if (!slot) return;
    const anchor = slot.querySelector('.table-container.scrollable-small') || slot.firstChild;
    if (anchor instanceof HTMLElement) anchor.style.display = 'none';

    const iframe = document.createElement('iframe');
    iframe.id = IFRAME_ID;
    iframe.style.cssText = 'border:none;width:100%;display:block;margin-top:0;height:360px;';
    iframe.setAttribute('scrolling', 'yes');
    iframe.srcdoc = buildSrcdoc();

    if (anchor && anchor.parentNode === slot) slot.insertBefore(iframe, anchor);
    else slot.insertBefore(iframe, slot.firstChild);
  }


// ==============================
// Clarity Voice Grid Stats Inject
// ==============================
if (window.__cvGridStatsInit) {
  // already initialized
} else {
  window.__cvGridStatsInit = true;

  // -------- CONSTANTS -------- //
  const GRID_STATS_REGEX = /\/portal\/agents\/manager(?:[/?#]|$)/;
  const GRID_STATS_SELECTOR = '.page-container';
  const GRID_STATS_IFRAME_ID = 'cv-grid-stats-iframe';

  // -------- BUILD SRCDOC -------- //
  function buildGridStatsSrcdoc() {
    return `<!doctype html><html><head><meta charset="utf-8">
<style>
  body {
    font-family: Arial, sans-serif;
    margin: 0;
    background: #fff;
  }
  .grid-box {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 12px 16px;
    width: 260px;
    margin: 10px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    font-size: 14px;
  }
  .header-row {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    margin-bottom: 8px;
    font-size: 13px;
  }
  .metric-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .stat {
    background: #7fff7f;
    padding: 10px;
    border-radius: 6px;
    text-align: center;
    font-weight: bold;
    font-size: 16px;
  }
  .stat.yellow {
    background: #ffeb3b;
  }
  .label {
    font-size: 12px;
    color: #555;
  }
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

  // -------- INJECT -------- //
  function injectGridStatsIframe() {
    if (document.getElementById(GRID_STATS_IFRAME_ID)) return;
    const slot = document.querySelector(GRID_STATS_SELECTOR);
    if (!slot) return;

    const iframe = document.createElement('iframe');
    iframe.id = GRID_STATS_IFRAME_ID;
    iframe.style.cssText = 'border:none;width:280px;height:160px;margin:10px;display:block;';
    iframe.srcdoc = buildGridStatsSrcdoc();

    slot.appendChild(iframe);
  }

  // -------- WAIT AND INJECT -------- //
  function waitForGridStatsSlotAndInject(tries = 0) {
    const slot = document.querySelector(GRID_STATS_SELECTOR);
    if (slot && slot.isConnected) {
      requestAnimationFrame(() => requestAnimationFrame(() => injectGridStatsIframe()));
      return;
    }
    if (tries >= 10) return;
    setTimeout(() => waitForGridStatsSlotAndInject(tries + 1), 300);
  }

  // -------- PAGE ENTRY -------- //
  function onGridStatsPageEnter() {
    waitForGridStatsSlotAndInject();
  }

  // -------- ROUTE CHANGE -------- //
  function handleGridStatsRouteChange(prevHref, nextHref) {
    const wasOn = GRID_STATS_REGEX.test(prevHref);
    const isOn = GRID_STATS_REGEX.test(nextHref);
    if (!wasOn && isOn) onGridStatsPageEnter();
    if (wasOn && !isOn) {
      const ifr = document.getElementById(GRID_STATS_IFRAME_ID);
      if (ifr && ifr.parentNode) ifr.parentNode.removeChild(ifr);
    }
  }

  // -------- WATCHER -------- //
  (function watchGridStatsURLChanges() {
    let last = location.href;
    const origPush = history.pushState;
    const origReplace = history.replaceState;

    history.pushState = function () {
      const prev = last;
      const ret = origPush.apply(this, arguments);
      const now = location.href;
      last = now;
      handleGridStatsRouteChange(prev, now);
      return ret;
    };
    history.replaceState = function () {
      const prev = last;
      const ret = origReplace.apply(this, arguments);
      const now = location.href;
      last = now;
      handleGridStatsRouteChange(prev, now);
      return ret;
    };

    new MutationObserver(() => {
      if (location.href !== last) {
        const prev = last;
        const now = location.href;
        last = now;
        handleGridStatsRouteChange(prev, now);
      }
    }).observe(document.documentElement, { childList: true, subtree: true });

        if (GRID_STATS_REGEX.test(location.href)) onGridStatsPageEnter();
  })();
} // CLOSES the else { from window.__cvGridStatsInit


