const express = require("express");
const router = express.Router();

const testController = require("../controllers/test");
const userController = require("../controllers/user");
const adminController = require("../controllers/admin");

router.get("/", (req, res) => {
  res.render("index");
});

// save listening test
router.post("/paper/test", testController.savePaperTest);

router.post("/admin/vocabulary/save", adminController.savePaperVocabulary);


// get dictation mistake data
router.get("/dictation/mistake", userController.getDictationMistakeById);

router.put("/dictation/practiceCount/update", userController.updatePracticeCount);

// login
router.post("/auth/login", userController.login);
// register
router.post("/auth/register", userController.register);

router.get("/auth/logout", userController.logout);

router.get("/auth/status", (req, res) => {
  res.status(200).json({
    success: true,
    data: !!req.session.userId
  });
})

module.exports = router;
