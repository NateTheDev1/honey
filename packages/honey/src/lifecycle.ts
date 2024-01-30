type LifecycleAdapter = () => void;

interface LifecycleRegistryItem {
    onMount?: LifecycleAdapter;
    onUpdate?: LifecycleAdapter;
    onUnmount?: LifecycleAdapter;
}

// Global registry for tracking component lifecycle states
const lifecycleRegistry = new Map<string, LifecycleRegistryItem>();

export function reigsterLifecycleAdapters(
    componentId: string,
    adapters: LifecycleRegistryItem
) {
    lifecycleRegistry.set(componentId, adapters);
}

function triggerLifecycleAdapter(
    componentId: string,
    adapterType: keyof LifecycleRegistryItem
) {
    const adapters = lifecycleRegistry.get(componentId);
    if (adapters && adapters[adapterType]) {
        let fn = adapters[adapterType];

        if (fn) {
            fn();
        }
    }
}

// Export functions to trigger specific lifecycle events
export function triggerMountAdapter(componentId: string) {
    triggerLifecycleAdapter(componentId, 'onMount');
}

export function triggerUpdateAdapter(componentId: string) {
    triggerLifecycleAdapter(componentId, 'onUpdate');
}

export function triggerUnmountAdapter(componentId: string) {
    triggerLifecycleAdapter(componentId, 'onUnmount');
}
