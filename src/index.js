const awsServerlessExpress = require('aws-serverless-express');
const { postgraphile } = require('postgraphile');
const { options } = require('./postgraphileOptions');
const combineMiddlewares = require('./combineMiddlewares');
const cors = require('cors');

const schemas = process.env.DATABASE_SCHEMAS
  ? process.env.DATABASE_SCHEMAS.split(',')
  : ['app_public'];

const app = combineMiddlewares([
  /*
   * Note that any middlewares you add here *must* call `next`.
   *
   * This is typically useful for augmenting the request before it goes to PostGraphile.
   */
 
  // CORS middleware to permit cross-site API requests. Configure to taste
  cors(),

  // Determines the effective URL we are at if `absoluteRoutes` is set
  (req, res, next) => {
    if (options.absoluteRoutes) {
      try {
        const event = JSON.parse(decodeURIComponent(req.headers['x-apigateway-event']));
        // This contains the `stage`, making it a true absolute URL (which we
        // need for serving assets)
        const realPath = event.requestContext.path;
        req.originalUrl = realPath;
      } catch (e) {
        return next(new Error('Processing event failed'));
      }
    }
    next();
  },
  postgraphile(process.env.DATABASE_URL, schemas, {
    ...options,
    readCache: `${__dirname}/postgraphile.cache`,
  }),
]);

const handler = (req, res) => {
  app(req, res, err => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      res.writeHead(err.status || err.statusCode || 500);
      res.end(err.message);
      return;
    }
    if (!res.finished) {
      if (!res.headersSent) {
        res.writeHead(404);
      }
      res.end(`'${req.url}' not found`);
    }
  });
};

const binaryMimeTypes = options.graphiql ? ['image/x-icon'] : undefined;
const server = awsServerlessExpress.createServer(handler, undefined, binaryMimeTypes);
exports.handler = (event, context) => awsServerlessExpress.proxy(server, event, context);
