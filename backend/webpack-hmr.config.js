/* eslint-disable @typescript-eslint/no-var-requires */
const nodeExternals = require("webpack-node-externals");
const { RunScriptWebpackPlugin } = require("run-script-webpack-plugin");
const path = require("path");

module.exports = function (options, webpack) {
	return {
		...options,
		entry: ["webpack/hot/poll?100", options.entry],
		externals: [
			nodeExternals({
				allowlist: ["webpack/hot/poll?100"],
			}),
		],
		plugins: [
			...options.plugins,
			new webpack.HotModuleReplacementPlugin(),
			new webpack.WatchIgnorePlugin({
				paths: [
					/\.js$/,
					/\.d\.ts$/,
					path.resolve(__dirname, "archive"),
					/archive/,
					/node_modules/,
				],
			}),
			new RunScriptWebpackPlugin({
				name: options.output.filename,
				autoRestart: false,
			}),
		],
	};
};
