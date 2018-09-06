const awsServerlessExpress = require("aws-serverless-express");
const { postgraphile } = require("../..");
const { options } = require("./postgraphileOptions");

const schemas = process.env.DATABASE_SCHEMAS ? process.env.DATABASE_SCHEMAS.split(",") : ['app_public'];
const app = postgraphile(process.env.DATABASE_URL, schemas, {
  ...options,
  readCache: `${__dirname}/postgraphile.cache`,
});

const binaryMimeTypes = options.graphiql ? [
  'image/x-icon',
] : undefined;
const server = awsServerlessExpress.createServer(app, undefined, binaryMimeTypes);
exports.handler = (event, context) => awsServerlessExpress.proxy(server, event, context)
