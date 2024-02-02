const mongoose = require('mongoose');
const evaluationSchema = require('./evaluationSchema');

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxLength: 20,
      validate: {
        validator(value) {
          return /^[a-zA-Z0-9_-]+$/.test(value);
        },
        message: (props) => `${props.value} is not a valid name.`,
      },
      required: [true, 'Name is required'],
      unique: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    studentIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    evaluations: [evaluationSchema],
  },
  { collection: 'courses' },
);

module.exports = mongoose.model('Course', courseSchema);
