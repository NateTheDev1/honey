import { ConfigAPI } from '@babel/core';

export default function (api: ConfigAPI) {
    api.cache.forever();

    const presets: string[] = [];
    const plugins: string[] = ['babel-plugin-transform-honey-jsx'];

    return { presets, plugins };
}
