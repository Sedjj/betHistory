module.exports = () => {
    return {
        arrayFilterEmpty: (array) => array.filter((x) => !!x),
        pathRewrite: (localUrl, remoteUrl) => (path) =>
            path.replace(
                new RegExp(localUrl.replace('/', '\\/'), 'g'),
                remoteUrl,
            ),
    };
};
