let port;

window.onload = () => {
    port = chrome.runtime.connect({ name: 'popup' });

    console.log('popup.js loaded');
    port.postMessage({ popupLoaded: true });

    port.onMessage.addListener(msg => {
        if (!msg.honeyMode || !msg.honeyVersion) {
            document.getElementById('is-not-app').style.display = 'block';
            document.getElementById('is-app').style.display = 'none';
            return;
        }

        document.getElementById('is-not-app').style.display = 'none';
        document.getElementById('is-app').style.display = 'block';

        console.log('panel.js received message:', msg);
        console.log('Honey Version:', msg.honeyVersion);

        document.getElementById('mode').textContent = msg.honeyMode;

        document.getElementById(
            'app-config'
        ).innerHTML = `App Configuration Correct <span id='app-config-version'> ${msg.honeyVersion}</span>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
            >
                <path
                    fill="#3fca48"
                    fill-rule="evenodd"
                    d="M7 2a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5zm8.73 8.684a1 1 0 1 0-1.46-1.368l-3.083 3.29l-1.523-1.353a1 1 0 0 0-1.328 1.494l2.25 2a1 1 0 0 0 1.393-.063z"
                    clip-rule="evenodd"
                />
            </svg>`;
    });
};

window.onunload = () => {
    console.log('popup.js unloaded');
    // Perform cleanup if necessary
    if (port) {
        port.disconnect();
    }
};
