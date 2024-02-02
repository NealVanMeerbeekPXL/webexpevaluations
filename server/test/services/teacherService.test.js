const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
const mockingoose = require('mockingoose');

const { ObjectId } = mongoose.Types;
const Course = require('../../models/courseModel');
const User = require('../../models/userModel');

const teacherService = require('../../services/teacherService');
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

describe('teacherService', () => {
  describe('findStudentsOfCourse', () => {
    test.each(invalidIds)(
      'given invalid teacherId it should throw a ValidationError',
      async (id) => {
        await expect(async () => {
          await teacherService.findStudentsOfCourse(id, new ObjectId());
        }).rejects.toThrow(ValidationError);
      },
    );

    test.each(invalidIds)(
      'given invalid courseId it should throw a ValidationError',
      async (id) => {
        await expect(async () => {
          await teacherService.findStudentsOfCourse(new ObjectId().toString(), id);
        }).rejects.toThrow(ValidationError);
      },
    );
  });
});
