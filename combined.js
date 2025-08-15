// -------- DECLARE CONSTANTS -------- //
const HOME_REGEX = /\/portal\/home(?:[/?#]|$)/;
const HOME_SELECTOR = '#nav-home a, #nav-home';
const SLOT_SELECTOR = '#omp-active-body';
const IFRAME_ID = 'cv-demo-calls-iframe';

// follow with: removeIframe(), injectIframe(), etc.

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
    position: relative;
    z-index: 2;
  }
  .listen-btn:focus { outline: none; }
  .svgbak { width: var(--icon-size); height: var(--icon-size); }
  .svgbak path { fill: var(--icon-muted); transition: fill .2s ease; }
  tr:hover .svgbak path { fill: var(--icon-hover); }
  .listen-btn.is-active .svgbak path { fill: var(--icon-active); }

/* -------- CALL SIMULATION: UTILITIES -------- */
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
  // existing JS logic
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
            <svg class="svgbak" viewBox="0 0 24 24">
              <path d="M3 10v4h4l5 5V5L7 10H3z"></path>
              <path d="M14.5 3.5a.75.75 0 0 1 1.06 0 9 9 0 0 1 0 12.73.75.75 0 0 1-1.06-1.06 7.5 7.5 0 0 0 0-10.6.75.75 0 0 1 0-1.06z"></path>
            </svg>
          </button>
        </td>\`;
      tb.appendChild(tr);
    }); // ✅ <-- this was missing
  }
})();
<\/script>
</body></html>`;
}


// -------- REMOVE IFRAME -------- //
  function removeIframe() {
    const ifr = document.getElementById(IFRAME_ID);
    if (ifr && ifr.parentNode) ifr.parentNode.removeChild(ifr);
  }

// -------- INJECT IFRAME -------- //
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

// -------- WAIT AND INJECT -------- //
  function waitForSlotAndInject(tries = 0) {
    const slot = document.querySelector(SLOT_SELECTOR);
    if (slot && slot.isConnected) {
      requestAnimationFrame(() => requestAnimationFrame(() => injectIframe()));
      return;
    }
    if (tries >= 12) return;
    setTimeout(() => waitForSlotAndInject(tries + 1), 250);
  }

// -------- HOME ROUTING -------- //
  function onHomeEnter() {
    setTimeout(() => waitForSlotAndInject(), 600);
  }

// -------- ROUTE CHANGE HANDLER -------- //
  function handleRouteChange(prevHref, nextHref) {
    const wasHome = HOME_REGEX.test(prevHref);
    const isHome = HOME_REGEX.test(nextHref);
    if (!wasHome && isHome) onHomeEnter();
    if (wasHome && !isHome) removeIframe();
  }

// -------- WATCH URL CHANGES -------- //
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






























