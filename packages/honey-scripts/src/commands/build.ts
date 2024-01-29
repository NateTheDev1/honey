import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';

export default function build() {
    const webpackConfig: any = {
        mode: 'production',
        entry: './src/index.tsx',
        output: {
            path: path.resolve(process.cwd(), 'dist'),
            filename: 'bundle.js'
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
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './public/index.html'
            })
        ],
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            modules: [path.resolve('./node_modules'), 'node_modules']
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
