import { createElement } from '../createElement';

/**
 * Delays loading of imported component until rendered.
 * @param importFn
 */
export function delayLoad(importFn) {
    let component = null;
    let promise = null;

    return function LazyComponent(props) {
        if (!component) {
            if (!promise) {
                promise = importFn().then(module => {
                    component = module.default;
                });
            }

            throw promise; // Used for suspense-like handling
        }

        return createElement(component, props);
    };
}
