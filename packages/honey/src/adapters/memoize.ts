import { getAdaptersState, getCurrentRenderingComponent } from '../globalState';

/**
 * Memoizes a function based on its dependencies
 * @param fn - The function to memoize
 * @param dependencies - The dependencies to use for memoization
 * @returns The memoized value
 */
export const memoize = (fn: Function, dependencies: any[]) => {
    const componentId = getCurrentRenderingComponent();
    if (!componentId) {
        throw new Error(
            'useMemo must be used within a component render function'
        );
    }

    // Retrieve the previous memoization info for this component and hook index
    const memoInfo = getAdaptersState().get(componentId).memoInfo || [];
    const prevMemo = memoInfo[memoInfo.length - 1];

    // Determine if dependencies have changed
    const hasChanged =
        !prevMemo ||
        dependencies.some((dep, i) => dep !== prevMemo.dependencies[i]);

    if (hasChanged) {
        console.log('Memo has changed');
        // Recompute the value if dependencies have changed
        const newValue = fn();
        memoInfo[memoInfo.length - 1] = { value: newValue, dependencies };
        getAdaptersState().get(componentId).memoInfo = memoInfo;
        return newValue;
    }

    return prevMemo.value;
};
