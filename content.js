(function () {
  const targetUrl = 'https://portal02.clarityvoice.net/portal/home';
  const expectedName = 'Mike Johnson';
  const expectedExt = '200';

  const currentUrl = window.location.href;
  if (!currentUrl.startsWith(targetUrl)) {
    console.log('⛔ Not the correct page. Skipping.');
    return;
  }

  const waitForUserElement = setInterval(() => {
    const userEl = document.querySelector('.account-dropdown');

    if (userEl) {
      const userText = userEl.textContent.trim();
      const match = userText.match(/^(.+?)\s+\((\d+)\)$/);

      if (match) {
        const actualName = match[1];
        const actualExt = match[2];

        if (actualName === expectedName && actualExt === expectedExt) {
          console.log(`✅ Matched: ${actualName} (${actualExt})`);
          runHomeSimulation();
        } else {
          console.log(`⛔ Name or extension mismatch: Found "${actualName} (${actualExt})"`);
        }
      } else {
        console.log('⛔ Failed to parse user string.');
      }

      clearInterval(waitForUserElement);
    }
  }, 300);

  function runHomeSimulation() {
    if (document.getElementById("callsTableBody")) return;

    // Inject styles
    const style = document.createElement("style");
    style.textContent = `
body {
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
  margin: 0;
  padding: 20px;
}

h1 {
  font-size: 16px;
  color: #a8a8a8;
  text-transform: uppercase;
  font-weight: bold;
  margin-bottom: 12px;
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

thead {
  background-color: white;
}

.speaker-icon {
  cursor: pointer;
  transition: all 0.3s ease;
}

.speaker-icon svg {
  opacity: 0.4;
  transition: all 0.3s ease;
}

.speaker-icon:hover svg circle {
  fill: #e0e0e0;
  stroke: #999;
}

.speaker-icon:hover svg path {
  fill: #000;
  stroke: #000;
}

.speaker-icon:hover svg rect {
  fill: #000;
}

.speaker-icon:hover svg polygon {
  fill: #000;
}

.speaker-icon:hover svg {
  opacity: 1;
}

tr:hover {
  background-color: #f5f5f5;
}

tr:hover .speaker-icon svg {
  opacity: 0.7;
}

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
`;
    document.head.appendChild(style);

    function waitForWidgetAndInject() {
      const originalWidget = document.querySelector('div#omp-active-body');
      const killBox = document.querySelector('.portlet-container');

      if (originalWidget && originalWidget.parentNode) {
        if (killBox) killBox.style.display = 'none';

        const div = document.createElement("div");
        div.className = "call-container";
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
            <tbody id="callsTableBody"></tbody>
          </table>
        `;
        originalWidget.appendChild(div);

        // ✅ Now that the DOM element exists, it's safe to start updates
        addNewCall();
        updateTable();
        scheduleNextUpdate();
      } // <-- closes waitForWidgetAndInject
    }

        const names = [
      "Grace Smith", "Jason Tran", "Chloe Bennett", "Mike Johnson", "Raj Patel",
      "Ava Daniels", "Luis Santiago", "Emily Reyes", "Zoe Miller", "Derek Zhang",
      "Noah Brooks", "Liam Hayes", "Nina Clarke", "Omar Wallace", "Sara Bloom",
      "Connor Reed", "Ella Graham", "Miles Turner", "Ruby Foster", "Leo Knight"
    ];

    const firstNames = [
      "Nick", "Sarah", "Mike", "Lisa", "Tom", "Jenny", "Alex", "Maria", "John", "Kate",
      "David", "Emma", "Chris", "Anna", "Steve", "Beth", "Paul", "Amy", "Mark", "Jess"
    ];
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    function getRandomExtensionName() {
      const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const randomInitial = alphabet[Math.floor(Math.random() * alphabet.length)];
      return `${randomFirstName} ${randomInitial}.`;
    }

    const areaCodes = ["900", "700", "999", "888", "511", "600", "311", "322", "456"];
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

