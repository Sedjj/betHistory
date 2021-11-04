module.exports = () => {
    return {
        test: /\.(less|css)$/,
        exclude: ['/node_modules/'],
        use: [
            {
                loader: 'style-loader',
            },
            {
                loader: 'css-loader',
                options: {sourceMap: true},
            },
            {
                loader: 'less-loader',
                options: {
                    javascriptEnabled: true,
                },
            },
        ],
    };
};
