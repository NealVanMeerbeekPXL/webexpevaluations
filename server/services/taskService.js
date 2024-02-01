const mongoose = require('mongoose');
const {
  NotFoundError,
  ValidationError,
  AuthorisationError,
} = require('../middleware/error');
const Task = require('../models/taskModel');

const { ObjectId } = mongoose.Types;

async function findAllTasks() {
  return Task.find({}).populate('userId', 'username');
}

async function addTask(newTaskData) {
  const task = new Task(newTaskData);
  const validationError = task.validateSync();
  if (validationError) {
    throw new ValidationError(`Validation failed with message ${validationError.message}`);
  }
  return task.save({ validateBeforeSave: false });
}

async function findTasksOfUser(userId) {
  if (typeof userId !== 'string' || !ObjectId.isValid(userId)) {
    throw new ValidationError(`id ${userId} is invalid`);
  }
  return Task.find({ userId });
}

async function updateTaskOfUser(taskId, userId, { completed, todo, userId: newUserId }) {
  if (typeof userId !== 'string' || !ObjectId.isValid(userId)) {
    throw new ValidationError(`id ${userId} is invalid`);
  }
  if (typeof taskId !== 'string' || !ObjectId.isValid(taskId)) {
    throw new ValidationError(`id ${taskId} is invalid`);
  }

  const task = await Task.findById(taskId);
  if (task == null) {
    throw new NotFoundError(`Task ${taskId} not found`);
  }

  if (task.userId.toString() !== userId.toString()) {
    throw new AuthorisationError(`User ${userId} isn't the owner of task ${taskId}`);
  }

  if (completed !== undefined) {
    task.completed = completed;
  }
  if (todo !== undefined) {
    task.todo = todo;
  }
  if (newUserId !== undefined) {
    throw new AuthorisationError(`User ${userId} is not allowed to reassign userId of a task`);
  }
  const validationError = task.validateSync();
  if (validationError) {
    throw new ValidationError(`Validation failed with message ${validationError.message}`);
  }
  return task.save({ validateBeforeSave: false });
}

async function updateUnassignedTask(taskId, userId) {
  if (typeof taskId !== 'string' || !ObjectId.isValid(taskId)) {
    throw new ValidationError(`id ${taskId} is invalid`);
  }
  if (typeof userId !== 'string' || !ObjectId.isValid(userId)) {
    throw new ValidationError(`id ${userId} is invalid`);
  }

  const task = await Task.findById(taskId);
  if (task == null) {
    throw new NotFoundError(`Task ${taskId} not found`);
  }

  task.userId = userId;

  const validationError = task.validateSync();
  if (validationError) {
    throw new ValidationError(`Validation failed with message ${validationError.message}`);
  }
  return task.save({ validateBeforeSave: false });
}

module.exports = {
  findAllTasks, findTasksOfUser, updateTaskOfUser, updateUnassignedTask, addTask,
};
