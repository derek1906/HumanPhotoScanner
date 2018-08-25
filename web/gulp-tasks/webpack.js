const path = require("path");
const webpack = require("webpack");

/**
 * Optimize JS files with webpack.
 */

let config = {
    entry: ["whatwg-fetch", "./src/scripts/index.js"],
    output: {
        filename: "./static/bundle.js",
        path: path.resolve(__dirname, "../dist")
    },
    mode: "production",
    context: path.resolve(__dirname, '../'),
    devtool: 'source-map',
    module: {
        rules: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
                loader: "babel-loader"
            }
        }, {
            test: /\.css$/,
            exclude: /node_modules/,
            use: [{
                loader: "style-loader"
            }, {
                loader: "css-loader",
                options: {
                    modules: true,
                    importLoaders: 1,
                    localIdentName: "[name]_[local]_[hash:base64]",
                    sourceMap: true,
                    minimize: true
                }
            }]
        }]
    }
};

module.exports = {
    task_func: function webpack_build() {
        return new Promise((res, rej) => {
            webpack(config, (err, stats) => {
                if (err) {
                    console.warn("Webpack", err);
                    rej(err);
                } else {
                    res();
                }
            });
        });
    },
    config: config
};