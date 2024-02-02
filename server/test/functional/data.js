const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const students = [
  {
    _id: new ObjectId('61a76d61394acba6dbfa0d80'),
    username: 'student1',
    roles: ['student'],
    hashedPassword: '$2a$08$q95do0kym4k33LBECW5HqOMMm90PMyW9kZKuV5x8E0brBOUSLEqkq',
  },
  {
    _id: new ObjectId('61a76d61394acba6dbfa0d81'),
    username: 'student2',
    roles: ['student'],
    hashedPassword: '$2a$08$WTIBKp47Hjaa3nS0V05HTuaw65jJu2RXQ6sAFNowNspt7DTYGF.b6',
  },
];

const studentsIncludingPasswords = [
  {
    _id: new ObjectId('61a76d61394acba6dbfa0d80'),
    username: 'student1',
    roles: ['student'],
    password: 'password1',
    hashedPassword: '$2a$08$q95do0kym4k33LBECW5HqOMMm90PMyW9kZKuV5x8E0brBOUSLEqkq',
  },
  {
    _id: new ObjectId('61a76d61394acba6dbfa0d81'),
    username: 'student2',
    roles: ['student'],
    password: 'password2',
    hashedPassword: '$2a$08$WTIBKp47Hjaa3nS0V05HTuaw65jJu2RXQ6sAFNowNspt7DTYGF.b6',
  },
];

const teachers = [
  {
    _id: new ObjectId('61a76d61394acba6dbfa0d85'),
    username: 'teacher1',
    roles: ['teacher'],
    hashedPassword: '$2a$08$q95do0kym4k33LBECW5HqOMMm90PMyW9kZKuV5x8E0brBOUSLEqkq',
  },
  {
    _id: new ObjectId('61a76d61394acba6dbfa0d86'),
    username: 'teacher2',
    roles: ['teacher'],
    hashedPassword: '$2a$08$WTIBKp47Hjaa3nS0V05HTuaw65jJu2RXQ6sAFNowNspt7DTYGF.b6',
  },
];

const teachersIncludingPasswords = [
  {
    _id: new ObjectId('61a76d61394acba6dbfa0d85'),
    username: 'teacher1',
    roles: ['teacher'],
    password: 'password1',
    hashedPassword: '$2a$08$q95do0kym4k33LBECW5HqOMMm90PMyW9kZKuV5x8E0brBOUSLEqkq',
    taskIds: [],
  },
  {
    _id: new ObjectId('61a76d61394acba6dbfa0d86'),
    username: 'teacher2',
    roles: ['teacher'],
    password: 'password2',
    hashedPassword: '$2a$08$WTIBKp47Hjaa3nS0V05HTuaw65jJu2RXQ6sAFNowNspt7DTYGF.b6',
    taskIds: [],
  },
];

const courses = [
  {
    _id: new ObjectId('61a76d61394acba6dabcdd80'),
    name: 'course1',
    teacherId: new ObjectId('61a76d61394acba6dbfa0d80'),
    studentIds: [],
    evaluations: [],
  },
  {
    _id: new ObjectId('61a76d61394acba6db6a0d82'),
    name: 'course2',
    teacherId: new ObjectId('61a76d61394acba6dbfa0d80'),
    studentIds: [
      new ObjectId('61a76d61394acba6dbfa0d81'),
    ],
    evaluations: [
      {
        _id: new ObjectId('61a76d61394bcba6dbfa0d80'),
        studentId: new ObjectId('61a76d61394acba6dbfa0d81'),
        result: 8,
        weight: 1,
      },
      {
        _id: new ObjectId('61a76d61394acaa6dbfa0d81'),
        studentId: new ObjectId('61a76d61394acba6dbfa0d81'),
        result: 9,
        weight: 3,
      },
    ],
  },
];

module.exports = {
  students,
  studentsIncludingPasswords,
  teachers,
  teachersIncludingPasswords,
  courses,
};
