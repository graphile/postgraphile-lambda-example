const awsServerlessExpress = require("aws-serverless-express");
const { postgraphile } = require("postgraphile");
const { options, cachePath } = require("./postgraphileOptions");

const schemas = process.env.DATABASE_SCHEMAS ? process.env.DATABASE_SCHEMAS.split(",") : ['app_public'];

const app = express();
app.use(postgraphile(process.env.DATABASE_URL, schemas, {
  ...options,
  readCache: cachePath,
}));

const server = awsServerlessExpress.createServer(app);

exports.handler = (event, context) => awsServerlessExpress.proxy(server, event, context)
