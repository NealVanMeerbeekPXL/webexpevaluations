const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const users = [
  {
    _id: new ObjectId('61a76d61394acba6dbfa0d80'),
    username: 'user1',
    roles: ['user'],
    hashedPassword: '$2a$08$q95do0kym4k33LBECW5HqOMMm90PMyW9kZKuV5x8E0brBOUSLEqkq',
    taskIds: [],
  },
  {
    _id: new ObjectId('61a76d61394acba6dbfa0d81'),
    username: 'user2',
    roles: ['user'],
    hashedPassword: '$2a$08$WTIBKp47Hjaa3nS0V05HTuaw65jJu2RXQ6sAFNowNspt7DTYGF.b6',
    taskIds: [
      new ObjectId('61a9079ed842a2429ae53d82'),
      new ObjectId('61a9079ed842a2429ae53d84'),
    ],
  },
];

const usersIncludingPasswords = [
  {
    _id: new ObjectId('61a76d61394acba6dbfa0d80'),
    username: 'user1',
    roles: ['user'],
    password: 'password1',
    hashedPassword: '$2a$08$q95do0kym4k33LBECW5HqOMMm90PMyW9kZKuV5x8E0brBOUSLEqkq',
    taskIds: [],
  },
  {
    _id: new ObjectId('61a76d61394acba6dbfa0d81'),
    username: 'user2',
    roles: ['user'],
    password: 'password2',
    hashedPassword: '$2a$08$WTIBKp47Hjaa3nS0V05HTuaw65jJu2RXQ6sAFNowNspt7DTYGF.b6',
    taskIds: [
      new ObjectId('61a9079ed842a2429ae53d82'),
      new ObjectId('61a9079ed842a2429ae53d84'),
    ],
  },
];

const admins = [
  {
    _id: new ObjectId('61a76d61394acba6dbfa0d85'),
    username: 'admin1',
    roles: ['admin'],
    hashedPassword: '$2a$08$q95do0kym4k33LBECW5HqOMMm90PMyW9kZKuV5x8E0brBOUSLEqkq',
    taskIds: [],
  },
  {
    _id: new ObjectId('61a76d61394acba6dbfa0d86'),
    username: 'admin2',
    roles: ['admin'],
    hashedPassword: '$2a$08$WTIBKp47Hjaa3nS0V05HTuaw65jJu2RXQ6sAFNowNspt7DTYGF.b6',
    taskIds: [],
  },
];

const adminsIncludingPasswords = [
  {
    _id: new ObjectId('61a76d61394acba6dbfa0d85'),
    username: 'admin1',
    roles: ['admin'],
    password: 'password1',
    hashedPassword: '$2a$08$q95do0kym4k33LBECW5HqOMMm90PMyW9kZKuV5x8E0brBOUSLEqkq',
    taskIds: [],
  },
  {
    _id: new ObjectId('61a76d61394acba6dbfa0d86'),
    username: 'admin2',
    roles: ['admin'],
    password: 'password2',
    hashedPassword: '$2a$08$WTIBKp47Hjaa3nS0V05HTuaw65jJu2RXQ6sAFNowNspt7DTYGF.b6',
    taskIds: [],
  },
];

const tasks = [
  {
    _id: new ObjectId('61a9079ed842a2429ae53d82'),
    todo: 'task1',
    completed: false,
  },
  {
    _id: new ObjectId('61a9079ed842a2429ae53d83'),
    todo: 'task2',
    completed: false,
  },
  {
    _id: new ObjectId('61a9079ed842a2429ae53d84'),
    todo: 'task3',
    completed: false,
  },
];

module.exports = {
  users, usersIncludingPasswords, admins, adminsIncludingPasswords, tasks,
};