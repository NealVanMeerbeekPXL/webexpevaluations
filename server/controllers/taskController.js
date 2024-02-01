const taskService = require('../services/taskService');

module.exports.getAllTasks = async (req, res, next) => {
  try {
    const status = 200;
    const tasks = await taskService.findAllTasks();
    res.status(status).json(tasks);
  } catch (err) {
    next(err);
  }
};

module.exports.addTask = async (req, res, next) => {
  try {
    const status = 200;
    const newTask = await taskService.addTask(req.body);
    res.status(status).json(newTask);
  } catch (err) {
    next(err);
  }
};

module.exports.getTasksOfUser = async (req, res, next) => {
  try {
    const status = 200;
    const { id } = req.params;
    const tasks = await taskService.findTasksOfUser(id);
    res.status(status).json(tasks);
  } catch (err) {
    next(err);
  }
};

module.exports.updateCompletedForTaskOfUser = async (req, res, next) => {
  try {
    const status = 200;
    const { id, taskId } = req.params;
    const { completed } = req.body;
    const task = await taskService.updateTaskOfUser(taskId, id, { completed });
    res.status(status).json(task);
  } catch (err) {
    next(err);
  }
};

module.exports.updateUserForTask = async (req, res, next) => {
  try {
    const status = 200;
    const { id } = req.params;
    const { userId } = req.body;
    const task = await taskService.updateUnassignedTask(id, userId);
    res.status(status).json(task);
  } catch (err) {
    next(err);
  }
};
