const dotenv = require('dotenv');

dotenv.config();

const DATABASE_CONNECTION = process.env.DATABASE_CONNECTION_TEST;
const CORS_OPTIONS = JSON.parse(process.env.CORS_OPTIONS);

const { MongoClient } = require('mongodb');
const request = require('supertest');
const mongoose = require('mongoose');
const loadExpress = require('../../loaders/express');
const connectMongoose = require('../../loaders/database');

let client = null;
let app = null;

const {
  students,
  studentsIncludingPasswords,
  teachers,
  teachersIncludingPasswords,
  courses,
} = require('./data');

beforeAll(async () => {
  connectMongoose(DATABASE_CONNECTION);
  app = loadExpress(CORS_OPTIONS);

  client = new MongoClient(DATABASE_CONNECTION);
  await client.connect();
});

afterAll(async () => {
  await mongoose.connection.close();
  await client.close();
});

beforeEach(async () => {
  const database = client.db();
  await database.collection('users').drop();
  await database.collection('courses').drop();
  await database.collection('users').insertMany(students);
  await database.collection('users').insertMany(teachers);
  await database.collection('courses').insertMany(courses);
});

describe('app', () => {
  describe('post /user/login', () => {
    it(
      'should return statuscode 401 if username and password are not provided',
      async () => {
        await request(app)
          .post('/user/login')
          .expect(401);
      },
    );

    it(
      'should return statuscode 401 if wrong password is provided',
      async () => {
        const { username } = studentsIncludingPasswords[0];
        await request(app)
          .post('/user/login')
          .send({ username, password: 'wrongpassword1' })
          .expect(401);
      },
    );

    it(
      'should return message 200 if username and password are correct',
      async () => {
        const { username } = studentsIncludingPasswords[0];
        const { password } = studentsIncludingPasswords[0];
        await request(app)
          .post('/user/login')
          .send({ username, password })
          .expect(200);
      },
    );

    it(
      'should contain user and token if username and password are correct',
      async () => {
        const { username } = studentsIncludingPasswords[0];
        const { password } = studentsIncludingPasswords[0];

        const response = await request(app)
          .post('/user/login')
          .send({ username, password })
          .expect(200);
        const cookie = response.headers['set-cookie'].pop().split(';')[0];
        expect(cookie).toMatch(/^token=/);
        const token = cookie.substring(6);
        const { user } = response.body;
        expect(user).toBeDefined();
        expect(token).toBeDefined();
        expect(user.username).toEqual(username);
      },
    );
  });

  describe('post /user/logout', () => {
    it('should clear the token cookie and return status 200', async () => {
      const res = await request(app)
        .post('/user/logout')
        .expect(200);

      expect(res.headers['set-cookie']).toEqual(
        expect.arrayContaining([expect.stringMatching(/^token=;/)]),
      );
    });
  });

  describe('get /teacher/:id/courses', () => {
    it(
      'should return message 403 if no token is provided',
      async () => {
        const id = String(teachers[0]._id);
        await request(app)
          .get(`/teacher/${id}/courses`)
          .expect(403);
      },
    );

    it(
      'should return message 403 if correct :id is provided but no token',
      async () => {
        const id = String(teachers[0]._id);
        await request(app)
          .get(`/teacher/${id}/courses`)
          .expect(403);
      },
    );

    it(
      'should return message 200 if correct :id and correct token is provided',
      async () => {
        const { username } = teachersIncludingPasswords[0];
        const { password } = teachersIncludingPasswords[0];

        const response = await request(app)
          .post('/user/login')
          .send({ username, password })
          .expect(200);
        const { user } = response.body;
        const cookie = response.headers['set-cookie'].pop().split(';')[0];
        expect(cookie).toMatch(/^token=/);
        const token = cookie.substring(6);
        const id = String(user._id);
        await request(app)
          .get(`/teacher/${id}/courses`)
          .set('Cookie', [`token=${token}`])
          .expect(200);
      },
    );
  });

  describe('get /teacher/:userId/courses/:courseId/students', () => {
    it(
      'should return message 403 if no token is provided',
      async () => {
        const userId = String(teachers[0]._id);
        const courseId = String(courses[0]._id);
        await request(app)
          .get(`/teacher/${userId}/courses/${courseId}/students`)
          .expect(403);
      },
    );

    it(
      'should return message 403 if correct :userId and correct :courseId is provided but no token',
      async () => {
        const userId = String(teachers[0]._id);
        const courseId = String(courses[0]._id);
        await request(app)
          .get(`/teacher/${userId}/courses/${courseId}/students`)
          .expect(403);
      },
    );

    it(
      'should return message 200 if correct :userId, correct :courseId and correct token is provided',
      async () => {
        const { username } = teachersIncludingPasswords[0];
        const { password } = teachersIncludingPasswords[0];

        const response = await request(app)
          .post('/user/login')
          .send({ username, password })
          .expect(200);
        const { user } = response.body;
        const cookie = response.headers['set-cookie'].pop().split(';')[0];
        expect(cookie).toMatch(/^token=/);
        const token = cookie.substring(6);
        const userId = String(user._id);
        const courseId = String(courses[0]._id);
        await request(app)
          .get(`/teacher/${userId}/courses/${courseId}/students`)
          .set('Cookie', [`token=${token}`])
          .expect(200);
      },
    );
  });

  describe('post /teacher/:userId/courses/:courseId/students/:studentId/evaluations', () => {
    it(
      'should return message 403 if no token is provided',
      async () => {
        const userId = String(teachers[0]._id);
        const courseId = String(courses[0]._id);
        const studentId = String(students[0]._id);
        await request(app)
          .post(`/teacher/${userId}/courses/${courseId}/students/${studentId}/evaluations`)
          .expect(403);
      },
    );

    it(
      'should return message 403 if correct :userId, correct :courseId and correct :studentId is provided but no token',
      async () => {
        const userId = String(teachers[0]._id);
        const courseId = String(courses[0]._id);
        const studentId = String(students[0]._id);
        await request(app)
          .post(`/teacher/${userId}/courses/${courseId}/students/${studentId}/evaluations`)
          .expect(403);
      },
    );

    it(
      'should return message 201 if correct :userId, correct :courseId, correct :studentId and correct token is provided',
      async () => {
        const { username } = teachersIncludingPasswords[0];
        const { password } = teachersIncludingPasswords[0];

        const response = await request(app)
          .post('/user/login')
          .send({ username, password })
          .expect(200);
        const { user } = response.body;
        const cookie = response.headers['set-cookie'].pop().split(';')[0];
        expect(cookie).toMatch(/^token=/);
        const token = cookie.substring(6);
        const userId = String(user._id);
        const courseId = String(courses[0]._id);
        const studentId = String(students[0]._id);
        await request(app)
          .post(`/teacher/${userId}/courses/${courseId}/students/${studentId}/evaluations`)
          .send({ result: 8, weight: 3 })
          .set('Cookie', [`token=${token}`])
          .expect(201);
      },
    );

    it(
      'should return message 201 if correct :userId, correct :courseId, correct :studentId, correct token and lowerBound and upperBound are provided',
      async () => {
        const { username } = teachersIncludingPasswords[0];
        const { password } = teachersIncludingPasswords[0];

        const response = await request(app)
          .post('/user/login')
          .send({ username, password })
          .expect(200);
        const { user } = response.body;
        const cookie = response.headers['set-cookie'].pop().split(';')[0];
        expect(cookie).toMatch(/^token=/);
        const token = cookie.substring(6);
        const userId = String(user._id);
        const courseId = String(courses[0]._id);
        const studentId = String(students[0]._id);
        await request(app)
          .post(`/teacher/${userId}/courses/${courseId}/students/${studentId}/evaluations?score_lowerbound=70&score_upperbound=80`)
          .send({ result: 8, weight: 3 })
          .set('Cookie', [`token=${token}`])
          .expect(201);
      },
    );
  });

  describe('get /student/:id/courses', () => {
    it(
      'should return message 403 if no token is provided',
      async () => {
        const id = String(students[0]._id);
        await request(app)
          .get(`/student/${id}/courses`)
          .expect(403);
      },
    );

    it(
      'should return message 403 if correct :id is provided but no token',
      async () => {
        const id = String(students[0]._id);
        await request(app)
          .get(`/student/${id}/courses`)
          .expect(403);
      },
    );

    it(
      'should return message 200 if correct :id and correct token is provided',
      async () => {
        const { username } = studentsIncludingPasswords[0];
        const { password } = studentsIncludingPasswords[0];

        const response = await request(app)
          .post('/user/login')
          .send({ username, password })
          .expect(200);
        const { user } = response.body;
        const cookie = response.headers['set-cookie'].pop().split(';')[0];
        expect(cookie).toMatch(/^token=/);
        const token = cookie.substring(6);
        const id = String(user._id);
        await request(app)
          .get(`/student/${id}/courses`)
          .set('Cookie', [`token=${token}`])
          .expect(200);
      },
    );
  });

  describe('get /student/:id/courses/:courseId/evaluations', () => {
    it(
      'should return message 403 if no token is provided',
      async () => {
        const id = String(students[0]._id);
        const courseId = String(courses[0]._id);
        await request(app)
          .get(`/student/${id}/courses/${courseId}/evaluations`)
          .expect(403);
      },
    );

    it(
      'should return message 403 if correct :id and correct :courseId is provided but no token',
      async () => {
        const id = String(students[0]._id);
        const courseId = String(courses[0]._id);
        await request(app)
          .get(`/student/${id}/courses/${courseId}/evaluations`)
          .expect(403);
      },
    );

    it(
      'should return message 200 if correct :id, correct :courseId and correct token is provided',
      async () => {
        const { username } = studentsIncludingPasswords[0];
        const { password } = studentsIncludingPasswords[0];

        const response = await request(app)
          .post('/user/login')
          .send({ username, password })
          .expect(200);
        const { user } = response.body;
        const cookie = response.headers['set-cookie'].pop().split(';')[0];
        expect(cookie).toMatch(/^token=/);
        const token = cookie.substring(6);
        const id = String(user._id);
        const courseId = String(courses[0]._id);
        await request(app)
          .get(`/student/${id}/courses/${courseId}/evaluations`)
          .set('Cookie', [`token=${token}`])
          .expect(200);
      },
    );
  });
});
