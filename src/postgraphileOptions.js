exports.options = {
  dynamicJson: true,
  cors: true,
  jwtSecret: process.env.JWT_SECRET || String(Math.random()),
  graphiql: false,
  externalUrlBase: '/default',

  /* If you want to enable GraphiQL, you must use `externalUrlBase` so PostGraphile
   * knows where to tell the browser to find the assets.  Doing this is
   * strongly discouraged, you should use an external GraphQL client instead.

    externalUrlBase: '/default',
    graphiql: true,
    enhanceGraphiql: true,
    graphqlRoute: '/',
    graphiqlRoute: '/graphiql',
  */
};
