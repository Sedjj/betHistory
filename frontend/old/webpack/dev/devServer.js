const isWindows = require('is-windows');
const {devServerProxyConfig} = require('./devServierProxy');
const path = require('path');

const defaultPort = 8080;

const devServerHost = isWindows() ? '127.0.0.1' : '0.0.0.0';

// export const devServerUrl = `http://${devServerHost}:${defaultPort}/`;

module.exports = () => {
    return {
        devServer: {
            static: {
                directory: path.join(__dirname, 'assets'),
                publicPath: '/',
            },
            port: defaultPort,
            historyApiFallback: true,
            headers: {'Access-Control-Allow-Origin': '*'},
            proxy: devServerProxyConfig,
            hot: true,
            host: devServerHost,
            client: {
                overlay: false,
                progress: true,
            },
        },
    };
};
