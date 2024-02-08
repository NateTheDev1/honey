import { HoneyRootContainer } from './createElement';

let currentRenderingComponent: string | null = null;

export const setCurrentRenderingComponent = (componentId: string | null) => {
    currentRenderingComponent = componentId;
};

export const getCurrentRenderingComponent = (): string | null => {
    return currentRenderingComponent;
};

const componentVNodeMap = new Map();

export const registerComponentVNode = (componentId, vnode) => {
    componentVNodeMap.set(componentId, vnode);
};

export const getComponentVNode = componentId => {
    return componentVNodeMap.get(componentId);
};

let root: HoneyRootContainer | null = null;

export const setRoot = (container: HoneyRootContainer) => {
    root = container;
};

export const getRoot = (): HoneyRootContainer | null => {
    return root;
};

const adaptersState = new Map();

export const getAdaptersState = () => {
    return adaptersState;
};

/**
 * Tracks the state of the Honey Selector tool in the devtools
 */
let honeySelectorActive = false;

export const isHoneySelectorActive = () => {
    return honeySelectorActive;
};

export const setHoneySelectorActive = (active: boolean) => {
    honeySelectorActive = active;
};
