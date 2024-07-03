const mongoose = require('mongoose');

const whitelistSchema = new mongoose.Schema({
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

const Whitelist = mongoose.model("Whitelist", whitelistSchema);

module.exports = Whitelist;