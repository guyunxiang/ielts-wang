const VocabularyList = require("../models/vocabularyList");

// save paper vocabulary
exports.savePaperVocabulary = async (req, res) => {
  try {
    const {
      chapterNo,
      testPaperNo,
      sectionNo,
      words,
      id,
    } = req.body;

    let newVocabularyList;
    let message;
    if (!id) {
      newVocabularyList = new VocabularyList({
        chapterNo,
        testPaperNo,
        sectionNo,
        words
      });
      message = "Congratulation! vocabulary added successfully!";
    } else {
      newVocabularyList = await VocabularyList.findById(id);
      if (!newVocabularyList) {
        res.status(401).json({
          success: false,
          message: `Chapter ${chapterNo} - Test Paper ${testPaperNo} not found!`,
        });
        return;
      }
      newVocabularyList.words = words;
      message = `Vocabulary updated successfully!`;
    }

    const result = await newVocabularyList.save();

    res.status(201).json({
      success: true,
      data: result._id,
      message: message,
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

    const queryParams = {};
    if (chapterNo) {
      queryParams.chapterNo = chapterNo;
    }

    const vocabularyList = await VocabularyList.find(queryParams)
      .select("chapterNo testPaperNo sectionNo words");

    const responseData = vocabularyList.map(({ chapterNo, testPaperNo, sectionNo, words }) => ({
      chapterNo,
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

// Get vocabulary list with test paper number
exports.queryVocabularByTestPaperNo = async (req, res) => {
  try {
    const { chapterNo, testPaperNo } = req.query;
    const vocabularyList = await VocabularyList.findOne({ chapterNo, testPaperNo })
      .select("words");
    res.status(200).json({
      success: true,
      data: vocabularyList
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while registering user",
    });
  }
}