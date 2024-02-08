window.addEventListener('HoneyAppData', msg => {
    console.log('content.js received message:', msg);

    chrome.runtime.sendMessage({ honeyDetected: true });

    if (msg.detail) {
        chrome.runtime.sendMessage({
            honeyVersion: msg.detail.version,
            honeyMode: msg.detail.mode,
            tree: msg.detail.tree,
            usingRouter: msg.detail.usingRouter,
            url: msg.detail.url,
            title: msg.detail.title
        });
    }
});

window.addEventListener('HoneySelectorResult', msg => {
    console.log('content.js received message:', msg);
    if (msg.detail) {
        chrome.runtime.sendMessage({
            honeySelectorResult: msg.detail
        });
    }
});

window.addEventListener('HoneySelectorClose', msg => {
    console.log('content.js received message:', msg);
    if (msg.detail !== undefined) {
        chrome.runtime.sendMessage({
            honeySelectorClose: msg.detail
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('content.js received message:', message);
    if (message['selectorActive'] !== undefined) {
        const event = new CustomEvent('HoneySelectorActive', {
            detail: message.selectorActive
        });
        console.log('content.js dispatching event:', event);
        window.dispatchEvent(event);
    }
});
