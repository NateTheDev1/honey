import { renderWithAdapters } from './adapters';

export const render = (
    vnode,
    container,
    placeholder: Comment | null = null
) => {
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
            renderWithAdapters(vnode.type, container, vnode.props);
            rootNode = container.lastChild;

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

        if (placeholder && rootNode) {
            container.replaceChild(rootNode, placeholder);
        }

        return rootNode;
    } catch (promise) {
        if (promise instanceof Promise) {
            // Create a placeholder element for the lazy-loaded component
            const placeholder = document.createComment('lazy-placeholder');
            container.appendChild(placeholder);

            promise
                .then(() => {
                    // Remove the placeholder and re-render the lazy-loaded component at its position
                    render(vnode, container, placeholder);
                })
                .catch(error => {
                    console.error('Error loading component:', error);
                    // Optionally, remove the placeholder if the component fails to load
                    if (placeholder.parentNode) {
                        placeholder.parentNode.removeChild(placeholder);
                    }
                });
        } else {
            throw promise; // Re-throw if it's not a Promise
        }
    }
};
