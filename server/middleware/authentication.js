const jwt = require('jsonwebtoken');
const createError = require('http-errors');

const { JWT_SECRET } = process.env;

module.exports.authenticate = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return next(createError(403, 'A token is required for authentication.'));
    }
    req.decodedPayload = await jwt.verify(token, JWT_SECRET, { algorithm: 'HS256' });
  } catch (err) {
    return next(createError(401, 'Invalid authentication token.'));
  }
  return next();
};

module.exports.authorize = (...permissions) => async (req, res, next) => {
  try {
    const { decodedPayload } = req;
    if (!permissions.some((permission) => decodedPayload.roles.includes(permission.role)
      || (permission.owner && req.params.id !== decodedPayload._id))) {
      return next(createError(401, 'Unauthorized.'));
    }
  } catch (err) {
    return next(createError(401, 'Invalid authentication token.'));
  }
  return next();
};
