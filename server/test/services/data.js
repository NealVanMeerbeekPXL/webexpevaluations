const { ObjectId } = require('mongodb');

const usersIncludingPasswords = [
  {
    _id: new ObjectId('61a76d61394acba7fbfa0d80'),
    username: 'user1',
    roles: ['teacher'],
    password: 'password1',
    hashedPassword: '$2a$08$q95do0kym4k33LBECW5HqOMMm90PMyW9kZKuV5x8E0brBOUSLEqkq',
  },
  {
    _id: new ObjectId('61a76d61394acba5ebfa0d81'),
    username: 'user2',
    roles: ['student'],
    password: 'password2',
    hashedPassword: '$2a$08$WTIBKp47Hjaa3nS0V05HTuaw65jJu2RXQ6sAFNowNspt7DTYGF.b6',
  },
];

const users = usersIncludingPasswords.map((person) => {
  const personCopy = JSON.parse(JSON.stringify(person));
  delete personCopy.password;
  return person;
});

const validCoursesWithValidEvaluations = [
  {
    _id: new ObjectId('61a12d61394acba6dabcdd80'),
    name: 'course1',
    teacherId: new ObjectId('61a76d61394acba6dbfa0d80'),
    studentIds: [],
    evaluations: [],
  },
  {
    _id: new ObjectId('64a76d61394acba6db6a0d82'),
    name: 'course2',
    teacherId: new ObjectId('61a76d61394acba6dbfa0d80'),
    studentIds: [
      new ObjectId('61a76d61394acba6dbfa0d81'),
    ],
    evaluations: [
      {
        _id: new ObjectId('61a76d61394bcba6dbfa0d80'),
        studentId: new ObjectId('61a76d61394acba6dbfa0d81'),
        courseId: new ObjectId('64a76d61394acba6db6a0d82'),
        result: 8,
        weight: 1,
        message: 'Great!',
        date: new Date('2024-01-01T00:00:00.000Z'),
      },
      {
        _id: new ObjectId('61a76d61394acaa6dbfa0d81'),
        studentId: new ObjectId('61a76d61394acba6dbfa0d81'),
        courseId: new ObjectId('64a76d61394acba6db6a0d82'),
        result: 9,
        weight: 3,
        message: 'Well done!',
        date: new Date('2024-01-01T00:00:00.000Z'),
      },
    ],
  },
];

const invalidCourses = [
  { name: '' },
  { name: '.' },
  { name: 'a.b' },
  { name: 'new course', teacherId: 1 },
  { name: 'new course', teacherId: new ObjectId('61a76d61394acba6dbfa0d80'), studentIds: 'ok' },
  { name: 'new course', teacherId: new ObjectId('61a76d61394acba6dbfa0d80'), studentIds: 1 },
  {
    name: 'new course',
    teacherId: new ObjectId('61a76d61394acba6dbfa0d80'),
    studentIds: [new ObjectId('61a76d61394acba6dbfa0d81')],
    evaluations: 'ok',
  },
  {
    name: 'new course',
    teacherId: new ObjectId('61a76d61394acba6dbfa0d80'),
    studentIds: [new ObjectId('61a76d61394acba6dbfa0d81')],
    evaluations: 1,
  },
];

module.exports = {
  users, validCoursesWithValidEvaluations, invalidCourses, usersIncludingPasswords,
};
