window.addEventListener('HoneyAppData', msg => {
    console.log('content.js received message:', msg);
    if (msg.detail) {
        // Send a message to the background script with the React version or build information.

        chrome.runtime.sendMessage({
            honeyVersion: msg.detail.version,
            honeyMode: msg.detail.mode
        });
    }
});
