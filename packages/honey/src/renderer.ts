import { HONEY_COMPONENT_ID } from './constants';
import { HoneyRootContainer, VNode } from './createElement';
import {
    getAdaptersState,
    getCurrentRenderingComponent,
    setRoot
} from './globalState';
import { generateUniqueId } from './utils/generateUniqueId';
import { getDOMDiff, patchDOM } from './vdom';

/**
 * A HoneyTree is a virtual node. Used to better understand the structure of the property for the developer.
 */
type HoneyTree = VNode;

/**
 * Renders a collection of virtual nodes to the DOM using `honey`
 * @param tree - The virtual node to render
 * @param container - The container to render the virtual node to. This is a DOM element that honey will render the application to.
 */
export const render = (tree: HoneyTree, container: HTMLElement) => {
    let root: HoneyRootContainer = container as HoneyRootContainer;

    setRoot(root);

    const oldVNode = root._vnode;

    const newVNode = tree;

    const changes = getDOMDiff(oldVNode, newVNode);

    if (changes && changes.requiresUpdate) {
        patchDOM(root, changes);
    }

    root._vnode = newVNode;
};

export function renderWithAdapters(componentFn, container, props) {
    const componentId = props[HONEY_COMPONENT_ID] ?? generateUniqueId();

    // Manage the state and props for the component
    if (!getAdaptersState().has(componentId)) {
        // Initial render
        getAdaptersState().set(componentId, {
            componentFn,
            container,
            props,
            isMounted: false
        });
    } else {
        // Subsequent renders (state updates)
        const componentInfo = getAdaptersState().get(componentId);
        componentInfo.props = props;
    }

    // Render the component
    const content = componentFn(props);

    render(content, container);

    // Update the mounted state
    const componentInfo = getAdaptersState().get(componentId);
    componentInfo.isMounted = true;
}
