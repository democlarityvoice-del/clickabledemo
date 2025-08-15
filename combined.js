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
    /* styles omitted here for brevity; you can reinsert your latest working version */
  </style>
</head>
<body>
<div class="call-container">
  <div class="call-toolbar">
    <button class="pop-btn" id="popToggle" aria-pressed="false" aria-controls="callsTableBody">Enlarge</button>
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
  const names = ["Grace Smith","Jason Tran","Chloe Bennett","Raj Patel","Ava Daniels","Luis Santiago","Emily Reyes","Zoe Miller","Derek Zhang","Noah Brooks"];
  const first = ["Nick","Sarah","Mike","Lisa","Tom","Jenny","Alex","Maria","John","Kate"];
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const area = ["900","700","999","888","511"];
  const exts = Array.from({length:49},(_,i)=>201+i);
  const usedNums = new Set(), usedNames = new Set(), calls = [];
  const MAX = 5;
  const pick = a => a[Math.floor(Math.random()*a.length)];
  const num = () => {
    let n;
    do { n = pick(area)+"-"+Math.floor(100+Math.random()*900)+"-"+Math.floor(1000+Math.random()*9000); }
    while (usedNums.has(n) || /666/.test(n));
    usedNums.add(n); return n;
  };
  const cname = () => {
    let n, g=0;
    do { n = pick(names); g++; } while (usedNames.has(n) && g<50);
    usedNames.add(n); return n;
  };
  const extname = () => pick(first) + " " + pick(alphabet) + ".";
  const fmt = s => s.toString().padStart(2,"0");
  const timer = s => () => {
    const d = Date.now()-s, m=Math.floor(d/60000), sec=Math.floor((d%60000)/1000);
    return m+":"+fmt(sec);
  };
  const newCall = () => ({
    from: cname(),
    cnam: num(),
    dialed: "CallQueue",
    to: "Ext. " + pick(exts) + " (" + extname() + ")",
    startedAt: Date.now(),
    t: timer(Date.now()),
    state: "active"
  });

  const tick = c => {
    if (Date.now()-c.startedAt > 3*60*1000) c.state = "ended";
  };

  function render(){
    const tb = document.getElementById("callsTableBody");
    if (!tb) return;
    tb.innerHTML = "";
    calls.forEach((c,i)=>{
      const tr = document.createElement("tr");
      tr.innerHTML =
        "<td>"+c.from+"</td><td>"+c.cnam+"</td><td>"+c.dialed+"</td><td>"+c.to+"</td><td>"+c.t()+"</td>" +
        '<td><button class="listen-btn" aria-pressed="false" title="Listen in">' +
        '<svg class="svgbak" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10v4h4l5 5V5L7 10H3z"></path>' +
        '<path d="M14.5 3.5a.75.75 0 0 1 1.06 0 9 9 0 0 1 0 12.73.75.75 0 0 1-1.06-1.06 7.5 7.5 0 0 0 0-10.6.75.75 0 0 1 0-1.06z"></path>' +
        '</svg></button></td>';
      tb.appendChild(tr);
    });
  }

  function loop(){
    if (calls.length < MAX && Math.random() < 0.35) calls.push(newCall());
    for (let i = calls.length-1; i >= 0; i--) {
      tick(calls[i]);
      if (calls[i].state === "ended") calls.splice(i,1);
    }
    render();
  }

  calls.push(newCall());
  render();
  setInterval(loop, 3000);

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".listen-btn");
    if (!btn) return;
    document.querySelectorAll(".listen-btn").forEach(b => {
      const isThis = b === btn;
      b.classList.toggle("is-active", isThis);
      b.setAttribute("aria-pressed", isThis ? "true" : "false");
    });
  });
})();
</script>
</body>
</html>`;
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





