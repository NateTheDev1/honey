import { HoneyTree, render } from './renderer';

let routerConfig: HoneyRouterConfig | null = null;
let routerFirstRender = true;

export const getRouterConfig = () => routerConfig;

/**
 * A HoneyTree is a virtual node. Used to better understand the structure of the property for the developer.
 */
type HoneyRouterConfig = {
    /**
     * The paths to render
     */
    paths: {
        path: string;
        component: HoneyTree;
    }[];
    /**
     * The component to render when an error occurs
     */
    errorComponent: HoneyTree;
    /**
     * The component to render when no route is found
     */
    fallbackComponent: HoneyTree;
};

/**
 * Renders a Honey application with a router configuration
 * @param router - The router configuration to render the application with
 */
export const renderRouter = (router: HoneyRouterConfig) => {
    if (!routerConfig) {
        routerConfig = router;
    }

    if (routerFirstRender) {
        routerFirstRender = false;
        // Listen for events
        window.onpopstate = () => {
            renderRouter(router);
        };
    }

    const path = window.location.pathname;

    const route = router.paths.find(route => route.path === path);

    if (route) {
        render(route.component, document.body);
    } else {
        render(router.fallbackComponent, document.body);
    }
};

/**
 * Navigates to a new path in the Honey application
 * @param path - The path to navigate to
 */
export const navigate = (path: string) => {
    if (!routerConfig) {
        throw new Error('Router not initialized');
    }

    window.history.pushState({}, '', path);
    renderRouter(routerConfig);
};
