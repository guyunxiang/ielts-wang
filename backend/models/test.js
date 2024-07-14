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
  deleted: {
    type: Boolean,
    default: false,
  }
});

// Add a pre-find hook
listeningTestSchema.pre(/^find/, function (next) {
  // Check if the deleted field is not explicitly set in the query
  if (this.getQuery().deleted !== true) {
    // If not set, add the condition deleted: false
    this.where({ deleted: { $ne: true } });
  }
  next();
});

const Test = mongoose.model("Test", listeningTestSchema);

module.exports = Test;