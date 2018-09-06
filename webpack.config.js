const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: '',
    libraryTarget: 'commonjs',
  },
  mode: 'production',
  target: 'node',
  plugins: [
    // Prevent loading pg-native (in a weird, backwards kind of way!)
    ...[
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"',
        'process.env.POSTGRAPHILE_ENV': '"production"',
        'process.env.NODE_PG_FORCE_NATIVE': JSON.stringify('1'),
      }),
      new webpack.NormalModuleReplacementPlugin(/pg\/lib\/native\/index\.js$/, '../client.js'),
      new webpack.NormalModuleReplacementPlugin(
        /express\/lib\/view\.js$/,
        `${__dirname}/src/express-lib-view.js`,
      ),
    ],
  ],
  node: {
    __dirname: false, // just output `__dirname`
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          // without this, you may get errors such as
          // `Error: GraphQL conflict for 'e' detected! Multiple versions of graphql exist in your node_modules?`
          mangle: false,
        },
      }),
    ],
  },
};
