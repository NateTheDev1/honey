import { HONEY_COMPONENT_ID } from './constants';
import { HoneyRootContainer, VNode } from './createElement';
import {
    getAdaptersState,
    getComponentVNode,
    registerComponentVNode,
    setCurrentRenderingComponent
} from './globalState';
import { triggerMountAdapter, triggerUnmountAdapter } from './lifecycle';
import { renderWithAdapters } from './renderer';
import { generateUniqueId } from './utils/generateUniqueId';

export type HoneyDOMDiff = {
    requiresUpdate: boolean;
    patches: HoneyDOMPatch[];
};

export type HoneyDOMPatch = {
    type: 'ADD' | 'REMOVE' | 'REPLACE';
    newNode?: VNode;
    oldNode?: VNode;
};

export const getDOMDiff = (oldVNode: VNode | null, newVNode: VNode | null) => {
    let changes: HoneyDOMDiff = { requiresUpdate: false, patches: [] };

    // Base case: If the oldVNode and newVNode are identical, return no changes
    if (oldVNode === newVNode) {
        return changes;
    }

    // If the oldVNode is null, it means a new node has been added
    if (!oldVNode && newVNode) {
        changes.requiresUpdate = true;
        changes.patches.push({ type: 'ADD', newNode: newVNode });
        return changes;
    }

    // If the newVNode is null, it means a node has been removed
    if (oldVNode && !newVNode) {
        changes.requiresUpdate = true;
        changes.patches.push({ type: 'REMOVE', oldNode: oldVNode });
        return changes;
    }

    // If the types of VNodes are different, replace the old with the new
    if (oldVNode && newVNode && oldVNode.type !== newVNode.type) {
        changes.requiresUpdate = true;
        changes.patches.push({
            type: 'REPLACE',
            oldNode: oldVNode,
            newNode: newVNode
        });
        return changes;
    }

    if (oldVNode && newVNode && oldVNode.children && newVNode.children) {
        const max = Math.max(
            oldVNode.children.length,
            newVNode.children.length
        );
        for (let i = 0; i < max; i++) {
            const childChanges = getDOMDiff(
                oldVNode.children[i],
                newVNode.children[i]
            );
            if (childChanges.requiresUpdate) {
                changes.requiresUpdate = true;
                changes.patches = changes.patches.concat(childChanges.patches);
            }
        }
    }

    return changes;
};

export const patchDOM = (
    container: HoneyRootContainer,
    changes: HoneyDOMDiff
) => {
    if (!changes.requiresUpdate) return;

    changes.patches.forEach(patch => {
        switch (patch.type) {
            case 'ADD':
                if (!patch.newNode) return;

                // Add a new element to the container
                const newElement = createDOMElement(patch.newNode); // Assumes a function that creates a DOM element from a VNode
                container.appendChild(newElement);
                triggerMountAdapter(patch.newNode.props[HONEY_COMPONENT_ID]);
                break;
            case 'REMOVE':
                if (!patch.oldNode) return;

                // Remove the element from the container
                const oldElement = findDOMNode(patch.oldNode, container); // Assumes a function that finds the corresponding DOM node for a VNode
                oldElement?.parentNode?.removeChild(oldElement);
                triggerUnmountAdapter(patch.oldNode.props[HONEY_COMPONENT_ID]);
                break;
            case 'REPLACE':
                if (!patch.newNode || !patch.oldNode) return;

                // Replace the old element with a new one
                const replacementElement = createDOMElement(patch.newNode);

                const toReplaceElement = findDOMNode(patch.oldNode, container);

                toReplaceElement?.parentNode?.replaceChild(
                    replacementElement,
                    toReplaceElement
                );

                triggerUnmountAdapter(patch.oldNode.props[HONEY_COMPONENT_ID]);
                triggerMountAdapter(patch.newNode.props[HONEY_COMPONENT_ID]);
                break;
        }
    });
};

function createDOMElement(vnode: VNode): HTMLElement | Text {
    // Handling text nodes (strings and numbers)
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return document.createTextNode(String(vnode));
    }

    // Handling functional components
    if (typeof vnode.type === 'function') {
        // Use an existing ID if available, otherwise generate a new one
        let componentId = vnode.props[HONEY_COMPONENT_ID];

        if (!componentId) {
            componentId = generateUniqueId();
            vnode.props[HONEY_COMPONENT_ID] = componentId; // Assign the ID to the VNode
        }
        setCurrentRenderingComponent(componentId);

        const container = document.createElement('div');
        renderWithAdapters(vnode.type, container, vnode.props);

        registerComponentVNode(componentId, vnode);
        setCurrentRenderingComponent(null);

        const componentRootNode = container.firstChild as HTMLElement;
        if (componentRootNode) {
            componentRootNode.setAttribute(HONEY_COMPONENT_ID, componentId);
        }

        return componentRootNode;
    }

    // Handling HTML element nodes
    const element = document.createElement(vnode.type);

    if (vnode.props && !vnode.props[HONEY_COMPONENT_ID]) {
        vnode.props[HONEY_COMPONENT_ID] = generateUniqueId();
    }

    element.setAttribute(HONEY_COMPONENT_ID, vnode.props[HONEY_COMPONENT_ID]);

    // Set properties/attributes and unique identifier
    if (vnode.props) {
        Object.keys(vnode.props).forEach(propName => {
            const value = vnode.props[propName];
            if (propName !== 'children') {
                if (propName.startsWith('on') && typeof value === 'function') {
                    element.addEventListener(
                        propName.substring(2).toLowerCase(),
                        value
                    );
                } else {
                    element.setAttribute(propName, value.toString());
                }
            }
        });
    }

    // Recursive call for children
    if (vnode.children) {
        vnode.children.forEach(child => {
            const childElement = createDOMElement(child);

            if (childElement) {
                element.appendChild(childElement);
            }
        });
    }

    return element;
}

function findDOMNode(
    vnode: VNode,
    container: HoneyRootContainer
): HTMLElement | null {
    // Retrieve unique identifier from VNode
    const uniqueId = vnode.props?.[HONEY_COMPONENT_ID];

    if (!uniqueId) {
        console.error('VNode does not have a unique identifier. VNode:', vnode);
        return null;
    }

    // Use the unique identifier to find the corresponding DOM node
    const foundElement: any = document.querySelector(
        `[${HONEY_COMPONENT_ID}='${uniqueId}']`
    );

    if (!foundElement) {
        return null;
    }

    return foundElement;
}
export const renderComponent = componentId => {
    const componentInfo = getAdaptersState().get(componentId);

    if (!componentInfo) {
        console.error(
            'Component with the given ID does not exist:',
            componentId
        );
        return;
    }

    setCurrentRenderingComponent(componentId); // Set the current rendering component

    // Retrieve the old VNode and re-run the component function
    const oldVNode = getComponentVNode(componentId);
    const newVNode = componentInfo.componentFn(componentInfo.props);

    const currElement = document.querySelector(
        `[${HONEY_COMPONENT_ID}='${componentId}']`
    );

    const parent = currElement?.parentNode;

    // Perform diffing and patching
    const container = parent as HoneyRootContainer;

    const changes = getDOMDiff(oldVNode, newVNode);

    if (changes.requiresUpdate) {
        patchDOM(container, changes);
    }

    registerComponentVNode(componentId, newVNode);

    setCurrentRenderingComponent(null); // Reset the current rendering component
};
