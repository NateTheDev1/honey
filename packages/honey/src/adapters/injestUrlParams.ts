import { getCurrentRenderingComponent } from '../globalState';
import { renderComponent } from '../vdom';

const injestParamsStateMap = new Map<string, any>();

/**
 * Injest URL parameters and return them as an object
 * @returns {T} - The URL parameters as an object
 */
export const injestUrlParams = <T>(): T => {
    const componentId = getCurrentRenderingComponent();

    if (!componentId) {
        throw new Error('injestUrlParams must be called within a component');
    }

    if (!injestParamsStateMap.has(componentId)) {
        const urlParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlParams.entries());

        injestParamsStateMap.set(componentId, params);
    }

    // If params are not the same as last time, update the state
    const urlParams = new URLSearchParams(window.location.search);

    const params = Object.fromEntries(urlParams.entries());

    if (
        JSON.stringify(params) !==
        JSON.stringify(injestParamsStateMap.get(componentId))
    ) {
        injestParamsStateMap.set(componentId, params);
        renderComponent(componentId);
    }

    return injestParamsStateMap.get(componentId);
};
