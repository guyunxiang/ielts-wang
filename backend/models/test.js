const mongoose = require('mongoose');

const listeningTestSchema = new mongoose.Schema({
  chapterNo: {
    type: Number,
    required: true,
  },
  paperNo: {
    type: Number,
    required: true,
  },
  words: {
    type: Array,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createAt: {
    type: Date,
    required: true,
  },
});

const Test = mongoose.model("Test", listeningTestSchema);

module.exports = Test;