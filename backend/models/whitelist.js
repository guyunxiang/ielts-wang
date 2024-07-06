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
  whitelist: [whitelist]
}, { timestamps: true });

const Whitelist = mongoose.model("Whitelist", whitelistSchema);

module.exports = Whitelist;