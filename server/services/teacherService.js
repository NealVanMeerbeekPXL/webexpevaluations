const mongoose = require('mongoose');
const { ValidationError, NotFoundError } = require('../middleware/error');
const Course = require('../models/courseModel');

const { ObjectId } = mongoose.Types;

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
      .select(['_id', 'studentIds'])
      .populate('studentIds', ['_id', 'username']);
  }
  const lowerBoundNumber = Number.parseInt(scoreLowerbound, 10);
  const upperBoundNumber = Number.parseInt(scoreUpperbound, 10);
  if (scoreLowerbound !== undefined && Number.isNaN(lowerBoundNumber)) {
    throw new ValidationError(`scoreLowerbound ${scoreLowerbound} is invalid`);
  }
  if (scoreUpperbound !== undefined && Number.isNaN(upperBoundNumber)) {
    throw new ValidationError(`scoreUpperbound ${scoreUpperbound} is invalid`);
  }
  const studentsWithGlobalGradesAggregatePipeline = [
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
        students: {
          id: '$student._id',
          username: '$student.username',
          globalResult: {
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
  ];
  if (scoreLowerbound) {
    studentsWithGlobalGradesAggregatePipeline.push({
      $match: {
        'students.globalResult': { $gte: lowerBoundNumber },
      },
    });
  }
  if (scoreUpperbound) {
    studentsWithGlobalGradesAggregatePipeline.push({
      $match: {
        'students.globalResult': { $lte: upperBoundNumber },
      },
    });
  }
  return Course.aggregate(studentsWithGlobalGradesAggregatePipeline);
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
