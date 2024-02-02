import axios, { AxiosRequestConfig } from 'axios';
import { getCurrentRenderingComponent } from '../globalState';
import { renderComponent } from '../vdom';

export type InjestOptions = AxiosRequestConfig;

const stateMap = new Map();

export const injestApi = (
    apiEndpoint: string,
    method: 'GET' | 'POST' | 'UPDATE' | 'DELETE',
    options: InjestOptions = {}
) => {
    const componentId = getCurrentRenderingComponent();

    if (!componentId) {
        throw new Error('injestApi must be called within a component');
    }

    if (!stateMap.has(componentId)) {
        stateMap.set(componentId, {
            firstFireComplete: false,
            data: null,
            error: null,
            loading: true
        });
    }

    const refresh = async () => {
        const state = stateMap.get(componentId);

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

    if (!stateMap.get(componentId).firstFireComplete) {
        refresh();
        stateMap.get(componentId).firstFireComplete = true;
    }

    return {
        get data() {
            return stateMap.get(componentId)?.data;
        },
        get error() {
            return stateMap.get(componentId)?.error;
        },
        get loading() {
            return stateMap.get(componentId)?.loading;
        },
        refresh
    };
};
