const mongoose = require('mongoose');
const {
  ValidationError,
  AuthenticationError,
} = require('../middleware/error');

const User = require('../models/userModel');

const { ObjectId } = mongoose.Types;

async function findById(id) {
  if (typeof id !== 'string' || !ObjectId.isValid(id)) {
    throw new ValidationError(`id ${id} is invalid`);
  }
  return User.findById(id);
}

async function findUserByCredentials(username, password) {
  const userExists = await User.countDocuments({ username }) !== 0;
  if (!userExists) {
    throw new AuthenticationError(`${username} not found`);
  }
  const user = await User.findOneByCredentials(username, password);
  if (user == null) {
    throw new AuthenticationError(`${password} incorrect`);
  }
  return user;
}

module.exports = { findById, findUserByCredentials };
