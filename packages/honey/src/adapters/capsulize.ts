import { getAdaptersState, getCurrentRenderingComponent } from '../globalState';

/**
 * Capsulizes a callback based on its dependencies. This returns the callback created at registration unless the dependencies have changed.
 * @param callback - The function to capsulize
 * @param dependencies - The dependencies to use for capsulization
 * @returns The capsulized value
 * @example const memoizedCallback = capsulize(() => {
 *    console.log('This will only be called when the dependencies change');
 * }, [dependency1, dependency2]);
 * memoizedCallback(); // This will call the original callback
 */
export const capsulize = (callback: Function, dependencies: any[]) => {
    const componentId = getCurrentRenderingComponent();
    if (!componentId) {
        throw new Error(
            'useCallback must be used within a component render function'
        );
    }

    // Assume getAdaptersState() can store and retrieve state for each component, including hooks info
    const hooksInfo = getAdaptersState().get(componentId).hooksInfo || [];
    const prevHook = hooksInfo[hooksInfo.length - 1];

    // Check if dependencies have changed
    const hasChanged =
        !prevHook ||
        dependencies.some((dep, i) => dep !== prevHook.dependencies[i]);

    if (hasChanged) {
        // Store the new callback and dependencies if they have changed
        hooksInfo[hooksInfo.length - 1] = { callback, dependencies };
        getAdaptersState().get(componentId).hooksInfo = hooksInfo;
        return callback;
    }

    return prevHook.callback;
};
