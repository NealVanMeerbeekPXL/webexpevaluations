const commonUserService = require('../services/commonUserService');

module.exports.getCoursesOfUser = async (req, res, next) => {
  try {
    const status = 200;
    const { id } = req.params;
    const courses = await commonUserService.findCoursesOfUser(id);
    res.status(status).json(courses);
  } catch (err) {
    next(err);
  }
};
