const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  context: __dirname,
  entry: './public/javascripts/bundle.js',
  output: {
  	path: `${__dirname}/public/dist`,
    filename: 'bundle.min.js'
  },
  module: {
  	rules: [
  		{ 
  			test: /\.(sass|scss)$/, 
  			use: ExtractTextPlugin.extract({
	          fallback: 'style-loader',
	          use: ['css-loader', 'postcss-loader','sass-loader']
	        })
  		}
  	]
  },
  plugins: [
  	new ExtractTextPlugin("style.css"),
  	new webpack.optimize.OccurrenceOrderPlugin(),
  	new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false })
  ]
};