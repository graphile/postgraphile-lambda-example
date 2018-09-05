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
  module: {
    noParse(content) {
      if (/express\/lib\/view.js/.test(content)) {
        // Express dynamically requires the view engine
        return true;
      }
      return false;
    },
  },
  plugins: [
    // Prevent loading pg-native (in a weird, backwards kind of way!)
    ...[
      new webpack.DefinePlugin({
        'process.env.NODE_PG_FORCE_NATIVE': JSON.stringify('1'),
      }),
      new webpack.NormalModuleReplacementPlugin(/pg\/lib\/native\/index.js$/, '../client.js'),
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
      })
    ]
  }
};
