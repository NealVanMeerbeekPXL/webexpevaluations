const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

const { JWT_SECRET } = process.env;
const { JWT_EXPIRATION } = process.env;

module.exports.login = async (req, res, next) => {
  try {
    const status = 200;
    const { username } = req.body;
    const { password } = req.body;
    let user = await userService.findUserByCredentials(username, password);
    const token = jwt.sign(
      { _id: user._id, roles: user.roles },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION, algorithm: 'HS256' },
    );
    user = {
      _id: user._id,
      username: user.username,
      roles: user.roles,
    };
    res.cookie(
      'token',
      token,
      {
        httpOnly: true,
        sameSite: 'strict',
        expires: new Date(Date.now() + parseInt(JWT_EXPIRATION, 10)),
      },
    );
    res.status(status).json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports.logout = async (req, res, next) => {
  try {
    const status = 200;
    res.clearCookie('token');
    res.status(status).json({});
  } catch (err) {
    next(err);
  }
};

module.exports.checkLogin = async (req, res, next) => {
  try {
    const status = 200;
    const id = req.decodedPayload._id;
    let user = await userService.findById(id);
    user = {
      _id: user._id,
      username: user.username,
      roles: user.roles,
    };
    res.status(status).json({ user });
  } catch (err) {
    next(err);
  }
};
