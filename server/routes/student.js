const express = require('express');

const router = express.Router();
const studentController = require('../controllers/studentController');
const commonUserController = require('../controllers/commonUserController');
const { authenticate, authorize } = require('../middleware/authentication');

router.get(
  '/:id/courses',
  authenticate,
  authorize({ role: 'student' }),
  commonUserController.getCoursesOfUser,
);

router.get(
  '/:id/courses/:courseId/evaluations',
  authenticate,
  authorize({ role: 'student' }),
  studentController.getEvaluationsOfCourse,
);

module.exports = router;
