const express = require("express");
const router = express.Router();

const testController = require("../controllers/test");
const userController = require("../controllers/user");
const adminController = require("../controllers/admin");

const { authenticate } = require("../middlewares/userAuthor");

router.get("/", (req, res) => {
  res.render("index");
});

// save listening test
router.post("/paper/test", testController.savePaperTest);

router.post("/admin/vocabulary/save", adminController.savePaperVocabulary);

router.get("/dictation/vocabulary/query", adminController.queryAllVocabulary);

router.get("/dictation/vocabulary/testPaper/query", adminController.queryVocabularByTestPaperNo);


// get dictation mistake data
router.get("/dictation/mistake", authenticate, userController.getDictationMistakeById);
// Get all dictation mistake data
router.get("/dictation/mistakes", authenticate, userController.getAllDictationMistakes);
// Update practice count
router.put("/dictation/practiceCount/update", authenticate, userController.updatePracticeCount);

// login
router.post("/auth/login", userController.login);
// register
router.post("/auth/register", userController.register);

router.get("/auth/logout", userController.logout);

router.get("/auth/status", authenticate, userController.getAuthStatus);

module.exports = router;
