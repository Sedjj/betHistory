const resolvePath = require('resolve-path');

module.exports = () => {
	return [
		{
			test: /\.(ts|tsx)?$/,
			exclude: ['/node_modules/'],
			loader: 'babel-loader',
			options: {
				babelrc: true,
				extends: resolvePath(process.cwd(), '.babelrc'),
				cacheDirectory: true
			}
		},
		{
			test: /\.(ts|tsx)?$/,
			enforce: 'pre',
			exclude: ['/node_modules/'],
			use: [
				{
					options: {
						eslintPath: require.resolve('eslint'),
						emitError: true,
						failOnWarning: true,
						/*cache: true*/
					},
					loader: 'eslint-loader'
				}
			]
		}
	];
};