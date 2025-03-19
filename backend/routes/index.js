const express = require("express");
const router = express.Router();

const adminRouter = require("./admin");
const authRouter = require("./auth");
const dictationRouter = require("./dictation");

const { authenticate } = require("../middlewares/userAuthor");
const userController = require("../controllers/user");
const testController = require("../controllers/test");
const adminController = require("../controllers/admin");

router.get("/", (req, res) => {
  res.render("index");
});

// Update word translation
router.put(
  "/vocabulary/word/update",
  authenticate,
  userController.updateWordTranslation
);

// save listening test
router.post("/paper/test", testController.savePaperTest);

// query all chapters vocabulary counts
router.get("/vocabularyCounts/query", adminController.queryAllVocabulary);

// auth
router.use("/auth", authRouter);

// admin
router.use("/admin", adminRouter);

// dictation
router.use("/dictation", dictationRouter);

module.exports = router;
