const mongoose = require('mongoose');
const { ValidationError, NotFoundError } = require('../middleware/error');
const Course = require('../models/courseModel');

const { ObjectId } = mongoose.Types;

async function getStudentsWithScores(userId, courseId, lowerBound, upperBound) {
  // const students = await Course.find({ teacherId: userId, _id: courseId }).populate('evaluations');

  // return students.map((student) => {
  //   const totalWeightedScore = student.evaluations.reduce((total, evaluation) => {
  //     if (evaluation.result >= 0) {
  //       return total + (evaluation.result * evaluation.weight);
  //     }
  //     return total;
  //   }, 0);

  //   const totalMaxScore = student.evaluations.reduce((total, evaluation) => {
  //     if (evaluation.result >= 0) {
  //       return total + (10 * evaluation.weight);
  //     }
  //     return total;
  //   }, 0);

  //   const percentageScore = (totalWeightedScore / totalMaxScore) * 100 || 0;

  //   const roundedScore = Math.round(percentageScore);

  //   // Filter students based on score range
  //   if ((lowerBound && roundedScore >= lowerBound) || (upperBound && roundedScore <= upperBound)) {
  //     return {
  //       name: student.name,
  //       score: roundedScore,
  //       evaluations: student.evaluations,
  //     };
  //   }

  //   return null;
  // }).filter((student) => student !== null);
  return test(userId, courseId, lowerBound, upperBound);
}

async function findStudentsOfCourse(userId, courseId, scoreLowerbound, scoreUpperbound) {
  if (typeof userId !== 'string' || !ObjectId.isValid(userId)) {
    throw new ValidationError(`id ${userId} is invalid`);
  }
  if (typeof courseId !== 'string' || !ObjectId.isValid(courseId)) {
    throw new ValidationError(`id ${courseId} is invalid`);
  }
  if (scoreLowerbound === undefined && scoreUpperbound === undefined) {
    return Course
      .find({ _id: courseId, teacherId: userId })
      .populate('studentIds', ['_id', 'username']);
  }
  return getStudentsWithScores(userId, courseId, scoreLowerbound, scoreUpperbound);
}

async function test(userId, courseId, scoreLowerbound, scoreUpperbound) {
  return Course.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(courseId),
        teacherId: mongoose.Types.ObjectId(userId),
      },
    },
    { $unwind: '$studentIds' },
    {
      $lookup: {
        from: 'users',
        localField: 'studentIds',
        foreignField: '_id',
        as: 'student',
      },
    },
    { $unwind: '$student' },
    {
      $project: {
        _id: 0,
        courseName: '$name',
        students: {
          username: '$student.username',
          percentage: {
            $round: {
              $cond: [
                { $eq: ['$evaluations', []] },
                0,
                {
                  $multiply: [
                    {
                      $divide: [
                        {
                          $sum: {
                            $map: {
                              input: '$evaluations',
                              as: 'eval',
                              in: {
                                $cond: [
                                  { $eq: ['$$eval.result', -1] },
                                  0,
                                  { $multiply: ['$$eval.result', '$$eval.weight'] },
                                ],
                              },
                            },
                          },
                        },
                        {
                          $sum: {
                            $map: {
                              input: '$evaluations',
                              as: 'eval',
                              in: {
                                $cond: [
                                  { $eq: ['$$eval.result', -1] },
                                  0,
                                  { $multiply: [10, '$$eval.weight'] },
                                ],
                              },
                            },
                          },
                        },
                      ],
                    },
                    100,
                  ],
                },
              ],
            },
          },
        },
      },
    },
  ]);
}

async function addEvaluationOfStudent(userId, courseId, studentId, evaluationData) {
  if (typeof userId !== 'string' || !ObjectId.isValid(userId)) {
    throw new ValidationError(`id ${userId} is invalid`);
  }
  if (typeof courseId !== 'string' || !ObjectId.isValid(courseId)) {
    throw new ValidationError(`id ${courseId} is invalid`);
  }
  if (typeof studentId !== 'string' || !ObjectId.isValid(studentId)) {
    throw new ValidationError(`id ${studentId} is invalid`);
  }
  const course = await Course.findById(courseId);
  if (course === null) {
    throw new NotFoundError(`Course ${courseId} not found`);
  }
  course.evaluations.push({ studentId, courseId, ...evaluationData });
  const validationError = course.validateSync();
  if (validationError) {
    throw new ValidationError(`Validation failed with message ${validationError.message}`);
  }
  return course.save({ validateBeforeSave: false });
}

module.exports = {
  findStudentsOfCourse, addEvaluationOfStudent,
};
