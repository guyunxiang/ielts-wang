const mongoose = require('mongoose');

const WordSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true
  },
  practiceCount: {
    type: Number,
    default: 0
  }
});

/**
 * Represents a schema for recording dictation mistakes.
 *
 * @typedef {Object} DictationMistakeSchema
 * @property {number} chapterNo - The chapter number associated with the mistake.
 * @property {number} testPaperNo - The test paper number associated with the mistake.
 * @property {number} accuracyCount - The count of accurate dictations.
 * @property {number} accuracyRate - The accuracy rate of dictations (in percentage).
 * @property {WordSchema[]} words - An array of words associated with the mistake.
 * @property {mongoose.Schema.Types.ObjectId} userId - The ID of the user who made the mistake.
 * @property {mongoose.Schema.Types.ObjectId} testId - The ID of the test associated with the mistake.
 * @property {boolean} deleted - Indicates if the mistake has been deleted.
 * @property {number} studyDuration - The duration of study time for the mistake (in seconds).
 * @property {Date} createdAt - The timestamp when the mistake was created.
 * @property {Date} updatedAt - The timestamp when the mistake was last updated.
 */
const DictationMistakeSchema = new mongoose.Schema({
  chapterNo: {
    type: Number,
    required: true
  },
  testPaperNo: {
    type: Number,
    required: false
  },
  accuracyCount: {
    type: Number,
    required: true
  },
  accuracyRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  words: [WordSchema],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  studyDuration: {
    type: Number,
    required: false
  }
}, { timestamps: true });

// Add a pre-find hook
DictationMistakeSchema.pre(/^find/, function (next) {
  // Check if the deleted field is not explicitly set in the query
  if (this.getQuery().deleted !== true) {
    // If not set, add the condition deleted: false
    this.where({ deleted: { $ne: true } });
  }
  next();
});

const DictationMistake = mongoose.model('DictationMistake', DictationMistakeSchema);

module.exports = DictationMistake;