import { HoneyTree, render } from './renderer';

let routerConfig: any | null = null;
let routerFirstRender = true;

/**
 * A HoneyTree is a virtual node. Used to better understand the structure of the property for the developer.
 */
type HoneyRouterConfig = {
    path: string;
    component: HoneyTree;
}[];

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

    const route = router.find(route => route.path === path);

    if (route) {
        render(route.component, document.body);
    }
};

/**
 * Navigates to a new path in the Honey application
 * @param path - The path to navigate to
 */
export const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    renderRouter(routerConfig);
};
