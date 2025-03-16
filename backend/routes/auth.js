const express = require("express");
const router = express.Router();

const userController = require("../controllers/user");
const { authenticate } = require("../middlewares/userAuthor");

// login
router.post("/login", userController.login);
// register
router.post("/register", userController.register);
router.get("/logout", userController.logout);

router.get("/status", authenticate, userController.getAuthStatus);
router.get("/user/list", authenticate, userController.getUserList);

module.exports = router;