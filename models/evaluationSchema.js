const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
      required: [true, 'Date is required'],
    },
    result: {
      type: Number,
      default: 0,
      validate: {
        validator(value) {
          return (value >= 0 && value <= 10) || value === -1;
        },
        message: (props) => `${props.value} is not a valid result!`,
      },
      required: [true, 'Result is required'],
    },
    weight: {
      type: Number,
      default: 0,
      validate: {
        validator(value) {
          return Number.isInteger(value) && value < 20 && value >= 0;
        },
        message: (props) => `${props.value} is not a valid weight!`,
      },
      required: [true, 'Weight is required'],
    },
    message: {
      type: String,
      trim: true,
      default: null,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'CourseId is required'],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'StudentId is required'],
    },
  },
);

module.exports = evaluationSchema;
