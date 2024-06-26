let popupPort = null; // Store the popup's port globally
let panelPort = null; // Store the panel's port globally
let msgCache = null; // Cache messages if needed
let isPopupOpen = false; // Store the popup's state globally

function handlePageChange(tabId) {
    console.log('Tab ID:', tabId);

    chrome.tabs.get(tabId, function (tab) {
        if (tab.url) {
            const url = new URL(tab.url);
            const currentHost = url.hostname;

            // Check if the new URL's host matches the origin host
            if (currentHost !== originHost) {
                // Clear msgCache and notify the popup with null values
                msgCache = {
                    honeyVersion: null,
                    honeyMode: null,
                    tree: null,
                    usingRouter: null,
                    url: tab.url,
                    title: tab.title
                };

                if (isPopupOpen && popupPort) {
                    popupPort.postMessage(msgCache);
                }
                // Optionally reset originHost if you want to forget the previous state
                // originHost = null;
                originHost = null;
            }
        }
    });
}

chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
    handlePageChange(details.tabId);
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
    handlePageChange(activeInfo.tabId);
});

chrome.webNavigation.onCompleted.addListener(
    function (details) {
        handlePageChange(details.tabId);
    },
    { url: [{ urlMatches: 'http://*/*' }, { urlMatches: 'https://*/*' }] }
);

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
            // If there's a cached message, send it back through the same port
            if (msgCache) {
                port.postMessage(msgCache);
            }
        });
    } else if (port.name === 'panel') {
        panelPort = port;

        port.onMessage.addListener(msg => {
            chrome.tabs.query(
                { active: true, currentWindow: true },
                function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, msg);
                }
            );
        });

        if (msgCache) {
            panelPort.postMessage(msgCache);
        }
    }
});

let originHost = null; // Store the origin host globally

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.honeySelectorResult) {
        console.log('HoneySelectorResult', request.honeySelectorResult);

        panelPort.postMessage({
            honeySelectorResult: request.honeySelectorResult
        });
    }

    if (request.honeySelectorClose !== undefined) {
        panelPort.postMessage({
            honeySelectorClose: request.honeySelectorClose
        });
    }

    if (request.honeyVersion && request.honeyMode) {
        // Get the tab URL to extract the host
        if (sender.tab) {
            const url = new URL(sender.tab.url);
            originHost = url.hostname; // Store the hostname (host) of the origin

            msgCache = {
                honeyVersion: request.honeyVersion,
                honeyMode: request.honeyMode,
                tree: request.tree,
                usingRouter: request.usingRouter,
                url: request.url,
                title: request.title
            };

            console.log('UPDATE YEET', msgCache);

            // If the popup is open, send the message directly
            if (isPopupOpen && popupPort) {
                popupPort.postMessage(msgCache);
            }

            if (panelPort) {
                panelPort.postMessage(msgCache);
            }
        }
    }
});
