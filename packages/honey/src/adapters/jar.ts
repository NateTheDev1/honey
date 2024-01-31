import { getCurrentRenderingComponent } from '../globalState';
import { renderComponent } from '../vdom';

const stateMap = new Map();

/**
 * Creates a jar object that encapsulates state management within a functional component.
 * @param initialValue - The initial value of the state.
 * @returns An object with a `value` getter and a `set` setter to access and update the state respectively.
 * @throws {Error} - If `createJar` is not used within a functional component.
 */
export const createJar = initialValue => {
    const componentId = getCurrentRenderingComponent();

    if (!componentId) {
        throw new Error(
            'createJar must be used within a functional component.'
        );
    }

    // Initialize state if it doesn't exist
    if (!stateMap.has(componentId)) {
        stateMap.set(componentId, { value: initialValue });
    }

    const setState = newValue => {
        const state = stateMap.get(componentId);

        if (state) {
            state.value = newValue;

            renderComponent(componentId); // Re-render the component
        } else {
            console.error('State not found for component:', componentId);
        }
    };

    return {
        get value() {
            return stateMap.get(componentId)?.value;
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
