const express = require("express");
const router = express.Router();

const testController = require("../controllers/test");
const userController = require("../controllers/user");

router.get("/", (req, res) => {
  res.render("index");
});

// save listening test
router.post("/paper/test", testController.savePaperTest);

// login
router.post("/auth/login", userController.login);

router.get("/auth/logout", userController.logout);

router.get("/auth/status", (req, res) => {
  res.status(200).json({
    success: true,
    data: !!req.session.userId
  });
})

module.exports = router;
