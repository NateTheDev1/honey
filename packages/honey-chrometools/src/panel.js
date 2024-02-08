// function Hello(props) {
//     return React.createElement('h1', null, `Hello ${props.text}`);
// }

// ReactDOM.render(
//     React.createElement(Hello, { text: 'World' }, null),
//     document.getElementById('root')
// );

githubIconUrl = chrome.extension.getURL('/images/github-icon.svg');

function Header(props) {
    return React.createElement('header', null, [
        React.createElement('div', { className: 'nav-left' }, [
            React.createElement('select', { id: 'tab-select' }, [
                React.createElement('option', { value: 'home' }, 'Home'),
                React.createElement(
                    'option',
                    { value: 'settings' },
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

port = chrome.runtime.connect({ name: 'panel' });

port.postMessage({ getTree: true });

port.onMessage.addListener(msg => {
    if (msg.pageTree) {
        console.log('panel.js received message:', msg);
    }
});
