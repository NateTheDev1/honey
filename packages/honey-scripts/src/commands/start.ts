import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import dotenv from 'dotenv';

function logWithStyle(message: string, color = 'yellow') {
    const colors: Record<string, string> = {
        reset: '\x1b[0m',
        bright: '\x1b[1m',
        dim: '\x1b[2m',
        underscore: '\x1b[4m',
        blink: '\x1b[5m',
        reverse: '\x1b[7m',
        hidden: '\x1b[8m',

        black: '\x1b[30m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',

        BGBlack: '\x1b[40m',
        BGRed: '\x1b[41m',
        BGGreen: '\x1b[42m',
        BGYellow: '\x1b[43m',
        BGBlue: '\x1b[44m',
        BGMagenta: '\x1b[45m',
        BGCyan: '\x1b[46m',
        BGWhite: '\x1b[47m'
    };

    console.log(`${colors[color]}${message}${colors.reset}`);
}

export default function start(port: string = '3000') {
    dotenv.config();

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
                patterns: [{ from: 'public', to: 'public' }]
            }),
            new ForkTsCheckerWebpackPlugin({
                async: false // This option will fail the build on any type error
            }),
            new webpack.ProvidePlugin({
                honey: ['honey-js-core', 'default']
            }),
            // Env
            new webpack.DefinePlugin({
                'process.env': JSON.stringify(process.env)
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
            port: port,
            historyApiFallback: true
        },
        stats: {
            preset: 'minimal',
            colors: true
        }
    };

    const compiler = webpack(webpackConfig);
    const devServerOptions = { ...webpackConfig.devServer };
    const server = new WebpackDevServer(devServerOptions, compiler);

    server.startCallback(() => {
        logWithStyle('======================================', 'magenta');
        logWithStyle(`Honey Framework: Server Started at ${port}`, 'green');
        logWithStyle('======================================', 'magenta');
    });
}
