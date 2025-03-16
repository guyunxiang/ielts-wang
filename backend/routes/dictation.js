const express = require("express");
const router = express.Router();

const testController = require("../controllers/test");
const userController = require("../controllers/user");
const { authenticate } = require("../middlewares/userAuthor");
const adminController = require("../controllers/admin");

// get dictation mistake data
router.get(
  "/mistake",
  authenticate,
  userController.getDictationMistakeById
);
// Get all dictation mistake data
router.get(
  "/mistakes",
  authenticate,
  userController.getAllDictationMistakes
);
// Update practice count
// router.put("/dictation/practiceCount/update", authenticate, userController.updatePracticeCount);
// Update training duration
// router.put("/dictation/trainingDuration/update", authenticate, userController.updateTrainingDuration);
// Update practice count and training duration
router.put(
  "/practiceRecord/update",
  authenticate,
  userController.updatePracticeRecord
);
// Query dictation process by chapter number
router.get(
  "/progress",
  authenticate,
  userController.getDictationMistakesByChapterNo
);

// query vocabulary by test paper
router.get(
  "/vocabulary/testPaper/query",
  adminController.queryVocabularByTestPaperNo
);

module.exports = router;