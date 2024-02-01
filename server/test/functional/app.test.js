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
  users, usersIncludingPasswords, tasks, admins, adminsIncludingPasswords,
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
  await database.collection('tasks').drop();
  await database.collection('users').insertMany(users);
  await database.collection('users').insertMany(admins);
  await database.collection('tasks').insertMany(tasks);
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
        const { username } = usersIncludingPasswords[0];
        await request(app)
          .post('/user/login')
          .send({ username, password: 'wrongpassword1' })
          .expect(401);
      },
    );

    it(
      'should return message 200 if username and password are correct',
      async () => {
        const { username } = usersIncludingPasswords[0];
        const { password } = usersIncludingPasswords[0];
        await request(app)
          .post('/user/login')
          .send({ username, password })
          .expect(200);
      },
    );

    it(
      'should contain user and token if username and password are correct',
      async () => {
        const { username } = usersIncludingPasswords[0];
        const { password } = usersIncludingPasswords[0];

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

  describe('get /user/:role ', () => {
    it(
      'should return message 403 if correct :role is provided but no token',
      async () => {
        const role = String(admins[0].roles[0]);
        await request(app)
          .get(`/user/${role}`)
          .expect(403);
      },
    );

    it(
      'should return message 401 if a non-admin user tries to access all the users',
      async () => {
        const { username } = usersIncludingPasswords[0];
        const { password } = usersIncludingPasswords[0];

        const response = await request(app)
          .post('/user/login')
          .send({ username, password })
          .expect(200);
        const cookie = response.headers['set-cookie'].pop().split(';')[0];
        expect(cookie).toMatch(/^token=/);
        const token = cookie.substring(6);
        const role = String(users[1].roles[0]);
        await request(app)
          .get(`/user/${role}`)
          .set('Cookie', [`token=${token}`])
          .expect(401);
      },
    );

    it(
      'should return message 200 if correct :role and correct token is provided',
      async () => {
        const { username } = adminsIncludingPasswords[0];
        const { password } = adminsIncludingPasswords[0];

        const response = await request(app)
          .post('/user/login')
          .send({ username, password })
          .expect(200);
        const cookie = response.headers['set-cookie'].pop().split(';')[0];
        expect(cookie).toMatch(/^token=/);
        const token = cookie.substring(6);
        const role = String(users[0].roles[0]);
        await request(app)
          .get(`/user/${role}`)
          .set('Cookie', [`token=${token}`])
          .expect(200);
      },
    );
  });

  describe('get /admin/task', () => {
    it(
      'should return message 403 if no token is provided',
      async () => {
        await request(app)
          .get('/admin/task')
          .expect(403);
      },
    );

    it(
      'should return message 401 if a non-admin user tries to access all the tasks',
      async () => {
        const { username } = usersIncludingPasswords[0];
        const { password } = usersIncludingPasswords[0];

        const response = await request(app)
          .post('/user/login')
          .send({ username, password })
          .expect(200);
        const cookie = response.headers['set-cookie'].pop().split(';')[0];
        expect(cookie).toMatch(/^token=/);
        const token = cookie.substring(6);
        await request(app)
          .get('/user/login')
          .set('Cookie', [`token=${token}`])
          .expect(401);
      },
    );

    it(
      'should return message 200 if user is admin and correct token is provided',
      async () => {
        const { username } = adminsIncludingPasswords[0];
        const { password } = adminsIncludingPasswords[0];

        const response = await request(app)
          .post('/user/login')
          .send({ username, password })
          .expect(200);
        const cookie = response.headers['set-cookie'].pop().split(';')[0];
        expect(cookie).toMatch(/^token=/);
        const token = cookie.substring(6);
        await request(app)
          .get('/admin/task')
          .set('Cookie', [`token=${token}`])
          .expect(200);
      },
    );
  });

  describe('patch /admin/task/:id ', () => {
    it(
      'should return message 403 if correct :id and correct userId is provided but no token',
      async () => {
        const taskId = String(tasks[0]._id);
        await request(app)
          .patch(`/admin/task/${taskId}`)
          .send({ userId: String(users[0]._id) })
          .expect(403);
      },
    );

    it(
      'should return message 401 if a non-admin user tries to update the userId of a task',
      async () => {
        const { username } = usersIncludingPasswords[0];
        const { password } = usersIncludingPasswords[0];

        const response = await request(app)
          .post('/user/login')
          .send({ username, password })
          .expect(200);
        const cookie = response.headers['set-cookie'].pop().split(';')[0];
        expect(cookie).toMatch(/^token=/);
        const token = cookie.substring(6);
        const taskId = String(tasks[0]._id);
        await request(app)
          .patch(`/admin/task/${taskId}`)
          .send({ userId: String(users[0]._id) })
          .set('Cookie', [`token=${token}`])
          .expect(401);
      },
    );

    it(
      'should return message 200 if correct :id, correct userId and correct token is provided',
      async () => {
        const { username } = adminsIncludingPasswords[0];
        const { password } = adminsIncludingPasswords[0];

        const response = await request(app)
          .post('/user/login')
          .send({ username, password })
          .expect(200);
        const cookie = response.headers['set-cookie'].pop().split(';')[0];
        expect(cookie).toMatch(/^token=/);
        const token = cookie.substring(6);
        const taskId = String(tasks[0]._id);
        await request(app)
          .patch(`/admin/task/${taskId}`)
          .send({ userId: String(users[0]._id) })
          .set('Cookie', [`token=${token}`])
          .expect(200);
      },
    );
  });

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
        const { username } = usersIncludingPasswords[0];
        await request(app)
          .post('/user/login')
          .send({ username, password: 'wrongpassword1' })
          .expect(401);
      },
    );

    it(
      'should return message 200 if username and password are correct',
      async () => {
        const { username } = usersIncludingPasswords[0];
        const { password } = usersIncludingPasswords[0];
        await request(app)
          .post('/user/login')
          .send({ username, password })
          .expect(200);
      },
    );

    it(
      'should contain user and token if username and password are correct',
      async () => {
        const { username } = usersIncludingPasswords[0];
        const { password } = usersIncludingPasswords[0];

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

  describe('post /admin/task ', () => {
    it(
      'should return message 403 if no token is provided',
      async () => {
        await request(app)
          .post('/admin/task')
          .expect(403);
      },
    );

    it(
      'should return message 401 if a non-admin user tries to add a new task',
      async () => {
        const { username } = usersIncludingPasswords[0];
        const { password } = usersIncludingPasswords[0];

        const response = await request(app)
          .post('/user/login')
          .send({ username, password })
          .expect(200);
        const cookie = response.headers['set-cookie'].pop().split(';')[0];
        expect(cookie).toMatch(/^token=/);
        const token = cookie.substring(6);
        const task = 'do something';
        await request(app)
          .post('/admin/task')
          .send({ todo: task })
          .set('Cookie', [`token=${token}`])
          .expect(401);
      },
    );

    it(
      'should return message 200 and added task if correct task and correct token is provided',
      async () => {
        const { username } = adminsIncludingPasswords[0];
        const { password } = adminsIncludingPasswords[0];

        const response = await request(app)
          .post('/user/login')
          .send({ username, password })
          .expect(200);
        const cookie = response.headers['set-cookie'].pop().split(';')[0];
        expect(cookie).toMatch(/^token=/);
        const token = cookie.substring(6);
        const task = 'do something';
        await request(app)
          .post('/admin/task')
          .send({ todo: task })
          .set('Cookie', [`token=${token}`])
          .expect(200)
          .expect((res) => {
            expect(res.body.todo).toEqual(task);
          });
      },
    );
  });
  describe('get /user/:id/task ', () => {
    it(
      'should return message 403 if correct :id is provided but no token',
      async () => {
        const id = String(users[0]._id);
        await request(app)
          .get(`/user/${id}/task`)
          .expect(403);
      },
    );

    it(
      "should return message 401 if a user tries to access another user's tasks",
      async () => {
        const { username } = usersIncludingPasswords[0];
        const { password } = usersIncludingPasswords[0];

        const response = await request(app)
          .post('/user/login')
          .send({ username, password })
          .expect(200);
        const cookie = response.headers['set-cookie'].pop().split(';')[0];
        expect(cookie).toMatch(/^token=/);
        const token = cookie.substring(6);
        const id = String(users[1]._id);
        await request(app)
          .get(`/user/${id}/task`)
          .set('Cookie', [`token=${token}`])
          .expect(401);
      },
    );

    it(
      'should return message 200 if correct :id and correct token is provided',
      async () => {
        const { username } = usersIncludingPasswords[0];
        const { password } = usersIncludingPasswords[0];

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
          .get(`/user/${id}/task`)
          .set('Cookie', [`token=${token}`])
          .expect(200);
      },
    );
  });
});
