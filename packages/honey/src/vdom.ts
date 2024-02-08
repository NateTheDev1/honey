import { HONEY_COMPONENT_ID } from './constants';
import { HoneyRootContainer, VNode } from './createElement';
import {
    getAdaptersState,
    getComponentVNode,
    registerComponentVNode,
    setCurrentRenderingComponent
} from './globalState';
import { triggerMountAdapter, triggerUnmountAdapter } from './lifecycle';
import { getDevTools, render, renderWithAdapters } from './renderer';
import { getRouterConfig } from './router';
import { generateUniqueId } from './utils/generateUniqueId';

export type HoneyDOMDiff = {
    requiresUpdate: boolean;
    patches: HoneyDOMPatch[];
};

export type HoneyDOMPatch = {
    type: 'ADD' | 'REMOVE' | 'REPLACE' | 'UPDATE';
    newNode?: VNode;
    oldNode?: VNode;
};

/**
 * Compares two virtual nodes and returns a diff of changes
 * @param oldVNode - The old virtual node
 * @param newVNode - The new virtual node
 * @returns - A diff of changes
 */
export const getDOMDiff = (oldVNode: VNode | null, newVNode: VNode | null) => {
    let changes: HoneyDOMDiff = { requiresUpdate: false, patches: [] };

    // Component identity check
    if (
        oldVNode &&
        newVNode &&
        oldVNode.props &&
        newVNode.props &&
        oldVNode.props[HONEY_COMPONENT_ID] ===
            newVNode.props[HONEY_COMPONENT_ID]
    ) {
        // Here, you would compare properties and states to determine if an update is necessary
        // For simplicity, we assume an update is needed if props or states differ
        changes.requiresUpdate = true;
        changes.patches.push({
            type: 'UPDATE',
            oldNode: oldVNode,
            newNode: newVNode // Assuming props or state might have changed, requiring an update
        });
    }

    // If the oldVNode is null, it means a new node has been added
    if (!oldVNode && newVNode) {
        changes.requiresUpdate = true;
        changes.patches.push({ type: 'ADD', newNode: newVNode });
    }

    // If the newVNode is null, it means a node has been removed
    if (oldVNode && !newVNode) {
        changes.requiresUpdate = true;
        changes.patches.push({ type: 'REMOVE', oldNode: oldVNode });
    }

    // If the types of VNodes are different, replace the old with the new
    if (oldVNode && newVNode && oldVNode.type !== newVNode.type) {
        changes.requiresUpdate = true;
        changes.patches.push({
            type: 'REPLACE',
            oldNode: oldVNode,
            newNode: newVNode
        });
    }

    if (oldVNode && newVNode && oldVNode.children && newVNode.children) {
        // Recursively compare children and their possible children
        const childPatches: any[] = [];

        const maxLength = Math.max(
            oldVNode.children.length,
            newVNode.children.length
        );

        for (let i = 0; i < maxLength; i++) {
            const oldChild = oldVNode.children[i];
            const newChild = newVNode.children[i];

            const childChanges = getDOMDiff(oldChild, newChild);

            if (childChanges.requiresUpdate) {
                changes.requiresUpdate = true;
                childPatches.concat(childChanges.patches);
            }
        }

        changes.patches = changes.patches.concat(childPatches);
    }

    return changes;
};

/**
 * Applies a diff of changes to the DOM
 * @param container - The root container to apply changes to
 * @param changes - The diff of changes to apply
 * @returns - A diff of changes
 */
export const patchDOM = (
    container: HoneyRootContainer,
    changes: HoneyDOMDiff
) => {
    if (!changes.requiresUpdate) return;

    changes.patches.forEach(patch => {
        switch (patch.type) {
            case 'UPDATE':
                if (!patch.oldNode || !patch.newNode) return;
                // Assume a function that updates the DOM element based on new VNode properties
                updateDOMElement(patch.oldNode, patch.newNode, container);
                // Re-trigger lifecycle hooks as necessary
                break;
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

function updateDOMElement(
    oldVNode: VNode,
    newVNode: VNode,
    container: HoneyRootContainer
) {
    const element = findDOMNode(oldVNode, container);

    if (!element) return;

    // Handle text node updates directly
    if (typeof newVNode === 'string' || typeof newVNode === 'number') {
        if (element.textContent !== String(newVNode)) {
            element.textContent = String(newVNode);
        }
    }

    if (typeof newVNode.type === 'string') {
        const newElement = createDOMElement(newVNode);
        element.parentNode?.replaceChild(newElement, element);
    }

    // Update attributes
    updateAttributes(element, newVNode.props);

    // Update children if not a text node
    if (oldVNode.children && newVNode.children) {
        updateChildren(element, oldVNode.children, newVNode.children);
    }
}

function updateChildren(
    parentElement: any,
    oldChildren: VNode[],
    newChildren: VNode[]
) {
    // This simple version assumes non-keyed VNodes for demonstration purposes.
    oldChildren.forEach((oldChild, index) => {
        const newChild = newChildren[index];
        if (!newChild) {
            // New child doesn't exist, remove old
            if (oldChild.props && oldChild.props[HONEY_COMPONENT_ID]) {
                const oldDOM = findDOMNode(oldChild, parentElement);
                if (oldDOM) parentElement.removeChild(oldDOM);
            }
        } else if (!oldChild) {
            // Old child doesn't exist, append new
            const newDOM = createDOMElement(newChild);
            parentElement.appendChild(newDOM);
        } else {
            // Update existing child
            updateDOMElement(oldChild, newChild, parentElement);
        }
    });

    // Handle case where there are more new children than old children
    if (newChildren.length > oldChildren.length) {
        newChildren.slice(oldChildren.length).forEach(newChild => {
            const newDOM = createDOMElement(newChild);
            parentElement.appendChild(newDOM);
        });
    }
}

function updateAttributes(
    element: HTMLElement,
    newProps: { [key: string]: any }
) {
    const allProps = new Set([
        ...Object.keys(element.attributes),
        ...Object.keys(newProps)
    ]);

    allProps.forEach(propName => {
        const newValue = newProps[propName];
        const attributeValue = element.getAttribute(propName);

        // If the new value is undefined, remove the attribute
        if (newValue === undefined) {
            element.removeAttribute(propName);
        } else if (attributeValue !== String(newValue)) {
            // Update or set the new value
            element.setAttribute(propName, newValue.toString());
        }
    });
}

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

    // Ensure vnode.props exists
    if (!vnode.props) {
        vnode.props = {};
    }

    // Assign a new unique ID only if it doesn't already have one
    if (!vnode.props[HONEY_COMPONENT_ID]) {
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

    try {
        // Render the component
        const content = componentInfo.componentFn(componentInfo.props);

        content.props[HONEY_COMPONENT_ID] = componentId;

        render(content, componentInfo.container, getDevTools());

        // Update the mounted state
        componentInfo.isMounted = true;
    } catch (e) {
        const errorComp = getRouterConfig()?.errorComponent;

        if (errorComp) {
            errorComp.props = {
                error: e
            };

            render(errorComp, componentInfo.container, getDevTools());
        }

        console.error(e);
    }

    setCurrentRenderingComponent(null); // Reset the current rendering component
};
