import { renderWithAdapters } from './adapters';

export const render = (vnode, container) => {
    if (!vnode) return;

    if (typeof vnode === 'string' || typeof vnode === 'number') {
        // Handle text nodes
        const textNode = document.createTextNode(String(vnode));
        container.appendChild(textNode);
    } else if (typeof vnode.type === 'function') {
        // Handle functional components
        const component = vnode.type(vnode.props);
        renderWithAdapters(vnode.type, container, vnode.props);

        console.log('component', component);
    } else if (typeof vnode === 'object' && typeof vnode.type === 'string') {
        // Handle HTML element nodes
        const domElement = document.createElement(vnode.type);

        // Set properties/attributes
        if (vnode.props) {
            Object.keys(vnode.props).forEach(propName => {
                if (propName !== 'children') {
                    const value = vnode.props[propName];
                    // If it is an event listener (e.g., onClick)
                    if (propName.startsWith('on')) {
                        domElement.addEventListener(
                            propName.substring(2).toLowerCase(),
                            value
                        );
                    } else {
                        // For normal attributes and properties
                        domElement[propName] = value;
                    }
                }
            });
        }

        // Recursive call for children
        if (vnode.children) {
            vnode.children.forEach(child => render(child, domElement));
        }

        container.appendChild(domElement);
    }
};
