import { render } from './renderer';

let currentComponent = null;
let adapterIndex = 0;
const adaptersState = new Map();

let renderQueue: any[] = [];

export function renderWithAdapters(componentFn, container, props) {
    const componentName = componentFn.name;
    currentComponent = componentName;
    adapterIndex = 0;

    if (!adaptersState.has(componentName)) {
        adaptersState.set(componentName, {
            adapters: [],
            cleanup: [],
            componentFn,
            container, // Storing container
            props, // Storing initial props
            isMounted: false
        });
    } else {
        // Update props for subsequent renders
        const componentInfo = adaptersState.get(componentName);
        componentInfo.props = props;
    }

    // Execute the component function and render the returned content
    const content = componentFn(props);
    render(content, container);

    // Mark component as mounted
    const componentInfo = adaptersState.get(componentName);
    componentInfo.isMounted = true;

    // After rendering and hook logic, reset currentComponent
    currentComponent = null;
}

function processRenderQueue() {
    while (renderQueue.length) {
        const renderFn = renderQueue.shift();
        renderFn();
    }
}

/**
 * Lifecycle Methods And Other Adapters
 */

export function inspectLifecycle(logic: () => void, deps: any[]) {
    // If currentComponent is not set, exit the function or handle accordingly
    if (!currentComponent) {
        return;
    }

    const componentAdapters = adaptersState.get(currentComponent);
    const oldDeps = componentAdapters.adapters[adapterIndex];
    const hasChanged =
        !deps || !oldDeps || deps.some((dep, i) => dep !== oldDeps[i]);

    if (hasChanged) {
        // Run cleanup function if it exists
        const cleanupFn = componentAdapters.cleanup[adapterIndex];
        if (cleanupFn) cleanupFn();

        // Run the effect and save the cleanup function
        const cleanup = logic();
        componentAdapters.cleanup[adapterIndex] = cleanup;
    }

    componentAdapters.adapters[adapterIndex] = deps;
    adapterIndex++;
}

/**
 * State Management and Other Adapters
 */
const jarStateMap = new Map();

export function createJar<T>(initialValue: T) {
    const componentName = currentComponent;
    const index = adapterIndex++;

    if (!jarStateMap.has(componentName)) {
        jarStateMap.set(componentName, { state: [], setters: [] });
    }

    const stateEntry = jarStateMap.get(componentName);

    // Initialize state and setter if this is the first render
    if (index === stateEntry.state.length) {
        const setter = newValue => {
            stateEntry.state[index] = newValue;
            rerenderComponent(componentName);
        };
        stateEntry.state.push(initialValue);
        stateEntry.setters.push(setter);
    }

    return [stateEntry.state[index], stateEntry.setters[index]];
}

const globalJars = new Map();

export function createGlobalJar(key, initialValue) {
    if (globalJars.has(key)) {
        return [globalJars.get(key).value, globalJars.get(key).setter];
    }

    let value = initialValue;
    const subscribers = new Set();

    const setter = newValue => {
        if (value !== newValue) {
            value = newValue;

            globalJars.set(key, { value, subscribers, setter });

            subscribers.forEach(subscriber => {
                // Assuming subscriber is the component name
                rerenderComponent(subscriber);
            });
        }
    };

    globalJars.set(key, { value, subscribers, setter });
    return [value, setter];
}

export function getGlobalJar(key) {
    const jar = globalJars.get(key);
    if (!jar) {
        throw new Error(`Global jar with key '${key}' does not exist.`);
    }

    // Subscribe the current component to the jar
    jar.subscribers.add(currentComponent);

    const unsubscribe = () => {
        jar.subscribers.delete(currentComponent);
    };

    return [jar.value, jar.setter, unsubscribe];
}

export function rerenderComponent(componentName) {
    const componentInfo = adaptersState.get(componentName);
    if (!componentInfo || !componentInfo.isMounted) {
        return;
    }

    if (document.body.contains(componentInfo.container)) {
        currentComponent = componentName;
        adapterIndex = 0;

        const content = componentInfo.componentFn(componentInfo.props);

        while (componentInfo.container.firstChild) {
            componentInfo.container.removeChild(
                componentInfo.container.firstChild
            );
        }
        render(content, componentInfo.container);

        currentComponent = null;
    } else {
        componentInfo.isMounted = false;
    }
}
