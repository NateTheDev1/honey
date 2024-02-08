import { HONEY_COMPONENT_ID } from './constants';
import { HoneyRootContainer, VNode } from './createElement';
import { initDevTools } from './devtools';
import {
    getAdaptersState,
    registerComponentVNode,
    setRoot
} from './globalState';
import { getRouterConfig } from './router';
import { generateUniqueId } from './utils/generateUniqueId';
import { getDOMDiff, patchDOM } from './vdom';

/**
 * A HoneyTree is a virtual node. Used to better understand the structure of the property for the developer.
 */
export type HoneyTree = VNode;

const __HONEY_APP_VERSION__ = '__HONEY_APP_VERSION__';
const __HONEY_APP_MODE__ = '__HONEY_APP_MODE__';

/**
 * To control the first render of the application
 */
let firstRender = true;

/**
 * Renders a collection of virtual nodes to the DOM using `honey`
 */
let devTools = false;

export const getDevTools = () => devTools;

/**
 * Renders a collection of virtual nodes to the DOM using `honey`
 * @param tree - The virtual node to render
 * @param container - The container to render the virtual node to. This is a DOM element that honey will render the application to.
 */
export const render = (
    tree: HoneyTree,
    container: HTMLElement,
    enableDevTools: boolean = false
) => {
    devTools = enableDevTools;

    let root: HoneyRootContainer = container as HoneyRootContainer;

    // setRoot(root);

    const oldVNode = root._vnode;

    const newVNode = tree;

    const changes = getDOMDiff(oldVNode, newVNode);

    if (changes && changes.requiresUpdate) {
        patchDOM(root, changes);
    }

    root._vnode = newVNode;

    if (firstRender) {
        firstRender = false;
    }

    if (devTools) {
        initDevTools();
    }
};

export function renderWithAdapters(componentFn, container, props) {
    const componentId = props[HONEY_COMPONENT_ID] ?? generateUniqueId();

    try {
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

        content.props[HONEY_COMPONENT_ID] = componentId;

        render(content, container, devTools);

        // Update the mounted state
        const componentInfo = getAdaptersState().get(componentId);
        componentInfo.isMounted = true;
    } catch (e) {
        const errorComp = getRouterConfig()?.errorComponent;

        if (errorComp) {
            errorComp.props = {
                error: e
            };

            render(errorComp, container, devTools);
        }

        console.error(e);
    }
}
