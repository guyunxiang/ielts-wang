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

// whitelist
router.get("/admin/whitelist/query", adminController.queryWhitelist);
router.put("/admin/whitelist/update", adminController.updateWhitelistById);

// misspelled
router.get("/admin/mistakes/query", adminController.queryMisspelledListByUserId);
router.put("/admin/mistake/renew", adminController.renewMisspelledRecord);
router.delete("/admin/mistake/delete", adminController.deleteMisspelledTableAndTestById);
router.get("/admin/dictation/query", adminController.queryDictationById);
router.put("/admin/dictation/update", adminController.updateDictationRecordById);

// query all chapters vocabulary counts
router.get("/vocabularyCounts/query", adminController.queryAllVocabulary);
// query vocabulary by test paper
router.get("/dictation/vocabulary/testPaper/query", adminController.queryVocabularByTestPaperNo);


// get dictation mistake data
router.get("/dictation/mistake", authenticate, userController.getDictationMistakeById);
// Get all dictation mistake data
router.get("/dictation/mistakes", authenticate, userController.getAllDictationMistakes);
// Update practice count
// router.put("/dictation/practiceCount/update", authenticate, userController.updatePracticeCount);
// Update training duration
// router.put("/dictation/trainingDuration/update", authenticate, userController.updateTrainingDuration);
// Update practice count and training duration
router.put("/dictation/practiceRecord/update", authenticate, userController.updatePracticeRecord);
// Query dictation process by chapter number
router.get("/dictation/progress", authenticate, userController.getDictationMistakesByChapterNo);
// Update word translation
router.put("/vocabulary/word/update", authenticate, userController.updateWordTranslation);

// login
router.post("/auth/login", userController.login);
// register
router.post("/auth/register", userController.register);
router.get("/auth/logout", userController.logout);

router.get("/auth/status", authenticate, userController.getAuthStatus);
router.get("/auth/user/list", authenticate, userController.getUserList);

module.exports = router;
