process.env.NODE_ENV = 'production';

var debug = process.env.NODE_ENV !== 'production', 
	webpack = require('webpack'),
	path = require('path');

module.exports = {
	context: '',
	devtool: debug ? 'inline-sourcemap' : null,
	entry: './client.js',
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel-loader',
				query: {
					presets: ['react', 'es2015', 'stage-0'],
					plugins: ['react-html-attrs', 'transform-decorators-legacy', 'transform-class-properties'],
					}
			},
			{
        test: /\.less$/,
        loader: "style!css!less"
      }
		]
	},
	output: {
		path: __dirname + '/public/',
		filename: 'client.min.js'
	},
	plugins: debug ? [] : [
		new webpack.DefinePlugin({ 'process.env':{ 'NODE_ENV': JSON.stringify('production') } }),
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
	],
};