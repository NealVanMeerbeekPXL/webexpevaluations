const dotenv = require('dotenv');

dotenv.config();
const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
const { ObjectId } = mongoose.Types;
const { MongoClient } = require('mongodb');

const Course = require('../../models/courseModel');
const { validCoursesWithValidEvaluations, invalidCourses } = require('./data');

let client = null;

beforeAll(async () => {
  const DATABASE_CONNECTION = process.env.DATABASE_CONNECTION_TEST;
  const { DB_CONNECTION_OPTIONS } = process.env;
  await mongoose.connect(DATABASE_CONNECTION, DB_CONNECTION_OPTIONS);
  client = new MongoClient(DATABASE_CONNECTION);
  await client.connect();
});

afterAll(async () => {
  await mongoose.connection.close();
  await client.close();
});

beforeEach(async () => {
  await client.db().collection('courses').deleteMany({});
});

describe('courseModel', () => {
  describe('save', () => {
    test.each(invalidCourses)(
      'given invalid course it should throw a ValidationError',
      async (invalidCourse) => {
        await expect(async () => {
          const course = new Course(invalidCourse);
          await course.save();
        }).rejects.toThrow(mongoose.Error.ValidationError);
      },
    );

    test.each(validCoursesWithValidEvaluations)(
      'given a valid course it should save this course',
      async (validCourse) => {
        const course = new Course(validCourse);
        const courseDocument = await course.save();
        expect(course._id).toBeInstanceOf(ObjectId);
        expect(course.name).toBe(validCourse.name.trim());
        expect(course.teacherId).toBe(validCourse.teacherId);
        expect(course.studentIds).toEqual(validCourse.studentIds);
        expect(courseDocument.evaluations).toMatchObject(validCourse.evaluations);
      },
    );
  });
});
