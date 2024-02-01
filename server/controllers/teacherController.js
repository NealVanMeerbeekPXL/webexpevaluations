const teacherService = require('../services/teacherService');

module.exports.getStudentsOfCourse = async (req, res, next) => {
  try {
    const status = 200;
    const { userId, courseId } = req.params;
    const { score_lowerbound: scoreLowerbound, score_upperbound: scoreUpperbound } = req.query;
    const students = await teacherService
      .findStudentsOfCourse(userId, courseId, scoreLowerbound, scoreUpperbound);
    res.status(status).json(students);
  } catch (err) {
    next(err);
  }
};

module.exports.addEvaluationOfStudent = async (req, res, next) => {
  try {
    const status = 201;
    const { userId, courseId, studentId } = req.params;
    const updatedCourse = await teacherService
      .addEvaluationOfStudent(userId, courseId, studentId, req.body);
    res.status(status).json(updatedCourse);
  } catch (err) {
    next(err);
  }
};
