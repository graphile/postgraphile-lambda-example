exports.options = {
  dynamicJson: true,
  graphiql: false,
  jwtSecret: process.env.JWT_SECRET || String(Math.random()),
  jwtPgTypeIdentifier: "forum_example.jwt_token",
};
