exports.options = {
  dynamicJson: true,
  graphiql: false,
  cors: true,
  jwtSecret: process.env.JWT_SECRET || String(Math.random()),
};
