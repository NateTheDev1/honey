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
            if (stateEntry.state[index] !== newValue) {
                stateEntry.state[index] = newValue;
                rerenderComponent(componentName);
            }
        };
        stateEntry.state.push(initialValue);
        stateEntry.setters.push(setter);
    }

    return [stateEntry.state[index], stateEntry.setters[index]];
}

const globalJars = new Map();

export function createGlobalJar(key, initialValue) {
    if (globalJars.has(key)) {
        // If the jar already exists, return the existing value and setter
        const existingJar = globalJars.get(key);
        // Ensure the current component is subscribed for updates
        existingJar.subscribers.add(currentComponent);
        return [existingJar.value, existingJar.setter];
    }

    let value = initialValue;
    const subscribers = new Set();

    const setter = newValue => {
        if (value !== newValue) {
            value = newValue;
            globalJars.set(key, { value, subscribers, setter });

            subscribers.forEach(subscriber => {
                rerenderComponent(subscriber);
            });
        }
    };

    // Subscribe the component that created the jar
    subscribers.add(currentComponent);

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

    const existingNode = findComponentDOMNode(
        componentInfo.container,
        componentName
    );
    if (existingNode) {
        currentComponent = componentName;
        adapterIndex = 0;

        const newContent = componentInfo.componentFn(componentInfo.props);
        const newNode = render(newContent, document.createDocumentFragment());

        if (newNode && existingNode.parentNode) {
            existingNode.parentNode.replaceChild(newNode, existingNode);
        }

        currentComponent = null;
    } else {
        componentInfo.isMounted = false;
    }
}

function findComponentDOMNode(container, componentName) {
    return container.querySelector(
        `[data-honey-component-id="${componentName}"]`
    );
}
