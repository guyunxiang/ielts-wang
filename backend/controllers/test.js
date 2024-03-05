const Test = require('../models/test');


// save paper test
exports.savePaperTest = async (req, res) => {
  try {
    const {
      chapter,
      testPaper,
      words,
      userId,
    } = req.body;

    const newTest = new Test({
      chapter,
      testPaper,
      words,
      userId,
      createAt: new Date(),
    });

    await newTest.save();

    res.status(201).json({
      success: true,
      message: "success"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while registering user",
    });
  }
}