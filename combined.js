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
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Current Active Calls</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 10px; }
    .call-container { border: 1px solid #ccc; border-radius: 6px; padding: 10px; }
    .call-toolbar { margin-bottom: 8px; }
    .pop-btn { padding: 5px 12px; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; font-weight: bold; padding-bottom: 6px; color: #666; }
    td { padding: 6px 4px; border-top: 1px solid #ddd; }
    .listen-btn { background: none; border: none; cursor: pointer; padding: 2px; }
    .listen-btn svg { width: 20px; height: 20px; fill: #ccc; }
    .listen-btn:hover svg { fill: #333; }
    .listen-btn.is-active svg { fill: #000; }
  </style>
</head>
<body>
<div class="call-container">
  <div class="call-toolbar">
    <button class="pop-btn" id="popToggle" aria-pressed="false">Enlarge</button>
  </div>
  <table>
    <thead>
      <tr>
        <th>From</th>
        <th>CNAM</th>
        <th>Dialed</th>
        <th>To</th>
        <th>Duration</th>
        <th></th>
      </tr>
    </thead>
    <tbody id="callsTableBody"></tbody>
  </table>
</div>

<script>
(function(){
  const MAX = 5;
  const CALLQUEUE_DISPLAY_TIME = 5000;
  const names = ["Grace Smith", "Jason Tran", "Chloe Bennett", "Raj Patel", "Ava Daniels", "Luis Santiago"];
  const area = ["900", "700", "888", "511"];
  const exts = Array.from({length: 40}, (_, i) => 200 + i);
  const usedNums = new Set(), usedNames = new Set();
  const calls = [];

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function generatePhone() {
    let n;
    do {
      n = \`\${pick(area)}-\${Math.floor(100+Math.random()*900)}-\${Math.floor(1000+Math.random()*9000)}\`;
    } while (usedNums.has(n) || /666/.test(n));
    usedNums.add(n); return n;
  }

  function generateName() {
    let n;
    do { n = pick(names); } while (usedNames.has(n));
    usedNames.add(n); return n;
  }

  function generateExt() {
    return \`Ext. \${pick(exts)}\`;
  }

  function generateToName() {
    const firsts = ["Alex", "Maria", "Tom", "Lisa", "John"];
    const initials = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    return \`\${pick(firsts)} \${pick(initials)}.\`;
  }

  function newCall() {
    const start = Date.now();
    return {
      from: generatePhone(),
      cnam: generateName(),
      dialed: generatePhone(),
      to: "CallQueue",
      targetExt: \`\${generateExt()} (\${generateToName()})\`,
      startedAt: start,
      get duration() {
        const d = Date.now() - this.startedAt;
        const m = Math.floor(d / 60000);
        const s = Math.floor((d % 60000) / 1000);
        return \`\${m}:\${s.toString().padStart(2, '0')}\`;
      },
      get displayTo() {
        const age = Date.now() - this.startedAt;
        return age < CALLQUEUE_DISPLAY_TIME ? "CallQueue" : this.targetExt;
      }
    };
  }

  function render() {
    const tbody = document.getElementById("callsTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";
    calls.forEach((call) => {
      const tr = document.createElement("tr");
      tr.innerHTML = \`
        <td>\${call.from}</td>
        <td>\${call.cnam}</td>
        <td>\${call.dialed}</td>
        <td>\${call.displayTo}</td>
        <td>\${call.duration}</td>
        <td><button class="listen-btn" title="Listen in" aria-pressed="false">
          <svg viewBox="0 0 24 24"><path d="M3 10v4h4l5 5V5L7 10H3z"></path><path d="M14.5 3.5a.75.75 0 0 1 1.06 0 9 9 0 0 1 0 12.73.75.75 0 0 1-1.06-1.06 7.5 7.5 0 0 0 0-10.6.75.75 0 0 1 0-1.06z"></path></svg>
        </button></td>
      \`;
      tbody.appendChild(tr);
    });
  }

  function loop() {
    if (calls.length < MAX && Math.random() < 0.5) calls.push(newCall());
    for (let i = calls.length - 1; i >= 0; i--) {
      if ((Date.now() - calls[i].startedAt) > 4.5 * 60 * 1000) {
        calls.splice(i, 1);
      }
    }
    render();
  }

  calls.push(newCall());
  setInterval(loop, 3000);

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".listen-btn");
    if (!btn) return;
    document.querySelectorAll(".listen-btn").forEach(b => {
      const isThis = b === btn;
      b.classList.toggle("is-


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

    if (anchor && anchor.parentNode === slot) {
      slot.insertBefore(iframe, anchor);
    } else {
      slot.insertBefore(iframe, slot.firstChild);
    }
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






