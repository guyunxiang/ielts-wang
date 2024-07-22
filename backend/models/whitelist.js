const mongoose = require('mongoose');

const whitelist = new mongoose.Schema({
  original: {
    type: String,
    required: true,
  },
  alternative: {
    type: [String],
    default: [],
    required: true,
  },
});

const whitelistSchema = new mongoose.Schema({
  version: {
    type: Number,
    default: 18,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  whitelist: [whitelist],
  deleted: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

// Add a pre-find hook
whitelistSchema.pre(/^find/, function (next) {
  // Check if the deleted field is not explicitly set in the query
  if (this.getQuery().deleted !== true) {
    // If not set, add the condition deleted: false
    this.where({ deleted: { $ne: true } });
  }
  next();
});

const Whitelist = mongoose.model("Whitelist", whitelistSchema);

module.exports = Whitelist;