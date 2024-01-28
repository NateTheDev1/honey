// start.js
const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');

const appDirectory = process.cwd();

// Import default webpack config from honey-scripts package
const defaultWebpackConfig = require('./webpack.config.js');

// Configure Babel loader with Honey's default Babel presets and plugins
const babelLoaderConfig = {
    test: /\.(js|jsx|ts|tsx)$/,
    exclude: /node_modules/,
    use: {
        loader: 'babel-loader',
        options: {
            presets: ['@babel/preset-env', 'babel-preset-honey'],
            plugins: []
        }
    }
};

// Merge Babel loader into the default webpack module rules
defaultWebpackConfig.module.rules.push(babelLoaderConfig);

// Create a compiler instance with the default configuration
const compiler = Webpack(defaultWebpackConfig);

// Options for the webpack-dev-server
const devServerOptions = {
    static: {
        directory: path.join(appDirectory, 'dist') // Serve content from user's dist directory
    },
    hot: true,
    port: 3000,
    open: true
};

// Create a new webpack-dev-server
const server = new WebpackDevServer(devServerOptions, compiler);

// Start the server
server.startCallback(() => {
    console.log(`Starting server on http://localhost:${devServerOptions.port}`);
});
