import { getCurrentRenderingComponent } from '../globalState';
import { extractVariablesFromPath } from '../router';

/**
 * Consumes the variables values from a dynamic route
 * @returns An object with the variables values
 */
export const consumeDynamicRoute = <T>(): T => {
    const componentId = getCurrentRenderingComponent();

    if (!componentId) {
        throw new Error(
            'consumeDynamicRoute must be called within a component'
        );
    }

    const currentPath = window.location.pathname;

    const variables = extractVariablesFromPath(currentPath);

    return variables as T;
};
