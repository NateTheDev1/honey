import { getCurrentRenderingComponent } from '../globalState';
import { reigsterLifecycleAdapters, triggerUnmountAdapter } from '../lifecycle';

type CleanupFunction = () => void;

const haveDepsChanged = (oldDeps: any[], newDeps: any[]): boolean => {
    if (oldDeps.length !== newDeps.length) return true;
    return oldDeps.some((dep, index) => dep !== newDeps[index]);
};

// Global state to track component's last dependencies
const lastDependencies = new Map<string, any[]>();

/**
 * Inspect the lifecycle of a functional component and run the callback when the component mounts or updates.
 * @param callback - The callback to run when the component mounts or updates
 * @param deps - The dependencies to watch for changes
 */
export function inspectLifecycle(
    callback: () => CleanupFunction | void,
    deps: any[]
) {
    const componentId = getCurrentRenderingComponent();

    if (!componentId) {
        throw new Error(
            'inspectLifecycle must be used within a functional component.'
        );
    }

    // Function to be called on component mount or update
    const onMountOrUpdate = () => {
        const lastDeps = lastDependencies.get(componentId);

        if (!lastDeps || haveDepsChanged(lastDeps, deps)) {
            // Cleanup before running new effect
            triggerUnmountAdapter(componentId);

            const cleanup = callback();
            if (typeof cleanup === 'function') {
                reigsterLifecycleAdapters(componentId, { onUnmount: cleanup });
            }

            lastDependencies.set(componentId, deps);
        }
    };

    // Register for the first time or on dependencies change
    reigsterLifecycleAdapters(componentId, {
        onMount: onMountOrUpdate,
        onUpdate: onMountOrUpdate
    });

    onMountOrUpdate();
}
