(function () {
  // ====== CONFIG ======
  const HOME_SELECTOR = '#nav-home a, #nav-home';
  const SLOT_SELECTOR = '#omp-active-body';   // where to mount
  const IFRAME_ID = 'cv-demo-calls-iframe';
  const USE_SRCDOC = true;                    // set false to use GHPages URL
  const GHPAGES_URL = 'https://yourname.github.io/fake-call-overlay/index.html?v=1';

  // ====== BOOTSTRAP HELPERS ======
  const on = (el, evt, sel, fn) => {
    el.addEventListener(evt, e => {
      const t = e.target.closest(sel);
      if (t) fn.call(t, e);
    });
  };

  function when(pred, fn) {
    if (pred()) return fn();
    const obs = new MutationObserver(() => pred() && (obs.disconnect(), fn()));
    obs.observe(document.documentElement, { childList: true, subtree: true });
    const iv = setInterval(() => { if (pred()) { clearInterval(iv); fn(); } }, 300);
  }

  // ====== CORE: INJECT / REMOVE IFRAME ======
  let ro; // ResizeObserver

  function removeIframe() {
    const ifr = document.getElementById(IFRAME_ID);
    if (ifr && ifr.parentNode) ifr.parentNode.removeChild(ifr);
    if (ro) { try { ro.disconnect(); } catch {} ro = null; }
  }

  function ensureSlot() {
    const slot = document.querySelector(SLOT_SELECTOR);
    if (!slot) return null;
    // optional: clear the default widget if you want exclusive space
    // while keeping layout stable. Comment out if you prefer append.
    slot.innerHTML = '';
    return slot;
  }

  function injectIframe() {
    if (document.getElementById(IFRAME_ID)) return; // no duplicates
    const slot = ensureSlot(); if (!slot) return;

    const iframe = document.createElement('iframe');
    iframe.id = IFRAME_ID;
    iframe.style.cssText = 'border:none;width:100%;min-height:360px;display:block;';
    iframe.setAttribute('scrolling', 'yes');

    if (USE_SRCDOC) {
      iframe.srcdoc = buildSrcdoc();  // inline app
    } else {
      iframe.src = GHPAGES_URL;       // hosted app
    }

    slot.appendChild(iframe);

    // Auto-height to match slot changes
    ro = new ResizeObserver(() => {
      try {
        const h = Math.max(360, Math.floor(slot.getBoundingClientRect().height) || 0);
        iframe.style.height = h ? (h + 'px') : '600px';
      } catch {
        iframe.style.height = '600px';
      }
    });
    ro.observe(slot);

    // initial size kick
    window.dispatchEvent(new Event('resize'));
  }

  // ====== HOME NAV HOOKS ======
  function onHomeEnter() {
    // small delay to let Portal render the home panels
    setTimeout(injectIframe, 300);
  }

  function wireHomeClick() {
    const root = document;
    on(root, 'click', HOME_SELECTOR, () => onHomeEnter());
  }

  function watchRoute() {
    let lastHref = location.href;
    const routeObs = new MutationObserver(() => {
      const href = location.href;
      if (href === lastHref) return;
      lastHref = href;
      // If leaving home, remove; if entering home, inject
      if (/\/portal\/home\b/.test(href)) onHomeEnter();
      else removeIframe();
    });
    routeObs.observe(document.body, { childList: true, subtree: true });
  }

  // ====== STARTUP ======
  when(() => document.querySelector(HOME_SELECTOR) && document.querySelector('body'), () => {
    wireHomeClick();
    watchRoute();
    if (/\/portal\/home\b/.test(location.href)) onHomeEnter();
  });

  // ====== INLINE APP (srcdoc) ======
  function buildSrcdoc() {
    return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Current Active Calls</title>
<style>
  body { font-family: Arial, sans-serif; margin:0; background:#fff; color:#000; }
  .call-container {
    background:#fff; padding:20px 30px; border-radius:6px;
    box-shadow:0 2px 5px rgba(0,0,0,0.1); width:100%;
  }
  h1 {
    font-size:16px; color:#a8a8a8; text-transform:uppercase;
    font-weight:600; margin:0 0 12px;
  }
  table { width:100%; border-collapse:collapse; background:#fff; }
  th, td { padding:10px 12px; text-align:left; font-size:14px; border-bottom:1px solid #ddd; }
  thead { background:#fff; }
  tr:hover { background:#f5f5f5; }
  .speaker-icon { cursor:pointer; opacity:.4; transition:opacity .2s ease; }
  tr:hover .speaker-icon { opacity:.7; }
  .speaker-icon:hover { opacity:1; }
</style>
</head>
<body>
  <div class="call-container">
    <h1>Current Active Calls</h1>
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
  // ---- DATA POOLS (respecting your constraints) ----
  const names = [
    "Grace Smith","Jason Tran","Chloe Bennett","Raj Patel","Ava Daniels","Luis Santiago",
    "Emily Reyes","Zoe Miller","Derek Zhang","Noah Brooks","Liam Hayes","Nina Clarke",
    "Omar Wallace","Sara Bloom","Connor Reed","Ella Graham","Miles Turner","Ruby Foster","Leo Knight"
  ];
  const firstNames = ["Nick","Sarah","Mike","Lisa","Tom","Jenny","Alex","Maria","John","Kate","David","Emma","Chris","Anna","Steve","Beth","Paul","Amy","Mark","Jess"];
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const areaCodes = ["900","700","999","888","511","600","311","322","456"]; // non-real / service ranges
  const extensions = Array.from({length:49}, (_,i)=>201+i);

  const usedNumbers = new Set();
  const usedNames = new Set();
  const calls = [];
  const MAX_VISIBLE = 5;

  function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

  function generatePhoneNumber(){
    let number;
    do {
      const area = rand(areaCodes);
      const mid = Math.floor(100 + Math.random()*900);
      const end = Math.floor(1000 + Math.random()*9000);
      number = \`\${area}-\${mid}-\${end}\`;
    } while (usedNumbers.has(number) || /666/.test(number));
    usedNumbers.add(number);
    return number;
  }

  function getRandomName(){
    let n;
    let guard = 0;
    do { n = rand(names); guard++; } while (usedNames.has(n) && guard < 50);
    usedNames.add(n);
    return n;
  }

  function getRandomExtensionName(){
    const first = rand(firstNames);
    const initial = alphabet[Math.floor(Math.random()*alphabet.length)];
    return \`\${first} \${initial}.\`;
  }

  function fmt(t){ return t.toString().padStart(2,'0'); }

  function createLiveTimer(startMs){
    return function(){
      const d = Date.now() - startMs;
      const m = Math.min(4, Math.floor(d/60000)); // cap 4 minutes as per your spec
      const s = Math.floor((d%60000)/1000);
      return \`\${m}:\${fmt(s)}\`;
    }
  }

  function newCall(){
    // 5% to voicemail; of those, 3% route via SpeakAccount first
    const goVM = Math.random() < 0.05;
    const viaSpeak = goVM && Math.random() < 0.03;

    return {
      from: getRandomName(),
      cnam: generatePhoneNumber(),
      dialed: viaSpeak ? 'SpeakAccount' : (goVM ? 'VMail' : 'CallQueue'),
      to: \`Ext. \${rand(extensions)} (\${getRandomExtensionName()})\`,
      startedAt: Date.now(),
      timer: createLiveTimer(Date.now()),
      wentToVM: goVM,
      viaSpeakFirst: viaSpeak,
      state: 'active'
    };
  }

  function tick(call){
    // After ~2s, SpeakAccount -> VMail transition
    if (call.viaSpeakFirst && call.state === 'active' && Date.now() - call.startedAt > 2000) {
      call.dialed = 'VMail';
      call.viaSpeakFirst = false;
    }
    // cap at 4:32 (exit if still running long)
    const elapsed = Date.now() - call.startedAt;
    if (elapsed > (4*60+32)*1000) call.state = 'ended';
  }

  function render(){
    const tbody = document.getElementById('callsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    calls.forEach(c=>{
      const tr = document.createElement('tr');
      const dur = c.timer();
      tr.innerHTML = \`
        <td>\${c.from}</td>
        <td>\${c.cnam}</td>
        <td>\${c.dialed}</td>
        <td>\${c.to}</td>
        <td>\${dur}</td>
        <td><span class="speaker-icon" title="Listen in">🔊</span></td>\`;
      tbody.appendChild(tr);
    });
  }

  // main loop
  function loop(){
    // Add or remove to keep movement
    if (calls.length < MAX_VISIBLE && Math.random() < 0.7) {
      calls.push(newCall());
    } else if (calls.length > 0 && Math.random() < 0.3) {
      calls.shift();
    }
    // Tick & prune
    for (let i=calls.length-1;i>=0;i--){
      tick(calls[i]);
      if (calls[i].state === 'ended') calls.splice(i,1);
    }
    render();
  }

  // Seed and animate
  calls.push(newCall());
  render();
  setInterval(loop, 1000); // 1s for smoother timers
})();
</script>
</body></html>`;
  }
})();

