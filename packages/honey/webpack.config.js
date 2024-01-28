const path = require('path');

module.exports = {
    entry: './src/index.ts', // Entry point of your library
    output: {
        path: path.resolve(__dirname, 'dist'), // Output directory
        filename: 'honey.js', // Output file name
        library: 'Honey', // Name of the global variable when used in script tags
        libraryTarget: 'umd', // Universal Module Definition
        globalObject: 'this'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx']
    }
};
