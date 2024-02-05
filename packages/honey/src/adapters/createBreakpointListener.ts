import { getCurrentRenderingComponent } from '../globalState';

const breakpointListenersMap = new Map();

/**
 * Creates a breakpoint listener that can handle multiple breakpoints.
 * @param breakpoints - An object where keys are breakpoint names and values are the corresponding media query strings.
 * @param callback - A callback function that is called with the name of the breakpoint and its match state when any breakpoint changes.
 * @returns A function to unregister all the breakpoint listeners.
 */
export const createBreakpointListener = (
    breakpoints: Record<string, string>,
    callback: (breakpoint: string, match: boolean) => void
) => {
    const componentId = getCurrentRenderingComponent();

    if (!componentId) {
        throw new Error(
            'createBreakpointListener must be used within a component.'
        );
    }

    if (typeof window === 'undefined' || !('matchMedia' in window)) {
        console.error(
            'The matchMedia API is not supported in this environment.'
        );
        return () => {}; // Return a no-op function if matchMedia is not supported
    }

    const listeners: any = Object.keys(breakpoints).reduce(
        (acc, breakpoint) => {
            const query = breakpoints[breakpoint];
            const mediaQueryList = window.matchMedia(query);

            const handleChange = event => {
                callback(breakpoint, event.matches);
            };

            // Add listener
            if (mediaQueryList.addEventListener) {
                mediaQueryList.addEventListener('change', handleChange);
            } else {
                // For older browsers
                mediaQueryList.addListener(handleChange);
            }

            // Call the callback initially with the current state of the media query
            callback(breakpoint, mediaQueryList.matches);

            acc[breakpoint] = { mediaQueryList, handleChange };
            return acc;
        },
        {}
    );

    // Store the listeners with the componentId to allow cleanup later
    breakpointListenersMap.set(componentId, listeners);

    // Return a cleanup function to unregister all the media query listeners
    return () => {
        Object.values(listeners).forEach(
            ({ mediaQueryList, handleChange }: any) => {
                if (mediaQueryList.removeEventListener) {
                    mediaQueryList.removeEventListener('change', handleChange);
                } else {
                    // For older browsers
                    mediaQueryList.removeListener(handleChange);
                }
            }
        );
        breakpointListenersMap.delete(componentId);
    };
};
