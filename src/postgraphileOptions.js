exports.options = {
  dynamicJson: true,
  graphiql: false,
  /* If you enable GraphiQL, you must use `absoluteRoutes` and give the routes to the endpoints.:

    absoluteRoutes: true,
    graphqlRoute: '/default/graphql',
    graphiqlRoute: '/default/graphiql',
  */
  cors: true,
  jwtSecret: process.env.JWT_SECRET || String(Math.random()),
};
