import { renderWithAdapters } from './adapters';

export const render = (vnode, container) => {
    if (!vnode) return null;

    try {
        let rootNode: Node | null = null;

        // Handle text nodes (strings and numbers)
        if (typeof vnode === 'string' || typeof vnode === 'number') {
            rootNode = document.createTextNode(String(vnode));
            container.appendChild(rootNode);
        }
        // Handle functional components
        else if (typeof vnode.type === 'function') {
            // Render the component and get its root DOM node
            renderWithAdapters(vnode.type, container, vnode.props);

            // Assuming the component appends its root node to the container
            rootNode = container.lastChild;

            // Assign a unique identifier to the component's root node
            if (
                rootNode instanceof HTMLElement ||
                rootNode instanceof SVGElement
            ) {
                rootNode.setAttribute(
                    'data-honey-component-id',
                    vnode.type.name
                );
            }
        }
        // Handle HTML element nodes
        else if (typeof vnode === 'object' && vnode.type) {
            rootNode = document.createElement(vnode.type);

            // Set properties/attributes
            if (vnode.props) {
                Object.keys(vnode.props).forEach(propName => {
                    if (propName !== 'children') {
                        const value = vnode.props[propName];
                        if (
                            propName.startsWith('on') &&
                            rootNode instanceof HTMLElement
                        ) {
                            rootNode.addEventListener(
                                propName.substring(2).toLowerCase(),
                                value
                            );
                        } else if (rootNode) {
                            rootNode[propName] = value;
                        }
                    }
                });
            }

            // Recursive call for children
            if (vnode.children) {
                vnode.children.forEach(child => render(child, rootNode));
            }

            container.appendChild(rootNode);
        }

        return rootNode;
    } catch (promise) {
        if (promise instanceof Promise) {
            // Handle the promise from lazy-loaded components
            promise
                .then(() => {
                    // Re-render once the component has loaded
                    while (container.firstChild) {
                        container.removeChild(container.firstChild);
                    }
                    render(vnode, container);
                })
                .catch(error => {
                    console.error('Error loading component:', error);
                    // Handle or log the error as needed
                });
        } else {
            throw promise; // Re-throw if it's not a Promise
        }
    }
};
