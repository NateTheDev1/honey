// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = process.cwd(); // Get the current directory of the user's project

module.exports = {
    entry: path.resolve(appDirectory, 'src/index.tsx'), // Resolve entry point from user's project
    output: {
        path: path.resolve(appDirectory, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [] // The babelLoaderConfig will be pushed into this array from start.js
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(appDirectory, 'public/index.html') // Resolve HTML template from user's project
        })
    ],
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
    }
    // No need for devServer here, as it's in start.js
};
