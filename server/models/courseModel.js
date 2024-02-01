const mongoose = require('mongoose');
const evaluationSchema = require('./evaluationSchema');

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Name is required'],
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
