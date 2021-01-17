const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

const tsx = require("./webpack/tsx");
const file = require("./webpack/file");

const devServer = require("./webpack/dev/devServer");
const lessDev = require("./webpack/dev/less");

const PATHS = {
  root: path.resolve(__dirname, "src"),
  tsconfig: path.resolve(__dirname, "tsconfig.json"),
  index: path.resolve(__dirname, "src/index.tsx"),
};

const common = {
  context: PATHS.root,
  mode: "development",
  devtool: "eval-cheap-module-source-map",
  output: {
    filename: "[name].bundle.js",
    pathinfo: true,
    publicPath: "/",
  },
  entry: {
    main: [/*path.resolve(__dirname, "webpack/polyfill"),*/ PATHS.index],
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({
      filename: "index.html", //Name of file in ./build/
      template: path.resolve(__dirname, "src/index.html"), //Name of template in ./src
      hash: true,
      favicon: path.resolve(__dirname, "favicon.ico"),
    }),
  ],
  resolve: {
    extensions: [" ", ".ts", ".tsx", ".js", ".json", ".less", ".css", ".svg"],
    modules: [PATHS.root, "node_modules"],
  },
  watchOptions: {
    ignored: /node_modules/,
  },
};

module.exports = () => {
  const devServerConfig = devServer();
  const lessDevRules = lessDev();
  const fileRules = file();
  const tsxRules = tsx();
  return {
    ...common,
    ...devServerConfig,
    module: {
      rules: [lessDevRules, fileRules, ...tsxRules],
    },
  };
};
