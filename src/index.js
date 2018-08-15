const express = require('express');
const awsServerlessExpress = require("aws-serverless-express");
const { postgraphile } = require("postgraphile");
const { options, cachePath } = require("./postgraphileOptions");
const bodyParser = require('body-parser')

const schemas = process.env.DATABASE_SCHEMAS ? process.env.DATABASE_SCHEMAS.split(",") : ['app_public'];
console.log('-=-=-=-=-=-=-=-=-=')
const app = express();
app.use(postgraphile(process.env.DATABASE_URL, schemas, {
  ...options,
  readCache: cachePath,
}));

// @see https://github.com/Yelp/yelp-fusion/issues/278
app.use(/\/((?!graphql).)*/, bodyParser.urlencoded({ extended: true }));
app.use(/\/((?!graphql).)*/, bodyParser.json());

const server = awsServerlessExpress.createServer(app);
exports.handler = (event, context) => awsServerlessExpress.proxy(server, event, context)


// 
