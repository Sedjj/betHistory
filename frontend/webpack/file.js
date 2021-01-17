const resolvePath = require("resolve-path");

module.exports = () => {
	return {
		test: /\.(jpg|png|gif|ico|woff|woff2|eot|ttf|svg)$/,
		loader: "file-loader",
		exclude: [resolvePath(process.cwd(), "web/assets")],
		options: {
			useRelativePath: false,
			name: "[path][name].[ext]"
		}
	};
};