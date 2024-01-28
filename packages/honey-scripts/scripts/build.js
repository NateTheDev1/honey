const webpack = require('webpack');
const path = require('path');
const fs = require('fs-extra');

// Load the webpack config that we'll use for the production build
const webpackConfig = require('./webpack.config.js');

// Add any production specific webpack configurations here
webpackConfig.mode = 'production';
webpackConfig.devtool = 'source-map'; // or false, if you don't want source maps for production

// Ensure the dist directory is clean before building
const distPath = path.resolve(process.cwd(), 'dist');
fs.emptyDirSync(distPath);

console.log('Building for production...');

// Create a webpack compiler with the configured settings
const compiler = webpack(webpackConfig);

compiler.run((err, stats) => {
    if (err) {
        console.error('Webpack encountered errors:', err);
        process.exit(1); // Exit with a failure code
    }

    // Log the result
    console.log(
        stats.toString({
            colors: true, // Adds colors to the console log
            all: false, // Disable logging everything
            assets: true, // Show assets in the log
            chunks: false, // Don't show chunks
            entrypoints: true, // Show entry points
            errors: true, // Show errors
            errorDetails: true, // Show details for errors
            hash: true, // Show the compilation hash
            modules: false, // Don't show modules
            timings: true, // Show timing information
            version: true, // Show webpack version
            warnings: true // Show warnings
        })
    );

    if (stats.hasErrors()) {
        process.exit(2); // Exit with a failure code
    } else {
        console.log('Production build completed successfully.');
    }
});
