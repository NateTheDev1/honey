import { ConfigAPI } from '@babel/core';

export default function (api: ConfigAPI) {
    api.cache.forever();

    const presets: string[] = ['@babel/preset-typescript'];
    const plugins: string[] = [
        '@babel/plugin-syntax-jsx',
        'babel-plugin-transform-honey-jsx'
    ];

    return { presets, plugins };
}
