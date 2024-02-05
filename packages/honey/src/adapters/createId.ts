import { getCurrentRenderingComponent } from '../globalState';
import { generateUniqueIdForComponent } from '../utils/generateUniqueId';

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
        console.log('Creating new id for component', componentId);
        idStateMap.set(componentId, generateUniqueIdForComponent(componentId));
        console.log(
            'New id for component',
            componentId,
            idStateMap.get(componentId)
        );
    }

    return idStateMap.get(componentId);
};
