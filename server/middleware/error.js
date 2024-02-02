const createError = require('http-errors');
const NotFoundError = require('./notFoundError');
const ValidationError = require('./validationError');
const AuthorisationError = require('./authorisationError');
const AuthenticationError = require('./authenticationError');

function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  const message = err.message || 'Something went wrong';
  if (err instanceof NotFoundError) {
    status = 404;
  } else if (err instanceof ValidationError) {
    status = 400;
  } else if (err instanceof AuthenticationError) {
    status = 401;
  } else if (err instanceof AuthorisationError) {
    status = 403;
  }
  res.status(status).json({ error: message });
  next(err);
}

function routeNotFound(req, res, next) {
  if (!req.route) {
    return next(createError(501, 'Route not found'));
  }
  return next();
}

module.exports = {
  errorHandler,
  routeNotFound,
  NotFoundError,
  ValidationError,
  AuthorisationError,
  AuthenticationError,
};
