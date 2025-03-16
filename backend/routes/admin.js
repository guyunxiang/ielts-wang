const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin");

// save vocabulary
router.post("/vocabulary/save", adminController.savePaperVocabulary);

// whitelist
router.get("/whitelist/query", adminController.queryWhitelist);
router.put("/whitelist/update", adminController.updateWhitelistById);

// misspelled
router.get("/mistakes/query", adminController.queryMisspelledListByUserId);
router.put("/mistake/renew", adminController.renewMisspelledRecord);
router.delete(
  "/mistake/delete",
  adminController.deleteMisspelledTableAndTestById
);
router.get("/dictation/query", adminController.queryDictationById);
router.put("/dictation/update", adminController.updateDictationRecordById);

module.exports = router;
