const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  target: 'node',
  module: {
    noParse(content) {
      if (/express\/lib\/view.js/.test(content)) {
        // Express dynamically requires the view engine
        return true;
      }
      return false;
    }
  },
  plugins: [
    // Prevent loading pg-native (in a weird, backwards kind of way!)
    ...[
      new webpack.DefinePlugin({
        'process.env.NODE_PG_FORCE_NATIVE': JSON.stringify('1'),
      }),
      new webpack.NormalModuleReplacementPlugin(
        /pg\/lib\/native\/index.js$/,
        '../client.js'
      ),
    ],
  ],
}
