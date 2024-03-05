const express = require('express');
const router = express.Router();

const testController = require('../controllers/test');

router.get('/', (req, res) => {
  res.render('index')
});

// save listening test
router.post("/paper/test", testController.savePaperTest);

module.exports = router;