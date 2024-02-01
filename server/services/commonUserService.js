const mongoose = require('mongoose');
const { ValidationError } = require('../middleware/error');
const Course = require('../models/courseModel');

const { ObjectId } = mongoose.Types;

async function findCoursesOfUser(id) {
  if (typeof id !== 'string' || !ObjectId.isValid(id)) {
    throw new ValidationError(`id ${id} is invalid`);
  }
  return Course.find({ userId: id });//.select(['_id', 'name']);
}

module.exports = { findCoursesOfUser };
