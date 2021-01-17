module.exports = () => {
  return {
    devServer: {
      host: "0.0.0.0",
      port: 9000,
      compress: true,
      historyApiFallback: true,
      watchContentBase: true,
      useLocalIp: true,
      watchOptions: {
        aggregateTimeout: 900,
        ignored: ["src/**/*.test.tsx", "node_modules"],
      },
      progress: true,
    },
  };
};
