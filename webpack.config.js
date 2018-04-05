const nodeExternals = require('webpack-node-externals');
module.exports = {
  context: __dirname,
  entry: ['@babel/polyfill', './index.js'],
  output: {
    path: __dirname,
    filename: 'bundle.js',
    library: '',
    libraryTarget: 'commonjs'
  },
  target: "node",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!(postgraphile|postgraphile-core|graphile-build|graphile-build-pg|graphql-parse-resolve-info))/,
        loader: "babel-loader",
        options: {
          plugins: ["@babel/plugin-proposal-object-rest-spread"],
          presets: [["@babel/env", {
            target: {
              node: "8.10"
            }
          }]]
        }
      }
    ]
  },
  externals: [
    nodeExternals({
      whitelist: [
        'postgraphile',
        'postgraphile-core',
        'graphile-build',
        'graphile-build-pg',
        'graphql-parser-resolve-info',
      ]
    })
  ],
  node: {
    __dirname: false,
  },
  plugins: [],
  optimization: {
    minimizer: []
  },
};
