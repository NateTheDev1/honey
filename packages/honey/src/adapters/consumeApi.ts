import axios from 'axios';
import { getCurrentRenderingComponent } from '../globalState';
import { apiInjestRefreshMap, apiInjestStateMap } from './injestApi';
import { renderComponent } from '../vdom';

/**
 * Consume an api
 * @param key - The API endpoint of the injestApi call to consume
 * @returns The data, error, and loading state
 */
export const consumeApi = (key: string) => {
    const componentId = getCurrentRenderingComponent();

    if (!componentId) {
        throw new Error('consumeApi must be called within a component');
    }

    if (!apiInjestStateMap.has(key)) {
        console.log('consumeApi', key);
        throw new Error(
            'consumeApi must be called after injestApi. Make sure injestApi is called before consumeApi'
        );
    }

    return {
        get data() {
            return apiInjestStateMap.get(key)?.data;
        },
        get error() {
            return apiInjestStateMap.get(key)?.error;
        },
        get loading() {
            return apiInjestStateMap.get(key)?.loading;
        },
        refresh: apiInjestRefreshMap.get(key)
    };
};
