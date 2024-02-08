window.addEventListener('HoneyAppData', msg => {
    console.log('content.js received message:', msg);
    if (msg.detail) {
        chrome.runtime.sendMessage({
            honeyVersion: msg.detail.version,
            honeyMode: msg.detail.mode,
            tree: msg.detail.tree
        });
    }
});
