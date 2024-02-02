const express = require('express');

const router = express.Router();
const teacherController = require('../controllers/teacherController');
const commonUserController = require('../controllers/commonUserController');
const { authenticate, authorize } = require('../middleware/authentication');

router.get(
  '/:id/courses',
  authenticate,
  authorize({ role: 'teacher' }),
  commonUserController.getCoursesOfUser,
);

router.get(
  '/:userId/courses/:courseId/students',
  authenticate,
  authorize({ role: 'teacher' }),
  teacherController.getStudentsOfCourse,
);

router.post(
  '/:userId/courses/:courseId/students/:studentId/evaluations',
  authenticate,
  authorize({ role: 'teacher' }),
  teacherController.addEvaluationOfStudent,
);

module.exports = router;
