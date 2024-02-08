// Helper function to convert DOM nodes to the SerializedNode structure
function domNodeToSerializedNode(domNode) {
    // Determine node type and handle accordingly
    if (domNode.nodeType === Node.TEXT_NODE) {
        return {
            type: domNode.nodeType,
            textContent: domNode.nodeValue,
            children: []
        };
    } else if (domNode.nodeType === Node.ELEMENT_NODE) {
        const attributes = Array.from(domNode.attributes).reduce(
            (acc, attr) => {
                acc[attr.name] = attr.value;
                return acc;
            },
            {}
        );

        const children = Array.from(domNode.childNodes).map(child =>
            domNodeToSerializedNode(child)
        );

        return {
            type: domNode.nodeType,
            tagName: domNode.tagName.toLowerCase(),
            attributes,
            children
        };
    }

    // Default return for unsupported nodes
    return null;
}

// Main function to convert SVG string to React element
function svgStringToElement(svgString, props = {}) {
    // Parse the SVG string to a DOM element
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgElement = doc.documentElement;

    // Convert DOM to SerializedNode structure
    const serializedNode = domNodeToSerializedNode(svgElement);

    // Function to recursively create React elements from SerializedNode
    function createElementFromSerializedNode(node) {
        if (!node) return null;
        if (node.type === Node.TEXT_NODE) {
            return node.textContent;
        }

        return React.createElement(
            node.tagName,
            { ...node.attributes, ...props },
            ...node.children.map(createElementFromSerializedNode)
        );
    }

    // Create React element from serialized SVG node
    return createElementFromSerializedNode(serializedNode);
}

githubIconUrl = chrome.extension.getURL('/images/github-icon.svg');

port = chrome.runtime.connect({ name: 'panel' });

port.postMessage({ getTree: true });

function Header(props) {
    const [tab, setTab] = React.useState('home');
    const [selectorActive, setSelectorActive] = React.useState(false);

    React.useEffect(() => {
        port.onMessage.addListener(msg => {
            console.log('panel.js received message:', msg);
            if (msg.honeySelectorClose) {
                setSelectorActive(false);
            }
        });

        return () => {
            port.onMessage.removeListener();
        };
    }, []);

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

function ConfigDetails(props) {
    const [initValues, setInitValues] = React.useState(null);
    const [configDetailsOpen, setConfigDetailsOpen] = React.useState(true);

    React.useEffect(() => {
        port.onMessage.addListener(msg => {
            if (msg.pageTree) {
                console.log('panel.js received message:', msg);
            }

            if (msg.honeyVersion) {
                console.log('panel.js received message:', msg);
                setInitValues(msg);
            }
        });

        return () => {
            port.onMessage.removeListener();
        };
    }, []);

    return React.createElement('div', { className: 'config-details' }, [
        React.createElement('div', { className: 'config-detail-top' }, [
            React.createElement(
                'div',
                { className: 'config-detail-top-left' },
                [
                    React.createElement('h2', null, 'Configuration Details'),
                    React.createElement(
                        'h4',
                        null,
                        'View the current configuration details for the Honey instance running on this page.'
                    )
                ]
            ),
            configDetailsOpen
                ? svgStringToElement(
                      `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 22q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22"/></svg>`,
                      {
                          className: 'config-detail-toggler',
                          onClick: () =>
                              setConfigDetailsOpen(!configDetailsOpen)
                      }
                  )
                : svgStringToElement(
                      `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 22q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12q0-3.35-2.325-5.675T12 4Q8.65 4 6.325 6.325T4 12q0 3.35 2.325 5.675T12 20m0-8"/></svg>`,
                      {
                          className: 'config-detail-toggler',
                          onClick: () =>
                              setConfigDetailsOpen(!configDetailsOpen)
                      }
                  )
        ]),
        configDetailsOpen && [
            React.createElement('div', { className: 'config-details-left' }, [
                React.createElement('p', { className: 'honey-version' }, [
                    '⚙️ Honey: ',
                    React.createElement(
                        'span',
                        null,
                        'v' + initValues?.honeyVersion
                    )
                ]),
                React.createElement('p', null, [
                    '🛠️ Build Mode: ',
                    React.createElement('span', null, initValues?.honeyMode)
                ]),
                React.createElement('p', null, [
                    'Honey Router: ',
                    React.createElement(
                        'span',
                        null,
                        initValues?.usingRouter ? '✅' : '❌'
                    )
                ])
            ]),
            React.createElement('div', { className: 'config-details-right' }, [
                React.createElement('p', null, [
                    '🌐 URL: ',
                    React.createElement('span', null, initValues?.url)
                ]),
                React.createElement('p', null, [
                    '📜 Title: ',
                    React.createElement('span', null, initValues?.title)
                ])
            ])
        ]
    ]);
}

// interface SerializedNode {
//     type: number;
//     tagName?: string;
//     attributes?: { [key: string]: string | null };
//     children: SerializedNode[];
//     textContent?: string | null;
// }

// Visual Tree Item
function NodeDisplay({ node, selectedNode, setSelectedNode }) {
    const [expanded, setExpanded] = React.useState(true);

    if (!node) return null;

    if (node.type === Node.TEXT_NODE) {
        if (node.textContent.trim() === '') return null;

        return React.createElement(
            'span',
            { className: 'node-text' },
            `"${node.textContent}"`
        );
    }

    return React.createElement(
        'div',
        {
            className: 'node-display'
        },
        [
            React.createElement(
                'div',
                {
                    className:
                        typeof node !== 'string' &&
                        selectedNode !== null &&
                        node !== null &&
                        selectedNode['attributes'] &&
                        node['attributes']
                            ? selectedNode['attributes'][
                                  'data-honey-component-id'
                              ] ===
                              node['attributes']['data-honey-component-id']
                                ? 'node-header active'
                                : 'node-header'
                            : 'node-header',
                    onClick: () => {
                        if (expanded && node === selectedNode) {
                            setExpanded(false);
                        } else {
                            setSelectedNode(node);
                            setExpanded(true);
                        }
                    }
                },
                [
                    node.children &&
                        node.children.length > 0 &&
                        (expanded
                            ? svgStringToElement(
                                  `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6z"/></svg>`
                              )
                            : svgStringToElement(
                                  `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6z"/></svg>`
                              )),
                    React.createElement(
                        'span',
                        { className: 'node-type' },
                        !node.tagName ? '<>' : node.tagName
                    ),
                    React.createElement(
                        'span',
                        { className: 'node-attributes' },
                        node.attributes &&
                            Object.keys(node.attributes).map((key, i) => {
                                return React.createElement(
                                    'span',
                                    { className: 'node-attribute', key: i },
                                    `${key}="${node.attributes[key]}"`
                                );
                            })
                    )
                ]
            ),
            expanded &&
                React.createElement(
                    'div',
                    { className: 'node-children' },
                    node.children &&
                        node.children.map((child, i) =>
                            React.createElement(NodeDisplay, {
                                node: child,
                                key: i,
                                selectedNode: selectedNode,
                                setSelectedNode: setSelectedNode
                            })
                        )
                )
        ]
    );
}

function DOMViewer({ selectedNode, setSelectedNode }) {
    const [pageTree, setPageTree] = React.useState({});

    React.useEffect(() => {
        port.onMessage.addListener(msg => {
            if (msg.honeySelectorResult) {
                setSelectedNode(msg.honeySelectorResult);
            }

            if (msg.tree) {
                setSelectedNode(msg.tree);
                setPageTree(msg.tree);
            }
        });

        return () => {
            port.onMessage.removeListener();
        };
    }, []);

    return React.createElement('div', { className: 'dom-viewer-container' }, [
        //  Tree
        React.createElement('div', { className: 'dom-viewer-title' }, [
            React.createElement('h2', null, 'Application Tree'),
            React.createElement(
                'h4',
                null,
                'View the current application tree for the page. Note: This tree may not be the same as the actual DOM tree, as it is a representation of the application tree that Honey is using to render the page. Some "style" attributes may show up, but they are a representation of the selected element.'
            )
        ]),
        React.createElement('div', { className: 'dom-viewer' }, [
            pageTree &&
                React.createElement(NodeDisplay, {
                    node: pageTree,
                    selectedNode: selectedNode,
                    setSelectedNode: setSelectedNode
                })
        ])
    ]);
}

function SelectedNodeDetails({ selectedNode }) {
    const converTypeToString = type => {
        switch (type) {
            case 1:
                return 'Element';
            case 3:
                return 'Text';
            case 8:
                return 'Comment';
            case 9:
                return 'Document';
            case 11:
                return 'Document Fragment';
            default:
                return 'Unknown';
        }
    };

    return React.createElement('div', { className: 'selected-node-details' }, [
        React.createElement('div', { className: 'dom-viewer-title' }, [
            React.createElement('h2', null, 'Node Details'),
            React.createElement(
                'h4',
                null,
                'View the details of the selected node in the application tree.'
            )
        ]),
        React.createElement(
            'div',
            { className: 'selected-node' },
            selectedNode
                ? [
                      selectedNode.tagName &&
                          React.createElement(
                              'p',
                              { className: 'selected-node-tag' },
                              `<${selectedNode.tagName} />`
                          ),
                      React.createElement(
                          'p',
                          { className: 'selected-node-type' },
                          `Node Type: ${converTypeToString(selectedNode.type)}`
                      ),
                      selectedNode.attributes &&
                          React.createElement(
                              'p',
                              { className: 'selected-node-attributes' },
                              `Active Attributes: ${JSON.stringify(
                                  selectedNode.attributes
                              )}`
                          ),
                      // Children
                      selectedNode.children &&
                          React.createElement(
                              'p',
                              { className: 'selected-node-children' },
                              `Contains ${selectedNode.children.length} child elements`
                          )
                  ]
                : null
        )
    ]);
}

function App() {
    const [selectedNode, setSelectedNode] = React.useState(null);

    // type, props, children
    return React.createElement('div', { className: 'app' }, [
        React.createElement(Header),
        React.createElement(ConfigDetails),
        React.createElement(DOMViewer, { selectedNode, setSelectedNode }),
        React.createElement(SelectedNodeDetails, { selectedNode })
    ]);
}

ReactDOM.render(
    React.createElement(App, null, null),
    document.getElementById('root')
);

// If page refreshes, clear the tree
window.addEventListener('beforeunload', () => {
    ReactDOM.render(
        React.createElement(App, null, null),
        document.getElementById('root')
    );
});
