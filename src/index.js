const awsServerlessExpress = require('aws-serverless-express');
const { postgraphile } = require('../..');
const { options } = require('./postgraphileOptions');
const combineMiddlewares = require('./combineMiddlewares');

const schemas = process.env.DATABASE_SCHEMAS
  ? process.env.DATABASE_SCHEMAS.split(',')
  : ['app_public'];

const app = combineMiddlewares([
  /*
   * Note that any middlewares you add here *must* call `next`.
   *
   * This is typically useful for augmenting the request before it goes to PostGraphile.
   */
  postgraphile(process.env.DATABASE_URL, schemas, {
    graphqlRoute: '/',
    ...options,
    readCache: `${__dirname}/postgraphile.cache`,
  }),
]);

const binaryMimeTypes = options.graphiql ? ['image/x-icon'] : undefined;
const server = awsServerlessExpress.createServer(app, undefined, binaryMimeTypes);
exports.handler = (event, context) => awsServerlessExpress.proxy(server, event, context);
