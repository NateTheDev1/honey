import { getCurrentRenderingComponent } from '../globalState';

const idStateMap = new Map();
/**
 * Create a random string of 9 characters. Stores the ID between renders.
 * @returns {string} - A random string of 9 characters
 */
export const createId = () => {
    const componentId = getCurrentRenderingComponent();

    if (!componentId) {
        throw new Error('createId must be called within a component');
    }

    if (!idStateMap.has(componentId)) {
        idStateMap.set(componentId, createId());
    }

    return idStateMap.get(componentId);
};
