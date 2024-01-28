export const render = (vnode: any, container: HTMLElement) => {
    console.log('vnode', vnode);

    // Text node
    if (typeof vnode === 'string') {
        const textNode = document.createTextNode(vnode);
        container.appendChild(textNode);
        return;
    }

    // Element node
    const domElement = document.createElement(vnode.type);

    domElement.textContent = vnode.children[0];

    // Set attributes/props
    Object.keys(vnode.props || {}).forEach(propName => {
        if (propName === 'children') {
            // Recursive call for children
            vnode.props.children.forEach((child: any) =>
                render(child, domElement)
            );
        } else {
            // Set properties or attributes on the element
            domElement[propName] = vnode.props[propName];
        }
    });

    // Append to container
    container.appendChild(domElement);
};
