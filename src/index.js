const startTimestamp = process.hrtime();
const timestamps = [];
timestamps.push(['start', process.hrtime(startTimestamp)]);
const express = require('express');
timestamps.push(['required express', process.hrtime(startTimestamp)]);
const awsServerlessExpress = require("aws-serverless-express");
timestamps.push(['required aws-serverless-express', process.hrtime(startTimestamp)]);
const { postgraphile } = require("postgraphile");
timestamps.push(['required postgraphile', process.hrtime(startTimestamp)]);
const { options } = require("./postgraphileOptions");
timestamps.push(['required postgraphileOptions', process.hrtime(startTimestamp)]);
const bodyParser = require('body-parser')
timestamps.push(['required body-parser', process.hrtime(startTimestamp)]);

const schemas = process.env.DATABASE_SCHEMAS ? process.env.DATABASE_SCHEMAS.split(",") : ['app_public'];
const app = express();
timestamps.push(['express created', process.hrtime(startTimestamp)]);
app.use(postgraphile(process.env.DATABASE_URL, schemas, {
  ...options,
  readCache: `${__dirname}/postgraphile.cache`,
}));
timestamps.push(['postgraphile mounted', process.hrtime(startTimestamp)]);

// @see https://github.com/Yelp/yelp-fusion/issues/278
app.use(/\/((?!graphql).)*/, bodyParser.urlencoded({ extended: true }));
app.use(/\/((?!graphql).)*/, bodyParser.json());
timestamps.push(['middlewares mounted', process.hrtime(startTimestamp)]);

const binaryMimeTypes = [
  'application/octet-stream',
  'font/eot',
  'font/opentype',
  'font/otf',
  'image/jpeg',
  'image/icon',
  'image/x-icon',
  'image/png',
  'image/svg+xml',
];
const server = awsServerlessExpress.createServer(app, null, binaryMimeTypes);
exports.handler = (event, context) => awsServerlessExpress.proxy(server, event, context)
timestamps.push(['finished', process.hrtime(startTimestamp)]);
for (const [msg, interval] of timestamps) {
  const formattedInterval = (interval[0] * 1000 + interval[1] * 1e-6).toFixed(2);
  console.log(`${formattedInterval}ms: ${msg}`);
}
