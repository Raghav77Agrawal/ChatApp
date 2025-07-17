const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Partner', // fallback name
    trim: true,
    maxlength: 50
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'non-binary', 'prefer-not-to-say'],
    default: 'prefer-not-to-say'
  },
  age: {
    type: Number,
    min: 13, // assuming minimum age
    max: 120, // reasonable upper limit
  },
  interests: {
    type: String,
  default: 'NA',
  trim: true,
  maxlength: 200 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
