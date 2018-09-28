// Basically copied from
// https://github.com/graphile/postgraphile/blob/160670dd91ca7faddf784351b33da2bb9924df39/src/postgraphile/http/createPostGraphileHttpRequestHandler.ts#L210
/*
 * This function will combine many Express middlewares into one middleware.
 * All but the final middleware must be a simple middleware that definitely
 * calls next().
 */
module.exports = function combineMiddlewares(middlewares) {
  return middlewares.reduce(
    (parent, fn) => {
      return (req, res, next) => {
        parent(req, res, error => {
          if (error) {
            return next(error);
          }
          fn(req, res, next);
        });
      };
    },
    (_req, _res, next) => next()
  );
};
