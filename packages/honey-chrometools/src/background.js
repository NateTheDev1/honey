let popupPort = null; // Store the popup's port globally
let msgCache = null; // Cache messages if needed

chrome.runtime.onConnect.addListener(port => {
    if (port.name === 'popup') {
        popupPort = port; // Assign the connected port to popupPort
        isPopupOpen = true;

        port.onDisconnect.addListener(() => {
            isPopupOpen = false;
            popupPort = null; // Clear the port when the popup disconnects
        });

        // This listener is for messages coming from the popup
        port.onMessage.addListener(msg => {
            console.log('background.js received message:', msg);
            // If there's a cached message, send it back through the same port
            if (msgCache) {
                port.postMessage(msgCache);
            }
        });
    }
});

// Assume this is triggered by some other part of your extension,
// like a content script or a different event
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('background.js received message:', request);
    // Cache or process the message as needed
    if (request.honeyVersion && request.honeyMode) {
        msgCache = {
            honeyVersion: request.honeyVersion,
            honeyMode: request.honeyMode
        };
        // If the popup is open, send the message directly
        if (isPopupOpen && popupPort) {
            popupPort.postMessage(msgCache);
        }
    }
});
