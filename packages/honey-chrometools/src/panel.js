const port = chrome.runtime.connect({ name: 'panel' });
port.onMessage.addListener(msg => {
    console.log('panel.js received message:', msg);
    if (msg.reactMessage) {
        document.getElementById('status').textContent = msg.reactMessage;
    }
});
