const path = require('path');

module.exports = {
	entry: './src/index.tsx',
	module: {
		rules: [
			{
				test: /\.(ts|tsx|js|jsx)?$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							"@babel/preset-env",
							"@babel/preset-react",
							"@babel/preset-typescript"
						]
					}
				}
			},
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			},
		]
	},
	resolve: {
		extensions: [".tsx", ".ts", ".jsx", ".js"],
	},
	output: {
		path: path.resolve(__dirname, "public"),
		filename: "assets/js/index.js",
	},
}