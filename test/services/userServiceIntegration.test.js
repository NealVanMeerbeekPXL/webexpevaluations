const dotenv = require('dotenv');

dotenv.config();
const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
const { MongoClient } = require('mongodb');
const User = require('../../models/userModel');

const userService = require('../../services/userService');
const { ValidationError } = require('../../middleware/error');

const { users } = require('./data');

let client = null;

beforeAll(async () => {
  const DATABASE_CONNECTION = process.env.DATABASE_CONNECTION_TEST;
  await mongoose.connect(DATABASE_CONNECTION);
  client = new MongoClient(DATABASE_CONNECTION);
  await client.connect();
  await User.init();
});

afterAll(async () => {
  await mongoose.connection.close();
  await client.close();
});

beforeEach(async () => {
  const database = client.db();
  await database.collection('users').drop();
  await database.collection('users').insertMany(users);
});

const validUnusedIds = [
  ['0000004ccf8208cd47d51e62'],
  ['0000004dcf8208cd47d51e63'],
  ['0000004dcf8208cd47d51e64'],
];

const invalidIds = [[''], ['12'],
  ['61a9079ed842a2429ae53d8'],
  ['429ae53d844'],
];

describe('userService', () => {
  describe('findById', () => {
    test.each(validUnusedIds)(
      'given an valid id not associated with a user it should return null',
      async (id) => {
        const result = await userService.findById(id);
        expect(result).toEqual(null);
      },
    );

    test.each(invalidIds)(
      'given a invalid id it should throw a ValidationError',
      async (id) => {
        await expect(async () => {
          await userService.findById(id);
        }).rejects.toThrow(ValidationError);
      },
    );

    test.each(users)(
      'given an existing id it should return the User',
      async (user) => {
        const id = user._id.toString();
        const result = await userService.findById(id);
        expect(result._id.toString()).toEqual(id);
        expect(result).toBeInstanceOf(User);
      },
    );
  });
});
