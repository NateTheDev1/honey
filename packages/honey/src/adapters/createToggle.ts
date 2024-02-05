import { getCurrentRenderingComponent } from '../globalState';
import { renderComponent } from '../vdom';

const toggleStateMap = new Map();

/**
 * Creates a toggle object that encapsulates boolean state management within a functional component.
 * @param initialValue - The initial boolean value of the toggle state.
 * @returns An object with a `value` getter, a `toggle` method to switch the state, and a `set` method to explicitly set the state.
 */
export const createToggle = (initialValue: boolean) => {
    const componentId = getCurrentRenderingComponent();

    if (!componentId) {
        throw new Error(
            'createToggle must be used within a functional component.'
        );
    }

    // Initialize toggle state if it doesn't exist
    if (!toggleStateMap.has(componentId)) {
        toggleStateMap.set(componentId, { value: !!initialValue });
    }

    const setToggle = newValue => {
        const state = toggleStateMap.get(componentId);
        if (state) {
            state.value = !!newValue; // Ensure the value is always boolean
            renderComponent(componentId); // Re-render the component
        } else {
            console.error('Toggle state not found for component:', componentId);
        }
    };

    const toggleValue = () => {
        const state = toggleStateMap.get(componentId);
        if (state) {
            state.value = !state.value; // Toggle the current state value
            renderComponent(componentId); // Re-render the component
        } else {
            console.error('Toggle state not found for component:', componentId);
        }
    };

    return {
        get value() {
            return toggleStateMap.get(componentId)?.value;
        },
        set: setToggle,
        toggle: toggleValue
    };
};
