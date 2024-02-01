const mongoose = require('mongoose');
const { ValidationError } = require('../middleware/error');
const Evaluation = require('../models/evaluationSchema');

const { ObjectId } = mongoose.Types;

const findEvaluationsOfCourse = async (studentId, courseId) => {
  if (typeof studentId !== 'string' || !ObjectId.isValid(studentId)) {
    throw new ValidationError(`id ${studentId} is invalid`);
  }
  if (typeof courseId !== 'string' || !ObjectId.isValid(courseId)) {
    throw new ValidationError(`id ${courseId} is invalid`);
  }

  return Evaluation.find({ studentId, courseId });
};

module.exports = {
  findEvaluationsOfCourse,
};
