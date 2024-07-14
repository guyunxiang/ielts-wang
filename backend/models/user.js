const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const roles = {
  ADMIN: 'admin',
  USER: 'user'
};


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: [roles.ADMIN, roles.USER],
    default: roles.USER
  },
  deleted: {
    type: Boolean,
    default: false,
  }
});

// Add a pre-find hook
userSchema.pre(/^find/, function (next) {
  // Check if the deleted field is not explicitly set in the query
  if (this.getQuery().deleted !== true) {
    // If not set, add the condition deleted: false
    this.where({ deleted: { $ne: true } });
  }
  next();
});

userSchema.pre("save", async function (next) {
  try {
    const user = this;
    if (user.password) {
      const hash = await bcrypt.hash(user.password, 10);
      user.password = hash;
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("User", userSchema);
