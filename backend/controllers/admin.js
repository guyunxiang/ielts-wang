const VocabularyList = require("../models/vocabularyList");

// save paper vocabulary
exports.savePaperVocabulary = async (req, res) => {
  try {
    const {
      chapterNo,
      testPaperNo,
      sectionNo,
      words,
    } = req.body;

    const newVocabularList = new VocabularyList({
      chapterNo,
      testPaperNo,
      sectionNo,
      words
    });

    await newVocabularList.save();

    res.status(201).json({
      success: true,
      message: "Create vocabulary successfully!"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while registering user",
    });
  }
}

// Get all vocabulary list
exports.queryAllVocabulary = async (req, res) => {
  try {
    const { chapterNo } = req.query;

    const vocabularyList = await VocabularyList.find({ chapterNo })
      .select("testPaperNo sectionNo words");

    const responseData = vocabularyList.map(({ testPaperNo, sectionNo, words}) => ({
      testPaperNo,
      sectionNo,
      wordCount: words.length
    }));

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while registering user",
    });
  }
}