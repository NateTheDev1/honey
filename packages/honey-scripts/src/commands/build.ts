import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import dotenv from 'dotenv';

export default function build() {
    dotenv.config();

    const webpackConfig: any = {
        mode: 'production',
        entry: './src/index.tsx',
        output: {
            path: path.resolve(process.cwd(), 'dist'),
            filename: '[name].[contenthash].js',
            publicPath: './',
            chunkFilename: '[name].[contenthash].js'
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx|ts|tsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: require.resolve('babel-loader'),
                        options: {
                            presets: [
                                require.resolve('@babel/preset-env'),
                                'babel-preset-honey'
                            ]
                        }
                    }
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    type: 'asset/resource'
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './public/index.html'
            }),
            new CopyPlugin({
                patterns: [
                    {
                        from: 'public',
                        to: './',
                        globOptions: {
                            ignore: ['**/*.html'] // Ignore HTML files
                        }
                    }
                ]
            }),
            new ForkTsCheckerWebpackPlugin({
                async: false // This option will fail the build on any type error
            }),
            new webpack.ProvidePlugin({
                honey: ['honey-js-core', 'default']
            }),
            new BundleAnalyzerPlugin(),
            new webpack.DefinePlugin({
                'process.env.HONEY': JSON.stringify(process.env)
            })
        ],
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            modules: [path.resolve('./node_modules'), 'node_modules']
        },
        optimization: {
            splitChunks: {
                chunks: 'all',
                minSize: 20000, // Minimum size, in bytes, for a chunk to be generated.
                maxSize: 0, // Maximum size, in bytes, for a chunk to be generated.
                cacheGroups: {
                    defaultVendors: {
                        test: /[\\/]node_modules[\\/]/,
                        priority: -10,
                        reuseExistingChunk: true
                    },
                    default: {
                        minChunks: 2,
                        priority: -20,
                        reuseExistingChunk: true
                    }
                }
            }
        }
    };

    webpack(webpackConfig, (err, stats) => {
        if (err || !stats) {
            console.error(err);
            return;
        }
        console.log(stats.toString({ colors: true }));
    });
}
