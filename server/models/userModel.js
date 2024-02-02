const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 2,
      maxLength: 50,
      validate: {
        validator(value) {
          return /^[a-zA-Z0-9_]+$/.test(value);
        },
        message: (props) => `${props.value} is not a valid username.`,
      },
    },
    roles: {
      type: [String],
      enum: ['admin', 'teacher', 'student'],
      default: ['student'],
    },
    hashedPassword: {
      type: String,
      required: true,
    },
  },
  { collection: 'users' },
);

function passwordFieldSetter(password) {
  const trimmedPassword = password.trim();
  if (trimmedPassword.length < 6) {
    this.invalidate('password', 'must be at least 6 characters.');
  }
  if (trimmedPassword.length > 20) {
    this.invalidate('password', 'must be shorter than 20 characters.');
  }
  this.hashedPassword = bcrypt.hashSync(trimmedPassword, 8);
}

userSchema
  .virtual('password')
  .set(passwordFieldSetter);

async function findOneByCredentials(username, password) {
  const user = await this.findOne({ username });
  if (!user) {
    return null;
  }
  const passwordIsCorrect = await bcrypt.compare(password, user.hashedPassword);
  if (!passwordIsCorrect) {
    return null;
  }
  return user;
}

userSchema.statics.findOneByCredentials = findOneByCredentials;

module.exports = mongoose.model('User', userSchema);
