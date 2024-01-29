import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';

export default function start() {
    const webpackConfig: any = {
        mode: 'development',
        entry: './src/index.tsx',
        output: {
            path: path.resolve(process.cwd(), 'dist'),
            filename: 'bundle.js',
            publicPath: '/'
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
                patterns: [{ from: 'public', to: 'dist' }]
            })
        ],
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            modules: [path.resolve('./node_modules'), 'node_modules']
        },
        devServer: {
            static: [
                path.join(process.cwd(), 'dist'),
                path.join(process.cwd(), 'public')
            ],
            compress: true,
            port: 3000
        }
    };

    const compiler = webpack(webpackConfig);
    const devServerOptions = { ...webpackConfig.devServer };
    const server = new WebpackDevServer(devServerOptions, compiler);

    server.startCallback(() => {
        console.log('Starting server...');
    });
}
