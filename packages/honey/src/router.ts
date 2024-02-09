import { getRoot, setRoot } from './globalState';
import { HoneyTree, getDevTools, render } from './renderer';

let routerConfig: HoneyRouterConfig | null = null;
let routerFirstRender = true;

export const getRouterConfig = () => routerConfig;

export type HoneyRouteMeta = {
    title?: string;
    description?: string;
    openGraph?: {
        property: string;
        content: string;
    }[];
    lastMod?: string;
};

type HoneyRoute = {
    path: string;
    component: HoneyTree;
    meta?: HoneyRouteMeta;
    lastMod?: string;
};

/**
 * A HoneyTree is a virtual node. Used to better understand the structure of the property for the developer.
 */
type HoneyRouterConfig = {
    /**
     * The paths to render
     */
    paths: HoneyRoute[];
    /**
     * The component to render when an error occurs
     */
    errorComponent: HoneyTree;
    /**
     * The component to render when no route is found
     */
    fallbackComponent: HoneyTree;
};

const seoTagStore = new Map<string, any>();

/**
 * Renders a Honey application with a router configuration
 * @param router - The router configuration to render the application with
 */
export const renderRouter = (
    router: HoneyRouterConfig,
    container: HTMLElement,
    enableDevTools: boolean = false
) => {
    if (!routerConfig) {
        routerConfig = router;
    }

    if (routerFirstRender) {
        routerFirstRender = false;
        // Listen for events
        window.onpopstate = () => {
            renderRouter(router, container, enableDevTools);
        };
    }

    // Routes can be dynamic
    let route: HoneyRoute | null = null;

    for (let i = 0; i < router.paths.length; i++) {
        const path = router.paths[i].path;
        const regex = new RegExp(`^${path.replace(/:\w+/g, '([\\w-]+)')}$`);
        const match = window.location.pathname.match(regex);

        if (match) {
            route = router.paths[i];
            break;
        }
    }

    if (route) {
        if (route.meta) {
            if (route.meta.title) {
                document.title = route.meta.title;
            }

            if (route.meta.description) {
                seoTagStore.set('description', route.meta.description);
            }

            if (route.meta.openGraph) {
                route.meta.openGraph.forEach(tag => {
                    seoTagStore.set(tag.property, tag.content);
                });
            }
        }

        renderTagStore();

        render(route.component, container, enableDevTools);
    } else {
        render(router.fallbackComponent, container, enableDevTools);
    }
};

/**
 * Renders meta and Open Graph tags from a honey router configuration
 */
const renderTagStore = () => {
    seoTagStore.forEach((content, property) => {
        let tag = document.head.querySelector(`meta[property="${property}"]`);

        if (!tag) {
            tag = document.head.querySelector(`meta[name="${property}"]`);
        }

        if (tag) {
            tag.setAttribute('content', content);
            tag.setAttribute('property', property);
            tag.setAttribute('name', property);
        } else {
            const newTag = document.createElement('meta');
            newTag.setAttribute('property', property);
            newTag.setAttribute('name', property);
            newTag.setAttribute('content', content);
            document.head.appendChild(newTag);
        }
    });
};

/**
 * Gets the current route configuration
 * @returns The current route configuration
 */
export const getConfigForPath = () => {
    if (!routerConfig) {
        throw new Error('Router not initialized');
    }

    // Routes can be dynamic
    let route: {
        path: string;
        component: HoneyTree;
    } | null = null;

    for (let i = 0; i < routerConfig.paths.length; i++) {
        const path = routerConfig.paths[i].path;
        const regex = new RegExp(`^${path.replace(/:\w+/g, '([\\w-]+)')}$`);
        const match = window.location.pathname.match(regex);

        if (match) {
            route = routerConfig.paths[i];
            break;
        }
    }

    if (route) {
        return route;
    } else {
        return null;
    }
};

/**
 * Extracts variables from a path
 * @param path - The path to extract variables from
 */
export const extractVariablesFromPath = (path: string) => {
    const variables: { [key: string]: string } = {};

    const route = routerConfig?.paths.find(route => {
        const regex = new RegExp(
            `^${route.path.replace(/:\w+/g, '([\\w-]+)')}$`
        );
        const match = path.match(regex);

        if (match) {
            return route;
        }
    });

    if (route) {
        const pathParts = path.split('/');
        const routeParts = route.path.split('/');

        for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) {
                variables[routeParts[i].replace(':', '')] = pathParts[i];
            }
        }
    }

    return variables;
};

/**
 * Navigates to a new path in the Honey application
 * @param path - The path to navigate to
 */
export const navigate = (path: string | null) => {
    const root = getRoot();

    if (!root) {
        throw new Error('Root not initialized');
    }

    if (!routerConfig) {
        throw new Error('Router not initialized');
    }

    if (!path) {
        window.history.back();
        renderRouter(routerConfig, root, getDevTools());
    } else {
        window.history.pushState({}, '', path);
        renderRouter(routerConfig, root, getDevTools());
    }
};
