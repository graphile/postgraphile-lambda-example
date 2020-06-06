const path = require('path');
const webpack = require('webpack');
const slsw = require('serverless-webpack');
const TerserPlugin = require('terser-webpack-plugin');
const { options: postgraphileOptions } = require('./src/postgraphileOptions.js');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: slsw.lib.entries,
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
    sourceMapFilename: '[file].map'
  },
  target: 'node',
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/postgraphile.cache', to: 'src/postgraphile.cache' },
      ],
    }),
    // Prevent loading pg-native (in a weird, backwards kind of way!)
    ...[
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"',
        'process.env.POSTGRAPHILE_ENV': '"production"',
        'process.env.NODE_PG_FORCE_NATIVE': JSON.stringify('1'),
        ...(postgraphileOptions.graphiql
          ? null
          : {
              'process.env.POSTGRAPHILE_OMIT_ASSETS': '"1"',
            }),
      }),
      new webpack.NormalModuleReplacementPlugin(/pg\/lib\/native\/index\.js$/, '../client.js'),

    ],
    // Omit websocket functionality from postgraphile:
    new webpack.NormalModuleReplacementPlugin(
      /postgraphile\/build\/postgraphile\/http\/subscriptions\.js$/,
      `${__dirname}/src/postgraphile-http-subscriptions.js`
    ),

    // Just in case you install express:
    new webpack.NormalModuleReplacementPlugin(
      /express\/lib\/view\.js$/,
      `${__dirname}/src/express-lib-view.js`
    )
  ],
  node: {
    __dirname: false, // just output `__dirname`
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          // Without this, you may get errors such as
          // `Error: GraphQL conflict for 'e' detected! Multiple versions of graphql exist in your node_modules?`
          mangle: false,
        },
      }),
    ],
  },
};
