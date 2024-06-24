let sortMethod = 'default'; 
let stylesApplied = false; 

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

function toggleStyles() { 
  if (stylesApplied) { 
    document.getElementById('style-element').remove(); 
    document.getElementById('toggle-styles').textContent = 'Apply Styles'; 
  } else { 
    const styleElement = document.createElement('link'); 
    styleElement.id = 'style-element'; 
    styleElement.rel = 'stylesheet'; 
    styleElement.href = chrome.runtime.getURL('styles.css'); 
    document.head.appendChild(styleElement); 
    document.getElementById('toggle-styles').textContent = 'Remove Styles'; 
  } 
  stylesApplied = !stylesApplied; 
} 

window.addEventListener('load', () => { 
  const targetNode = document.getElementById('history'); 
  const config = { childList: true, subtree: true }; 

  const observer = new MutationObserver((mutations) => { 
    observer.disconnect(); 
    sortEvents(); 
    observer.observe(targetNode, config); 
  }); 

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

    document.getElementById('toggle-styles').addEventListener('click', toggleStyles); 

    toggleStyles(); // Apply styles initially 
  } 

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => { 
    if (request.sortMethod) { 
      sortMethod = request.sortMethod; 
      sortEvents(); 
      sendResponse({ status: 'success' }); 
    } 
  }); 
});