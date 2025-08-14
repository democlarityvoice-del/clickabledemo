(function () {
  // ===== CONFIG =====
  const HOME_REGEX = /\/portal\/home(?:[/?#]|$)/;
  const HOME_SELECTOR = '#nav-home a, #nav-home';
  const SLOT_SELECTOR = '#omp-active-body';
  const IFRAME_ID = 'cv-demo-calls-iframe';
  const INITIAL_DELAY_MS = 600;
  const MAX_RETRIES = 12;
  const RETRY_INTERVAL_MS = 250;
  const LOG = false;
  const log = (...args) => LOG && console.log('[DemoCalls]', ...args);

  // ===== SRC_DOC APP =====
  function buildSrcdoc() {
    return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Current Active Calls</title>
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
    position: relative;
  }
  .listen-btn:focus { outline: none; }
  .listen-btn .tooltip {
    display: none;
    position: absolute;
    bottom: -24px;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: #fff;
    padding: 2px 6px;
    font-size: 11px;
    border-radius: 4px;
    white-space: nowrap;
  }
  .listen-btn:hover .tooltip { display: block; }
  .svgbak {
    width: var(--icon-size);
    height: var(--icon-size);
  }
  .svgbak path {
    fill: var(--icon-muted);
    opacity: .9;
    transition: fill .15s linear, opacity .15s linear;
  }
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
          <th style="width:28px;"></th>
        </tr>
      </thead>
      <tbody id="callsTableBody"></tbody>
    </table>
  </div>
<script>
(function(){
  const names = ["Grace Smith","Jason Tran","Chloe Bennett","Raj Patel","Ava Daniels","Luis Santiago","Emily Reyes","Zoe Miller","Derek Zhang","Noah Brooks","Liam Hayes","Nina Clarke","Omar Wallace","Sara Bloom","Connor Reed","Ella Graham","Miles Turner","Ruby Foster","Leo Knight"];
  const first = ["Nick","Sarah","Mike","Lisa","Tom","Jenny","Alex","Maria","John","Kate","David","Emma","Chris","Anna","Steve","Beth","Paul","Amy","Mark","Jess"];
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const area = ["900","700","999","888","511","600","311","322","456"];
  const exts = Array.from({length:49},(_,i)=>201+i);
  const usedNums = new Set(), usedNames = new Set(), calls = [];
  const MAX = 5;

  const pick = a => a[Math.floor(Math.random() * a.length)];
  const num = () => { let n; do { n = \`\${pick(area)}-\${Math.floor(100+Math.random()*900)}-\${Math.floor(1000+Math.random()*9000)}\`; } while (usedNums.has(n) || /666/.test(n)); usedNums.add(n); return n; };
  const cname = () => { let n, g = 0; do { n = pick(names); g++; } while (usedNames.has(n) && g < 50); usedNames.add(n); return n; };
  const extname = () => \`\${pick(first)} \${pick(alphabet)}.\`;
  const fmt = s => s.toString().padStart(2, '0');
  const timer = s => () => { const d = Date.now()-s, m=Math.floor(d/60000), sec=Math.floor((d%60000)/1000); return \`\${m}:\${fmt(sec)}\`; };
  const newCall = () => {
    const vm = Math.random() < 0.05, viaSpeak = vm && Math.random() < 0.03;
    return {
      from: cname(),
      cnam: num(),
      dialed: viaSpeak ? 'SpeakAccount' : (vm ? 'VMail' : 'CallQueue'),
      to: \`Ext. \${pick(exts)} (\${extname()})\`,
      startedAt: Date.now(),
      t: timer(Date.now()),
      viaSpeak,
      state: 'active'
    };
  };
  const tick = c => {
    if (c.viaSpeak && Date.now() - c.startedAt > 2000) {
      c.dialed = 'VMail';
      c.viaSpeak = false;
    }
    if (Date.now() - c.startedAt > (4 * 60 + 32) * 1000) {
      c.state = 'ended';
    }
  };

  function render(){
    const tb = document.getElementById('callsTableBody');
    if (!tb) return;
    tb.innerHTML = '';
    calls.forEach((c, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = \`
        <td>\${c.from}</td>
        <td>\${c.cnam}</td>
        <td>\${c.dialed}</td>
        <td>\${c.to}</td>
        <td>\${c.t()}</td>
        <td>
          <button class="listen-btn" type="button" title="Listen in" aria-pressed="false" data-index="\${i}">
            <span class="tooltip">Listen in</span>
            <svg class="svgbak" viewBox="0 0 24 24" role="img" aria-label="Listen in">
              <path d="M3 10v4h4l5 5V5L7 10H3z"></path>
              <path d="M14.5 3.5a.75.75 0 0 1 1.06 0 9 9 0 0 1 0 12.73.75.75 0 0 1-1.06-1.06 7.5 7.5 0 0 0 0-10.6.75.75 0 0 1 0-1.06z"></path>
            </svg>
          </button>
        </td>\`;
      tb.appendChild(tr);
    });
  }

  function loop() {
    if (calls.length < MAX && Math.random() < 0.7) calls.push(newCall());
    else if (calls.length > 0 && Math.random() < 0.3) calls.shift();
    for (let i = calls.length - 1; i >= 0; i--) {
      tick(calls[i]);
      if (calls[i].state === 'ended') calls.splice(i, 1);
    }
    render();
  }

  calls.push(newCall()); // Ensure at least one call on load
  render();
  setInterval(loop, 1000);

  // Single "Listen in" active button logic
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.listen-btn');
    if (!btn) return;
    document.querySelectorAll('.listen-btn[aria-pressed="true"]').forEach(b => {
      b.classList.remove('is-active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('is-active');
    btn.setAttribute('aria-pressed', 'true');
  });
})();
</script></body></html>`;
  }

  // ===== IFRAME INJECTION =====
  function removeIframe() {
    const ifr = document.getElementById(IFRAME_ID);
    if (ifr && ifr.parentNode) ifr.parentNode.removeChild(ifr);
  }

  function injectIframe() {
    if (document.getElementById(IFRAME_ID)) return;
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

  function waitForSlotAndInject(tries = 0) {
    const slot = document.querySelector(SLOT_SELECTOR);
    if (slot && slot.isConnected) {
      requestAnimationFrame(() => requestAnimationFrame(() => injectIframe()));
      return;
    }
    if (tries >= MAX_RETRIES) return;
    setTimeout(() => waitForSlotAndInject(tries + 1), RETRY_INTERVAL_MS);
  }

  function onHomeEnter() {
    setTimeout(() => waitForSlotAndInject(), INITIAL_DELAY_MS);
  }

  function handleRouteChange(prevHref, nextHref) {
    const wasHome = HOME_REGEX.test(prevHref);
    const isHome = HOME_REGEX.test(nextHref);
    if (!wasHome && isHome) onHomeEnter();
    if (wasHome && !isHome) removeIframe();
  }

  (function watchURLChanges() {
    let last = location.href;
    const origPush = history.pushState;
    const origReplace = history.replaceState;

    history.pushState = function () {
      const prev = last;
      const ret = origPush.apply(this, arguments);
      const now = location.href;
      last = now;
      handleRouteChange(prev, now);
      return ret;
    };
    history.replaceState = function () {
      const prev = last;
      const ret = origReplace.apply(this, arguments);
      const now = location.href;
      last = now;
      handleRouteChange(prev, now);
      return ret;
    };

    new MutationObserver(() => {
      if (location.href !== last) {
        const prev = last, now = location.href;
        last = now;
        handleRouteChange(prev, now);
      }
    }).observe(document.documentElement, { childList: true, subtree: true });

    document.addEventListener('click', (e) => {
      if (e.target.closest(HOME_SELECTOR)) setTimeout(onHomeEnter, 0);
    });

    if (HOME_REGEX.test(location.href)) onHomeEnter();
  })();
})();






