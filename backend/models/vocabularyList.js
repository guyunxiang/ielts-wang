const mongoose = require('mongoose');

const WordSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true
  },
  phonetic: {
    type: String,
    required: false
  },
  translation: {
    type: String,
    required: false
  }
});

const VocabularyListSchema = new mongoose.Schema({
  chapterNo: {
    type: Number,
    required: true
  },
  testPaperNo: {
    type: Number,
    required: false
  },
  words: [WordSchema],
  deleted: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

// Add a pre-find hook
VocabularyListSchema.pre(/^find/, function (next) {
  // Check if the deleted field is not explicitly set in the query
  if (this.getQuery().deleted !== true) {
    // If not set, add the condition deleted: false
    this.where({ deleted: { $ne: true } });
  }
  next();
});

const VocabularyList = mongoose.model('VocabularyList', VocabularyListSchema);

module.exports = VocabularyList;