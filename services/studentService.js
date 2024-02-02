const mongoose = require('mongoose');
const { ValidationError } = require('../middleware/error');
const Course = require('../models/courseModel');

const { ObjectId } = mongoose.Types;

const findEvaluationsOfCourse = async (studentId, courseId) => {
  if (typeof studentId !== 'string' || !ObjectId.isValid(studentId)) {
    throw new ValidationError(`id ${studentId} is invalid`);
  }
  if (typeof courseId !== 'string' || !ObjectId.isValid(courseId)) {
    throw new ValidationError(`id ${courseId} is invalid`);
  }

  return Course.aggregate([
    {
      $match:
      {
        _id: mongoose.Types.ObjectId(courseId),
        studentIds: mongoose.Types.ObjectId(studentId),
      },
    },
    {
      $project: {
        evaluations: {
          $filter: {
            input: '$evaluations',
            as: 'eval',
            cond: { $eq: ['$$eval.studentId', mongoose.Types.ObjectId(studentId)] },
          },
        },
      },
    },
    { $unwind: '$evaluations' },
    {
      $project: {
        _id: 0,
        date: '$evaluations.date',
        result: '$evaluations.result',
        weight: '$evaluations.weight',
        message: '$evaluations.message',
      },
    },
  ]);
};

module.exports = {
  findEvaluationsOfCourse,
};
