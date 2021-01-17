const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = () => {
	return {
		test: /\.(less|css)$/,
		exclude: ['/node_modules/'],
		use: [
			{
				loader: MiniCssExtractPlugin.loader,
				options: {
					// if hmr does not work, this is a forceful method.
					reloadAll: true,
				},
			},
			{
				loader: 'css-loader'
			},
			{
				loader: 'less-loader',
				options: {
					javascriptEnabled: true
				}
			}
		]
	};
};