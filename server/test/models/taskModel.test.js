const dotenv = require('dotenv');

dotenv.config();
const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
const { ObjectId } = mongoose.Types;
const Task = require('../../models/taskModel');

const invalidNewTasks = [{ todo: '' }, { todo: '.' }, { todo: 'a.b' }, { todo: 'a.b' },
  { todo: '', completed: true }, { todo: '.', completed: true },
  { todo: 'a.b', completed: true }, { todo: 'a.b', completed: true },
  { todo: 'new todo', completed: 'ok' }, { todo: 'new todo', completed: 1 },
];

const validNewTasks = [{ todo: 'Unusedtodo1', completed: true }, { todo: 'Unusedtodo2', completed: false }];

beforeAll(async () => {
  const DATABASE_CONNECTION = process.env.DATABASE_CONNECTION_TEST;
  const { DB_CONNECTION_OPTIONS } = process.env;
  await mongoose.connect(DATABASE_CONNECTION, DB_CONNECTION_OPTIONS);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('taskModel', () => {
  describe('save', () => {
    test.each(invalidNewTasks)(
      'given invalid task it should throw a ValidationError',
      async (newTask) => {
        expect(async () => {
          const task = new Task({ newTask });
          await task.save();
        }).rejects.toThrow(mongoose.Error.ValidationError);
      },
    );

    test.each(validNewTasks)(
      'given a new Task it should save this task',
      async (newTask) => {
        const task = new Task(newTask);
        await task.save();
        expect(task._id).toBeInstanceOf(ObjectId);
        expect(task.todo).toBe(newTask.todo.trim());
        expect(task.completed).toBe(newTask.completed);
      },
    );
  });
});
