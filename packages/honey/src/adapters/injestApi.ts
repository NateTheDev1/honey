import axios, { AxiosRequestConfig } from 'axios';
import { getCurrentRenderingComponent } from '../globalState';
import { renderComponent } from '../vdom';

export type InjestOptions = AxiosRequestConfig & {
    /**
     * If true, the state will be cached and be accessible from other components. Defaults to false.
     */
    stateful?: boolean;
};

export const apiInjestStateMap = new Map();

export const apiInjestRefreshMap = new Map();

/**
 * Injest an API endpoint and return the data, error, and loading state.
 * @param apiEndpoint - The endpoint to injest
 * @param method - The HTTP method to use
 * @param options - The options to pass to axios
 * @returns The data, error, and loading state
 */
export const injestApi = (
    apiEndpoint: string,
    method: 'GET' | 'POST' | 'UPDATE' | 'DELETE',
    options: InjestOptions = {}
) => {
    const componentId = getCurrentRenderingComponent();

    if (!componentId) {
        throw new Error('injestApi must be called within a component');
    }

    if (!apiInjestStateMap.has(apiEndpoint)) {
        console.log('injestApi', apiEndpoint);
        apiInjestStateMap.set(apiEndpoint, {
            firstFireComplete: false,
            data: null,
            error: null,
            loading: true
        });
    }

    const refresh = async () => {
        const state = apiInjestStateMap.get(apiEndpoint);

        if (state) {
            state.loading = true;

            try {
                let response = await axios({
                    url: apiEndpoint,
                    method,
                    ...options
                });

                state.data = response.data;
                state.loading = false;
                state.error = null;

                renderComponent(componentId);
            } catch (error) {
                state.error = error;
                state.loading = false;

                renderComponent(componentId);
            }
        }
    };

    if (!apiInjestRefreshMap.has(apiEndpoint)) {
        apiInjestRefreshMap.set(apiEndpoint, refresh);
    }

    if (!apiInjestStateMap.get(apiEndpoint).firstFireComplete) {
        refresh();
        apiInjestStateMap.get(apiEndpoint).firstFireComplete = true;
    }

    return {
        get data() {
            return apiInjestStateMap.get(apiEndpoint)?.data;
        },
        get error() {
            return apiInjestStateMap.get(apiEndpoint)?.error;
        },
        get loading() {
            return apiInjestStateMap.get(apiEndpoint)?.loading;
        },
        refresh
    };
};
