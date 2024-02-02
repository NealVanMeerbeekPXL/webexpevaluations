const studentService = require('../services/studentService');

module.exports.getEvaluationsOfCourse = async (req, res, next) => {
  try {
    const status = 200;
    const { id, courseId } = req.params;
    const evaluations = await studentService.findEvaluationsOfCourse(id, courseId);
    res.status(status).json(evaluations);
  } catch (err) {
    next(err);
  }
};
