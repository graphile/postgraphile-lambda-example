exports.options = {
  dynamicJson: true,
  graphiql: false,
  /* If you want to enable GraphiQL, you must use `absoluteRoutes` and give the routes
   * to the endpoints. Doing this is strongly discouraged, you should use an external
   * GraphQL client instead.

    absoluteRoutes: true,
    graphqlRoute: '/default',
    graphiqlRoute: '/default/graphiql',
  */
  cors: true,
  jwtSecret: process.env.JWT_SECRET || String(Math.random()),
};
