const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
const mockingoose = require('mockingoose');

const { ObjectId } = mongoose.Types;
const Task = require('../../models/taskModel');
const User = require('../../models/userModel');

const taskService = require('../../services/taskService');
const { NotFoundError, ValidationError, AuthorisationError } = require('../../middleware/error');

const invalidIds = [[''], ['12'],
  ['61a9079ed842a2429ae53d8'],
  ['429ae53d844'],
];

beforeEach(async () => {
  mockingoose.resetAll();
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('taskService', () => {
  describe('findTasksOfUser', () => {
    test.each(invalidIds)(
      'given invalid id it should throw a ValidationError',
      async (id) => {
        await expect(async () => {
          await taskService.findTasksOfUser(id);
        }).rejects.toThrow(ValidationError);
      },
    );

    it(
      'given the id of a user it returns the user',
      async () => {
        const user = new User({ username: 'username', password: 'password' });
        jest.spyOn(Task, 'find')
          .mockImplementation(() => Promise.resolve([]));
        const result = await taskService.findTasksOfUser(user._id.toString());
        expect(Task.find).toHaveBeenCalledWith({ userId: user._id.toString() });
        expect(result).toBeInstanceOf(Array);
      },
    );
  });

  describe('updateCompletedForTaskOfUser', () => {
    test.each(invalidIds)(
      'given invalid taskId it should throw a ValidationError',
      async (id) => {
        await expect(async () => {
          const userId = new ObjectId().toString();
          await taskService.updateTaskOfUser(id, userId, { completed: true });
        }).rejects.toThrow(ValidationError);
      },
    );

    it(
      "throws a NotFoundError when the task does,'t exist",
      () => {
        expect(async () => {
          const userId = new ObjectId().toString();
          const taskId = new ObjectId().toString();
          mockingoose(Task).toReturn(null, 'findOne');
          await taskService.updateTaskOfUser(taskId, userId, { completed: true });
        }).rejects.toThrow(NotFoundError);
      },
    );

    it(
      "throws an AuthorisationError when the task doesn't belong to the user",
      () => {
        expect(async () => {
          const task = new Task({ todo: 'do something', userId: new ObjectId() });
          const taskId = task._id.toString();
          const wrongUserId = new ObjectId().toString();
          mockingoose(Task).toReturn(task, 'findOne');
          await taskService.updateTaskOfUser(taskId, wrongUserId, { completed: true });
        }).rejects.toThrow(AuthorisationError);
      },
    );

    it(
      'throws a ValidationError when the task is invalid',
      () => {
        expect(async () => {
          const task = new Task({ todo: 'do something', completed: true, userId: new ObjectId() });
          const taskId = task._id.toString();
          const userId = task.userId.toString();
          jest.spyOn(Task, 'findOne').mockImplementation(() => Promise.resolve(task));
          jest.spyOn(Task.prototype, 'validateSync').mockImplementation(() => 'oops');
          await taskService.updateTaskOfUser(taskId, userId, { completed: '???' });
        }).rejects.toThrow(ValidationError);
      },
    );

    it(
      'saves when everything is correct',
      async () => {
        const updateTask = { completed: true, todo: 'something new' };
        const task = new Task({ todo: 'do something', completed: true, userId: new ObjectId() });
        const taskId = task._id.toString();
        const userId = task.userId.toString();
        jest.spyOn(Task, 'findOne').mockImplementation(() => Promise.resolve(task));
        jest.spyOn(Task.prototype, 'validateSync').mockImplementation(() => null);
        jest.spyOn(Task.prototype, 'save').mockImplementation(() => Promise.resolve(new Task(updateTask)));
        const result = await taskService
          .updateTaskOfUser(taskId, userId, { completed: task.completed });
        expect(result).toBeInstanceOf(Task);
      },
    );
  });

  describe('updateUnassignedTask', () => {
    test.each(invalidIds)(
      'given invalid taskId it should throw a ValidationError',
      async (id) => {
        await expect(async () => {
          const userId = new ObjectId().toString();
          await taskService.updateUnassignedTask(id, userId);
        }).rejects.toThrow(ValidationError);
      },
    );

    test.each(invalidIds)(
      'given invalid taskId it should throw a ValidationError',
      async (id) => {
        await expect(async () => {
          const taskId = new ObjectId().toString();
          await taskService.updateUnassignedTask(taskId, id);
        }).rejects.toThrow(ValidationError);
      },
    );

    it(
      "throws a NotFoundError when the task doesn't exist",
      () => {
        expect(async () => {
          const userId = new ObjectId().toString();
          const taskId = new ObjectId().toString();
          mockingoose(Task).toReturn(null, 'findOne');
          await taskService.updateUnassignedTask(taskId, userId);
        }).rejects.toThrow(NotFoundError);
      },
    );

    it(
      'saves when everything is correct',
      async () => {
        const task = new Task({ todo: 'do something', completed: false });
        const userId = new ObjectId().toString();
        const assignedTask = task;
        assignedTask.userId = userId;
        const taskId = task._id.toString();
        jest.spyOn(Task, 'findOne').mockImplementation(() => Promise.resolve(task));
        jest.spyOn(Task.prototype, 'validateSync').mockImplementation(() => null);
        jest.spyOn(Task.prototype, 'save').mockImplementation(() => Promise.resolve(new Task(assignedTask)));
        const result = await taskService.updateUnassignedTask(taskId, userId);
        expect(result).toBeInstanceOf(Task);
        expect(result.userId.toString()).toBe(userId);
      },
    );
  });

  describe('addTask', () => {
    it(
      'throws a ValidationError when the task is invalid',
      () => {
        expect(async () => {
          const taskData = { todoo: 'do something', completed: false };
          await taskService.addTask(taskData);
        }).rejects.toThrow(ValidationError);
      },
    );

    it(
      'saves when everything is correct',
      async () => {
        const taskData = { todo: 'do something new' };
        jest.spyOn(Task.prototype, 'validateSync').mockImplementation(() => null);
        jest.spyOn(Task.prototype, 'save').mockImplementation(() => Promise.resolve(new Task(taskData)));
        const result = await taskService.addTask(taskData);
        expect(result).toBeInstanceOf(Task);
        expect(result.todo).toBe(taskData.todo);
      },
    );
  });
});
