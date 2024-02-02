const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
const mockingoose = require('mockingoose');

const { ObjectId } = mongoose.Types;
const User = require('../../models/userModel');

const userService = require('../../services/userService');
const { ValidationError, AuthenticationError } = require('../../middleware/error');

const invalidIds = [[''], ['12'],
  ['61a9079ed842a2429ae53d8'],
  ['429ae53d844'],
];

beforeEach(async () => {
  mockingoose.resetAll();
  jest.clearAllMocks();
});

describe('userService', () => {
  describe('findUserByCredentials', () => {
    it(
      "should throw an authentication-error when the user does'nt exist",
      () => {
        expect(async () => {
          mockingoose(User).toReturn(1, 'countDocuments');
          await userService.findUserByCredentials('username', 'password');
        }).rejects.toThrow(AuthenticationError);
      },
    );

    it(
      'should throw an authentication-error when the password is wrong',
      () => {
        expect(async () => {
          jest.spyOn(User, 'countDocuments')
            .mockImplementation(() => Promise.resolve(1));
          jest.spyOn(User, 'findOneByCredentials')
            .mockImplementation(() => Promise.resolve(null));
          await userService.findUserByCredentials('username', 'password');
        }).rejects.toThrow(AuthenticationError);
      },
    );

    it(
      'given the credentials of an existing user it should return the User',
      async () => {
        const user = new User({ username: 'username', password: 'password' });
        jest.spyOn(User, 'findOneByCredentials')
          .mockImplementation(() => Promise.resolve(user));
        jest.spyOn(User, 'countDocuments')
          .mockImplementation(() => Promise.resolve(1));
        const result = await userService.findUserByCredentials('username', 'password');
        expect(result).toBeInstanceOf(User);
        expect(result._id.toString()).toBe(user._id.toString());
      },
    );
  });

  describe('findByID', () => {
    test.each(invalidIds)(
      'given invalid credentials it should throw a ValidationError',
      async (id) => {
        await expect(async () => {
          await userService.findById(id);
        }).rejects.toThrow(ValidationError);
      },
    );

    it(
      'should return the null if the user does not exist???',
      async () => {
        mockingoose(User).toReturn(null, 'findOne');
        const result = await userService.findById(new ObjectId().toString());
        expect(result).toBe(null);
      },
    );

    it(
      'should return the user if the user exists an existing user',
      async () => {
        const user = new User({ username: 'username', password: 'password' });
        mockingoose(User).toReturn(user, 'findOne');
        const result = await userService.findById(user._id.toString());
        expect(result).toBeInstanceOf(User);
        expect(result._id.toString()).toBe(user._id.toString());
      },
    );
  });
});
