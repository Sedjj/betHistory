const resolvePath = require("resolve-path");

module.exports = () => {
  return {
    test: /\.svg$/,
    include: [resolvePath(process.cwd(), "src/assets")],
    exclude: [resolvePath(process.cwd(), "node_modules")],
    use: [
      {
        loader: "babel-loader",
        options: {
          babelrc: true,
          extends: resolvePath(process.cwd(), ".babelrc"),
          cacheDirectory: true,
        },
      },
      {
        loader: "svg-sprite-loader",
        options: {
          runtimeGenerator: require.resolve("./svg-to-icon-generator.js"),
          runtimeOptions: {
            iconModule: resolvePath(process.cwd(), "src/utils/icon.tsx"),
          },
          extract: false,
          runtimeCompat: true,
          esModule: false,
        },
      },
      "svg-fill-loader",
      "svgo-loader",
      "svg-url-loader",
    ],
  };
};
