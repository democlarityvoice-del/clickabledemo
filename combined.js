(function () {
  const CONTAINER_ID = 'omp-active-body';
  const OVERLAY_ID = 'fake-call-overlay';
  const OVERLAY_BODY_ID = 'callsTableBody';

  function injectOverlay() {
    if (document.getElementById(OVERLAY_BODY_ID)) return;

    const target = document.getElementById(CONTAINER_ID);
    if (!target) return;

    const style = document.createElement('style');
    style.textContent = `
      .call-container {
        background: white;
        padding: 20px 30px;
        border-radius: 6px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        width: 75%;
        position: fixed;
        top: 180px;
        left: 20px;
        right: 20px;
        color: black;
        min-height: 220px;
        z-index: 1000;
      }
      .call-container h1 {
        color: #a8a8a8;
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 12px;
        text-transform: uppercase;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        background-color: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      th, td {
        padding: 10px 12px;
        text-align: left;
        font-size: 14px;
        border-bottom: 1px solid #ddd;
      }
      .speaker-icon {
        cursor: pointer;
        opacity: 0.4;
        transition: opacity 0.3s ease;
      }
      .speaker-icon:hover {
        opacity: 1;
      }
      tr:hover {
        background-color: #f5f5f5;
      }
      tr:hover .speaker-icon {
        opacity: 0.7;
      }
    `;
    document.head.appendChild(style);

    const div = document.createElement('div');
    div.className = 'call-container';
    div.id = OVERLAY_ID;
    div.innerHTML = `
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
        <tbody id="${OVERLAY_BODY_ID}"></tbody>
      </table>
    `;
    target.appendChild(div);

    startSimulation();
  }

  // -- Simulation logic --
  const names = [/* list trimmed for brevity */ "Grace Smith", "Mike Johnson", "Zoe Miller"];
  const firstNames = ["Nick", "Emma", "Mark", "Sarah"];
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const areaCodes = ["900", "700", "888", "600"];
  const extensions = Array.from({ length: 49 }, (_, i) => 201 + i);

  const usedNumbers = new Set();
  const usedNames = new Set();
  let calls = [];

  function generatePhoneNumber() {
    let number;
    do {
      const area = areaCodes[Math.floor(Math.random() * areaCodes.length)];
      const mid = Math.floor(100 + Math.random() * 900);
      const end = Math.floor(1000 + Math.random() * 9000);
      number = `${area}-${mid}-${end}`;
    } while (usedNumbers.has(number));
    usedNumbers.add(number);
    return number;
  }

  function getRandomName() {
    let name;
    do {
      name = names[Math.floor(Math.random() * names.length)];
    } while (usedNames.has(name));
    usedNames.add(name);
    return name;
  }

  function getRandomExtensionName() {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const initial = alphabet[Math.floor(Math.random() * alphabet.length)];
    return `${first} ${initial}.`;
  }

  function getRandomDuration() {
    const min = Math.floor(Math.random() * 4);
    const sec = Math.floor(Math.random() * 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  function createCallRow(call) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${call.from}</td>
      <td>${call.cnam}</td>
      <td>${call.dialed}</td>
      <td>${call.to}</td>
      <td>${call.duration}</td>
      <td><span class="speaker-icon" title="Listen in">🔊</span></td>
    `;
    return row;
  }

  function updateTable() {
    const tbody = document.getElementById(OVERLAY_BODY_ID);
    if (!tbody) return;
    tbody.innerHTML = '';
    calls.forEach(call => {
      call.duration = getRandomDuration();
      tbody.appendChild(createCallRow(call));
    });
  }

  function addNewCall() {
    if (calls.length >= 5) return;
    calls.push({
      from: getRandomName(),
      cnam: generatePhoneNumber(),
      dialed: 'SpeakAccount',
      to: getRandomExtensionName(),
      duration: getRandomDuration()
    });
  }

  function scheduleNextUpdate() {
    setInterval(() => {
      if (calls.length < 5 && Math.random() < 0.7) {
        addNewCall();
      } else if (calls.length > 0 && Math.random() < 0.3) {
        calls.shift();
      }
      updateTable();
    }, 3000);
  }

  function startSimulation() {
    addNewCall();
    updateTable();
    scheduleNextUpdate();
  }

  // -- Hook into Home button clicks --
  function waitForHomeClick() {
    const homeBtn = document.querySelector('#nav-home a') || document.querySelector('#nav-home');
    if (!homeBtn) return setTimeout(waitForHomeClick, 300);
    homeBtn.addEventListener('click', () => {
      setTimeout(() => {
        if (window.location.href.includes('/portal/home')) {
          injectOverlay();
        }
      }, 500);
    });
  }

  // Inject on initial load if already on home
  if (window.location.href.includes('/portal/home')) {
    setTimeout(injectOverlay, 500);
  }

  waitForHomeClick();
})();
