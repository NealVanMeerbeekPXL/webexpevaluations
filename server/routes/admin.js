const express = require('express');

const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate, authorize } = require('../middleware/authentication');

router.get(
  '/task',
  authenticate,
  authorize({ role: 'admin' }),
  taskController.getAllTasks,
);

router.patch(
  '/task/:id/',
  authenticate,
  authorize({ role: 'admin' }),
  taskController.updateUserForTask,
);

router.post(
  '/task',
  authenticate,
  authorize({ role: 'admin' }),
  taskController.addTask,
);

module.exports = router;
