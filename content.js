let sortMethod = 'default';
let stylesApplied = fals;

function sortEvents() {
  const eventPanels = document.querySelectorAll('.realmstock-panel');
  const eventArray = Array.from(eventPanels);

  eventArray.sort((a, b) => {
    let valueA, valueB;

    if (sortMethod === 'population') {
      valueA = a.querySelector('.event-population')?.textContent.split('/')[0].trim();
      valueB = b.querySelector('.event-population')?.textContent.split('/')[0].trim();
    } else if (sortMethod === 'score') {
      valueA = a.querySelector('.event-score')?.textContent.split(': ')[1];
      valueB = b.querySelector('.event-score')?.textContent.split(': ')[1];
    } else if (sortMethod === 'time') {
      valueA = new Date(a.querySelector('.event-time')?.textContent.trim());
      valueB = new Date(b.querySelector('.event-time')?.textContent.trim());
    }

    if (valueA === undefined || valueB === undefined) {
      return 0;
    }

    if (sortMethod === 'time') {
      return valueA - valueB;
    } else {
      return parseInt(valueB) - parseInt(valueA);
    }
  });

  const container = document.getElementById('history');
  if (!container) return;

  container.innerHTML = '';
  eventArray.forEach(panel => container.appendChild(panel));
}

function addGlobalStyles() {
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
    body {
      background-color: rgba(44, 47, 51, 0.8); /* Making background transparent */
      color: #ffffff;
      font-family: 'Roboto', sans-serif;
    }
    .realmstock-panel {
      background-color: rgba(35, 39, 42, 0.9); /* Making panels transparent */
      border: 1px solid #99aab5;
      border-radius: 5px;
      margin-bottom: 10px;
      padding: 10px;
      transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, background-color 0.3s;
    }
    .realmstock-panel:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
      background-color: rgba(40, 43, 46, 1);
    }
    .realmstock-panel h3 {
      color: #f0a500;
    }
    .button-toggle-styles {
      background: linear-gradient(135deg, #ff416c, #ff4b2b);
      color: white;
      border: none;
      border-radius: 5px;
      padding: 5px 10px;
      cursor: pointer;
      transition: background 0.3s, transform 0.3s;
      font-size: 12px;
    }
    .button-toggle-styles:hover {
      background: linear-gradient(135deg, #ff4b2b, #ff416c);
      transform: scale(1.05);
    }
    #sort-control-panel {
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(26, 26, 29, 0.9);
      padding: 10px;
      border-radius: 5px;
      z-index: 1000;
      color: white;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
      transition: transform 0.3s ease-in-out;
      width: 200px;
    }
    #sort-control-panel:hover {
      transform: translateY(-5px);
    }
    #sortMethod {
      width: 100%;
      padding: 5px;
      border: none;
      border-radius: 5px;
      background-color: #333;
      color: white;
      margin-bottom: 10px;
      transition: background-color 0.3s, transform 0.3s;
      font-size: 12px;
    }
    #sortMethod:hover {
      background-color: #444;
      transform: scale(1.02);
    }
  `;

  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
  stylesApplied = true;
}

function removeGlobalStyles() {
  const styleSheets = document.head.getElementsByTagName("style");
  for (let i = styleSheets.length - 1; i >= 0; i--) {
    if (styleSheets[i].innerText.includes('background-color: rgba(44, 47, 51, 0.8)')) {
      document.head.removeChild(styleSheets[i]);
    }
  }
  stylesApplied = false;
}



const targetNode = document.getElementById('history');
const config = { childList: true, subtree: true };

const observer = new MutationObserver((mutations) => {
  observer.disconnect();
  sortEvents();
  observer.observe(targetNode, config);
});

window.addEventListener('load', () => {
  if (targetNode) {
    observer.observe(targetNode, config);
    sortEvents();

    const controlPanel = document.createElement('div');
    controlPanel.id = 'sort-control-panel';
    controlPanel.innerHTML = `
      <h3 style="font-size: 14px; margin-bottom: 10px;">Sort Events By:</h3>
      <select id="sortMethod">
        <option value="default">Default</option>
        <option value="population">Population</option>
        <option value="score">Event Score</option>
        <option value="time">Event Time</option>
      </select>
      <button id="toggle-styles" class="button-toggle-styles">Toggle Styles</button>
    `;
    document.body.appendChild(controlPanel);

    document.getElementById('sortMethod').addEventListener('change', (event) => {
      sortMethod = event.target.value;
      sortEvents();
    });

    document.getElementById('toggle-styles').addEventListener('click', () => {
      if (stylesApplied) {
        removeGlobalStyles();
        document.getElementById('toggle-styles').textContent = 'Apply Styles';
      } else {
        addGlobalStyles();
        document.getElementById('toggle-styles').textContent = 'Remove Styles';
      }
    });

    addGlobalStyles();

  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.sortMethod) {
      sortMethod = request.sortMethod;
      sortEvents();
      sendResponse({ status: 'success' });
    }
  });
});
