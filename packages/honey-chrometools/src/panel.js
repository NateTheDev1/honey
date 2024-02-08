// interface SerializedNode {
//     type: number;
//     tagName?: string;
//     attributes?: { [key: string]: string | null };
//     children: SerializedNode[];
//     textContent?: string | null;
// }

githubIconUrl = chrome.extension.getURL('/images/github-icon.svg');

port = chrome.runtime.connect({ name: 'panel' });

port.postMessage({ getTree: true });

port.onMessage.addListener(msg => {
    if (msg.pageTree) {
        console.log('panel.js received message:', msg);
    }
});

function Header(props) {
    const [tab, setTab] = React.useState('home');
    const [selectorActive, setSelectorActive] = React.useState(false);

    const notifySelectorActive = active => {
        port.postMessage({ selectorActive: active });
    };

    return React.createElement('header', null, [
        React.createElement('div', { className: 'nav-left' }, [
            React.createElement(
                'svg',
                {
                    xmlns: 'http://www.w3.org/2000/svg',
                    width: '1em',
                    height: '1em',
                    viewBox: '0 0 1024 1024',
                    className: selectorActive
                        ? 'selector-icon active'
                        : 'selector-icon',
                    onClick: () => {
                        notifySelectorActive(!selectorActive);
                        setSelectorActive(!selectorActive);
                    }
                },
                [
                    React.createElement('path', {
                        fill: 'currentColor',
                        d: 'M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h360c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H184V184h656v320c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V144c0-17.7-14.3-32-32-32M653.3 599.4l52.2-52.2a8.01 8.01 0 0 0-4.7-13.6l-179.4-21c-5.1-.6-9.5 3.7-8.9 8.9l21 179.4c.8 6.6 8.9 9.4 13.6 4.7l52.4-52.4l256.2 256.2c3.1 3.1 8.2 3.1 11.3 0l42.4-42.4c3.1-3.1 3.1-8.2 0-11.3z'
                    })
                ]
            ),
            React.createElement('select', { id: 'tab-select' }, [
                React.createElement('option', { value: 'home' }, 'Home'),
                React.createElement(
                    'option',
                    { value: tab, onChange: e => setTab(e.target.value) },
                    'Settings'
                ),
                React.createElement('option', { value: 'about' }, 'About')
            ])
        ]),

        React.createElement('div', { className: 'nav-right' }, [
            React.createElement(
                'a',
                {
                    href: 'https://honeyjs.mintlify.app/introduction/overview',
                    target: '_blank'
                },
                React.createElement('img', {
                    src: 'https://mintlify.s3-us-west-1.amazonaws.com/honeyjs/logo/logo-dark.svg',
                    alt: 'Honey Logo',
                    id: 'logo'
                })
            ),
            React.createElement(
                'a',
                {
                    href: 'https://github.com/NateTheDev1/honey',
                    target: '_blank'
                },
                React.createElement(
                    'svg',
                    {
                        xmlns: 'http://www.w3.org/2000/svg',
                        width: '1em',
                        height: '1em',
                        viewBox: '0 0 24 24'
                    },
                    React.createElement('path', {
                        fill: 'currentColor',
                        d: 'M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2'
                    })
                )
            )
        ])
    ]);
}

function App() {
    // type, props, children
    return React.createElement('div', { className: 'app' }, [
        React.createElement(Header)
    ]);
}

ReactDOM.render(
    React.createElement(App, null, null),
    document.getElementById('root')
);
