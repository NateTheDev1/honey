import { getCurrentRenderingComponent } from '../globalState';
import { renderComponent } from '../vdom';

const globalStateMap = new Map();

// Store componentID for subscribers
const globalStateMapSubscriberMap = new Map();

/**
 * Creates a hive object that encapsulates global state management.
 * @param key - The key to associate the state with.
 * @param initialValue - The initial value of the state.
 * @returns An object with a `value` getter and a `set` setter to access and update the state respectively.
 */
export const createHive = (key, initialValue) => {
    const componentId = getCurrentRenderingComponent();

    if (!componentId) {
        throw new Error(
            'createHive must be initialized within a functional component.'
        );
    }

    if (!globalStateMap.has(key)) {
        globalStateMap.set(key, { value: initialValue });
    }

    if (!globalStateMapSubscriberMap.has(key)) {
        globalStateMapSubscriberMap.set(key, new Set());
    }

    const subscribers = globalStateMapSubscriberMap.get(key);

    if (subscribers) {
        subscribers.add(componentId);
    }

    const setState = newValue => {
        const state = globalStateMap.get(key);

        if (state) {
            state.value = newValue;
            subscribers.forEach(subscriber => {
                console.log('subscribers', subscriber);
                renderComponent(subscriber); // Re-render the component
            });
        } else {
            console.error('State not found for component:', componentId);
        }
    };

    return {
        get value() {
            return globalStateMap.get(key)?.value;
        },
        /**
         * Sets the state value for a component identified by componentId.
         * If the state exists, it updates the value and triggers a re-render of the component.
         * If the state does not exist, it logs an error message.
         *
         * @param {any} newValue - The new value to set for the state.
         * @returns {void}
         */
        set: setState
    };
};

/**
 * Gets the hive object that encapsulates global state management.
 * @param key - The key to associate the state with.
 * @returns An object with a `value` getter and a `set` setter to access and update the state respectively.
 */
export const getHive = key => {
    const componentId = getCurrentRenderingComponent();

    if (!componentId) {
        throw new Error('getHive must be used within a functional component.');
    }

    // Subscribe if not
    if (!globalStateMapSubscriberMap.has(key)) {
        throw new Error(
            'State not found. getHive must be used after createHive.'
        );
    }

    const subscribers = globalStateMapSubscriberMap.get(key);

    if (subscribers) {
        subscribers.add(componentId);
    }

    const setState = newValue => {
        const state = globalStateMap.get(key);

        if (state) {
            state.value = newValue;

            subscribers.forEach(subscriber => {
                console.log('subscribers', subscriber);
                renderComponent(subscriber); // Re-render the component
            });
        } else {
            console.error('State not found for component:', componentId);
        }
    };

    return {
        get value() {
            return globalStateMap.get(key)?.value;
        },
        /**
         * Sets the state value for a component identified by componentId.
         * If the state exists, it updates the value and triggers a re-render of the component.
         * If the state does not exist, it logs an error message.
         *
         * @param {any} newValue - The new value to set for the state.
         * @returns {void}
         */
        set: setState
    };
};
