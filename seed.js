const dotenv = require('dotenv');

dotenv.config();

const { DATABASE_CONNECTION } = process.env;

const mongoose = require('mongoose');
const $console = require('Console');
const Course = require('./models/courseModel');
const User = require('./models/userModel');

mongoose.set('strictQuery', true);

function cleanup() {
  $console.log('\nBye!');
  mongoose.connection.close();
  process.exit();
}

mongoose.connect(DATABASE_CONNECTION).catch((error) => {
  $console.error(error.message);
  cleanup();
});

async function run() {
  try {
    await Course.init();
    await User.init();
    await Course.deleteMany({});
    await User.deleteMany({});
    const user1 = new User({ username: 'root', password: 'root123321', roles: ['admin'] });
    await user1.save();
    const user2 = new User({ username: 'tim', password: 'tim123321', roles: ['teacher'] });
    await user2.save();
    const user3 = new User({ username: 'bart', password: 'bart123321', roles: ['student'] });
    await user3.save();
    const course1 = new Course({ name: 'math', teacherId: [user2._id], studentIds: [user3._id] });
    await course1.save();
    const course2 = new Course({ name: 'english', teacherId: [user2._id], studentIds: [user3._id] });
    await course2.save();
    const course3 = new Course({ name: 'science', teacherId: [user2._id], studentIds: [user3._id] });
    await course3.save();

    const users = await User.find({});
    $console.log('users');
    $console.log(users);
    const courses = await Course.find({});
    $console.log('courses');
    $console.log(courses);
  } catch (error) {
    $console.log(error.message);
  } finally {
    await mongoose.connection.close();
  }
}

run().catch((err) => {
  $console.log(err.stack);
});
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
