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
// get misspelled table
router.get("/admin/mistakes/query", adminController.queryMisspelledListByUserId);
router.put("/admin/mistake/renew", adminController.renewMisspelledRecord);
router.get("/admin/dictation/query", adminController.queryDictationById);
router.put("/admin/dictation/update", adminController.updateDictationRecordById);

router.get("/admin/whitelist/query", adminController.queryWhitelist);
router.put("/admin/whitelist/update", adminController.updateWhitelistById);

router.get("/dictation/vocabulary/query", adminController.queryAllVocabulary);
// query vocabulary by test paper
router.get("/dictation/vocabulary/testPaper/query", adminController.queryVocabularByTestPaperNo);


// get dictation mistake data
router.get("/dictation/mistake", authenticate, userController.getDictationMistakeById);
// Get all dictation mistake data
router.get("/dictation/mistakes", authenticate, userController.getAllDictationMistakes);
// Update practice count
router.put("/dictation/practiceCount/update", authenticate, userController.updatePracticeCount);
// Query dictation process by chapter number
router.get("/dictation/progress", authenticate, userController.getDictationMistakesByChapterNo);

// login
router.post("/auth/login", userController.login);
// register
router.post("/auth/register", userController.register);
router.get("/auth/logout", userController.logout);

router.get("/auth/status", authenticate, userController.getAuthStatus);
router.get("/auth/user/list", authenticate, userController.getUserList);

module.exports = router;
