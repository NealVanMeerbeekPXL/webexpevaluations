const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const userRouter = require('../routes/user');
const teacherRouter = require('../routes/teacher');
const studentRouter = require('../routes/student');
const { errorHandler, routeNotFound } = require('../middleware/error');

function loadExpress(CORS_OPTIONS) {
  const app = express();
  app.use(helmet());
  app.use('*', cors(CORS_OPTIONS));
  app.use(cookieParser());
  app.use(express.json());
  app.use(mongoSanitize());
  app.use('/user', userRouter);
  app.use('/teacher', teacherRouter);
  app.use('/student', studentRouter);
  app.use(routeNotFound);
  app.use(errorHandler);
  return app;
}

module.exports = loadExpress;
