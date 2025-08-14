(function () {
  // ===== CONFIG =====
  const HOME_REGEX = /\/portal\/home(?:[/?#]|$)/;
  const HOME_SELECTOR = '#nav-home a, #nav-home';
  const SLOT_SELECTOR = '#omp-active-body';
  const IFRAME_ID = 'cv-demo-calls-iframe';
  const INITIAL_DELAY_MS = 600;              // landing page delay
  const MAX_RETRIES = 12;                    // ~12 * 250ms ≈ 3s
  const RETRY_INTERVAL_MS = 250;
  const LOG = false;                         // set true to debug

  const log = (...args) => LOG && console.log('[DemoCalls]', ...args);

  // ===== SRC_DOC APP =====
  function buildSrcdoc() {
    return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Current Active Calls</title>
<style>
  body { font-family: Arial, sans-serif; margin:0; background:#fff; color:#000; }
  .call-container { background:#fff; padding:20px 30px; border-radius:6px;
    box-shadow:0 2px 5px rgba(0,0,0,0.1); width:100%; }
  h1 { font-size:16px; color:#a8a8a8; text-transform:uppercase; font-weight:600; margin:0 0 12px; }
  table { width:100%; border-collapse:collapse; background:#fff; }
  th,td { padding:10px 12px; text-align:left; font-size:14px; border-bottom:1px solid #ddd; }
  tr:hover { background:#f5f5f5; }
  .speaker-icon { cursor:pointer; opacity:.4; transition:opacity .2s; }
  tr:hover .speaker-icon { opacity:.7; } .speaker-icon:hover { opacity:1; }
</style>
</head><body>
  <div class="call-container">
    <h1>Current Active Calls</h1>
    <table>
      <thead><tr><th>From</th><th>CNAM</th><th>Dialed</th><th>To</th><th>Duration</th><th></th></tr></thead>
      <tbody id="callsTableBody"></tbody>
    </table>
  </div>
<script>
(function(){
  const names=["Grace Smith","Jason Tran","Chloe Bennett","Raj Patel","Ava Daniels","Luis Santiago","Emily Reyes","Zoe Miller","Derek Zhang","Noah Brooks","Liam Hayes","Nina Clarke","Omar Wallace","Sara Bloom","Connor Reed","Ella Graham","Miles Turner","Ruby Foster","Leo Knight"];
  const first=["Nick","Sarah","Mike","Lisa","Tom","Jenny","Alex","Maria","John","Kate","David","Emma","Chris","Anna","Steve","Beth","Paul","Amy","Mark","Jess"];
  const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const area=["900","700","999","888","511","600","311","322","456"];
  const exts=Array.from({length:49},(_,i)=>201+i);
  const usedNums=new Set(),usedNames=new Set(),calls=[]; const MAX=5;

  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const num=()=>{let n; do{n=\`\${pick(area)}-\${Math.floor(100+Math.random()*900)}-\${Math.floor(1000+Math.random()*9000)}\`}while(usedNums.has(n)||/666/.test(n)); usedNums.add(n); return n;}
  const cname=()=>{let n,g=0; do{n=pick(names); g++}while(usedNames.has(n)&&g<50); usedNames.add(n); return n;}
  const extname=()=>\`\${pick(first)} \${alphabet[Math.floor(Math.random()*alphabet.length)]}.\`;
  const fmt=s=>s.toString().padStart(2,'0');
  const timer=s=>()=>{const d=Date.now()-s,m=Math.min(4,Math.floor(d/60000)),sec=Math.floor((d%60000)/1000);return \`\${m}:\${fmt(sec)}\`};
  const newCall=()=>{const vm=Math.random()<0.05, viaSpeak=vm&&Math.random()<0.03; return {from:cname(), cnam:num(), dialed:viaSpeak?'SpeakAccount':(vm?'VMail':'CallQueue'), to:\`Ext. \${pick(exts)} (\${extname()})\`, startedAt:Date.now(), t:timer(Date.now()), viaSpeak, state:'active'};}
  const tick=c=>{ if(c.viaSpeak && Date.now()-c.startedAt>2000){c.dialed='VMail'; c.viaSpeak=false;} if(Date.now()-c.startedAt>(4*60+32)*1000){c.state='ended';}};
  const render=()=>{const tb=document.getElementById('callsTableBody'); if(!tb) return; tb.innerHTML=''; calls.forEach(c=>{const tr=document.createElement('tr'); tr.innerHTML=\`<td>\${c.from}</td><td>\${c.cnam}</td><td>\${c.dialed}</td><td>\${c.to}</td><td>\${c.t()}</td><td><span class="speaker-icon" title="Listen in">🔊</span></td>\`; tb.appendChild(tr);});};
  function loop(){ if(calls.length<MAX && Math.random()<0.7) calls.push(newCall()); else if(calls.length>0 && Math.random()<0.3) calls.shift(); for(let i=calls.length-1;i>=0;i--){tick(calls[i]); if(calls[i].state==='ended') calls.splice(i,1);} render(); }
  calls.push(newCall()); render(); setInterval(loop,1000);
})();
</script>
</body></html>`;
  }

  // ===== IFRAME MANAGEMENT =====
  function removeIframe() {
    const ifr = document.getElementById(IFRAME_ID);
    if (ifr && ifr.parentNode) ifr.parentNode.removeChild(ifr);
  }

function injectIframe() {
  if (document.getElementById(IFRAME_ID)) return;

  const slot = document.querySelector(SLOT_SELECTOR);
  if (!slot) return;

  // 1) Find the native table container to anchor ABOVE it
  const anchor = slot.querySelector('.table-container.scrollable-small') || slot.firstChild;

  // 2) (Optional) hide the native empty table
  const HIDE_NATIVE = true;
  if (HIDE_NATIVE && anchor instanceof HTMLElement) {
    anchor.style.display = 'none';
  }

  // 3) Create the iframe
  const iframe = document.createElement('iframe');
  iframe.id = IFRAME_ID;
  // a bit taller so it fills that top panel area nicely
let ro;
function observeHeight(slot, iframe){
  if (ro) try { ro.disconnect(); } catch {}
  ro = new ResizeObserver(() => {
    const h = Math.max(360, Math.floor(slot.getBoundingClientRect().height - 100)); // header padding
    iframe.style.height = h + 'px';
  });
  ro.observe(slot);
}

// call after slot.insertBefore(...)
observeHeight(slot, iframe);


  // keep using srcdoc (no external loads / CSP-safe)
  iframe.srcdoc = buildSrcdoc();

  // 4) Insert BEFORE the native container (higher on the page)
  if (anchor && anchor.parentNode === slot) {
    slot.insertBefore(iframe, anchor);
  } else {
    // fallback: prepend to slot
    slot.insertBefore(iframe, slot.firstChild);
  }
}


  // Wait for #omp-active-body to exist and be stable
  function waitForSlotAndInject(tries = 0) {
    const slot = document.querySelector(SLOT_SELECTOR);
    if (slot && slot.isConnected) {
      // Optional: ensure it’s laid out (has size) to avoid early injection
      requestAnimationFrame(() => requestAnimationFrame(() => injectIframeOnce(slot)));
      return;
    }
    if (tries >= MAX_RETRIES) { log('Slot not found; giving up'); return; }
    setTimeout(() => waitForSlotAndInject(tries + 1), RETRY_INTERVAL_MS);
  }

  // ===== ROUTING / NAV DETECTION =====
  function onHomeEnter() {
    setTimeout(() => waitForSlotAndInject(), INITIAL_DELAY_MS);
  }

  function handleRouteChange(prevHref, nextHref) {
    const wasHome = HOME_REGEX.test(prevHref);
    const isHome = HOME_REGEX.test(nextHref);
    if (!wasHome && isHome) { log('Entering Home'); onHomeEnter(); }
    if (wasHome && !isHome) { log('Leaving Home'); removeIframe(); }
  }

  // Watch URL changes (SPA)
  (function watchURLChanges() {
    let last = location.href;
    const origPush = history.pushState;
    const origReplace = history.replaceState;

    history.pushState = function () {
      const prev = last;
      const ret = origPush.apply(this, arguments);
      const now = location.href; last = now; handleRouteChange(prev, now);
      return ret;
    };
    history.replaceState = function () {
      const prev = last;
      const ret = origReplace.apply(this, arguments);
      const now = location.href; last = now; handleRouteChange(prev, now);
      return ret;
    };

    const mo = new MutationObserver(() => {
      if (location.href !== last) {
        const prev = last, now = location.href; last = now; handleRouteChange(prev, now);
      }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });

    // Also hook the Home button click
    document.addEventListener('click', (e) => {
      if (e.target.closest(HOME_SELECTOR)) setTimeout(onHomeEnter, 0);
    });

    // Initial landing
    if (HOME_REGEX.test(location.href)) onHomeEnter();
  })();
})();

