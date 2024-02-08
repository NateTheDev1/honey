function createDevToolsPanel() {
    chrome.devtools.panels.create(
        'Honey', // Title for the panel tab
        'images/icon128.png',
        'src/panel.html', // HTML file for the panel's UI
        panel => {
            // Perform more setup here if necessary
        }
    );
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('background.js received message:', request);
    if (request.honeyDetected) {
        createDevToolsPanel();
    }
});
