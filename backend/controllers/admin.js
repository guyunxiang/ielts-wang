const mongoose = require('mongoose');

const DictationMistake = require("../models/dictationMistake");
const VocabularyList = require("../models/vocabularyList");
const Test = require("../models/test");
const Whitelist = require("../models/whitelist");

const testController = require("./test");

// save paper vocabulary
exports.savePaperVocabulary = async (req, res) => {
  try {
    const {
      chapterNo,
      testPaperNo,
      words,
      id,
    } = req.body;

    let newVocabularyList;
    let message;
    if (!id) {
      newVocabularyList = new VocabularyList({
        chapterNo,
        testPaperNo,
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
      message: error,
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
      .select("chapterNo testPaperNo words");

    const responseData = vocabularyList.map(({ chapterNo, testPaperNo, words }) => ({
      chapterNo,
      testPaperNo,
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
      message: error,
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
      message: error,
    });
  }
}

// Get misspelled list by userId
exports.queryMisspelledListByUserId = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required!"
      });
    }
    const misspelledList = await DictationMistake.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          testId: 1,
          chapterNo: 1,
          testPaperNo: 1,
          accuracyCount: 1,
          accuracyRate: 1,
          createdAt: 1,
          totalCount: {
            $sum: ['$accuracyCount', { $size: '$words' }]
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: misspelledList
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error,
    });
  }
}

// Get misspelled list by testId
exports.queryMisspelledListByTestId = async (req, res) => {
  try {
    const { testId } = req.query;
    if (!testId) {
      return res.status(400).json({
        success: false,
        message: "testId is required!"
      });
    }
    const misspelledList = await DictationMistake.find({ testId });

    res.status(200).json({
      success: true,
      data: misspelledList
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error,
    });
  }
}

// renew misspelled record by testId, misspelledId
exports.renewMisspelledRecord = async (req, res) => {
  try {
    const { id, testId } = req.body;
    if (!id || !testId) {
      return res.status(400).json({
        success: false,
        message: "id and testId are required!"
      });
    }
    // create a new misspelled record: testId, misspelledId
    await testController.createMisspelledWords(testId, id);
    res.status(200).json({
      success: true,
      message: "Misspelled record updated successfully!"
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error,
    });
  }
}

exports.queryDictationById = async (req, res) => {
  try {
    const { testId } = req.query;
    if (!testId) {
      return res.status(400).json({
        success: false,
        message: "testId is required!"
      });
    }
    const test = await Test.findById(testId);

    res.status(200).json({
      success: true,
      data: test
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error,
    });
  }
}

// Update dictation reocrd by testId
exports.updateDictationRecordById = async (req, res) => {
  try {
    const { id, words } = req.body;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "testId is required!"
      });
    }
    const test = await Test.findById(id);
    if (!test) {
      return res.status(400).json({
        success: false,
        message: "Dictation not found!"
      });
    }

    test.words = words;

    await test.save();

    res.status(200).json({
      success: true,
      message: "Dictation update successfully!"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error,
    });
  }
}

exports.queryWhitelist = async (req, res) => {
  try {
    const { version } = req.query;
    const whitelist = await Whitelist.findOne({ version });
    res.status(200).json({
      success: true,
      data: whitelist ?? {}
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Network Error!",
    });
  }
}

exports.updateWhitelistById = async (req, res) => {
  try {
    const { id, version, whitelist } = req.body;

    let message;
    if (id) {
      await Whitelist.findByIdAndUpdate(id, {
        whitelist,
        version,
      }, { new: true });
      message = "Upload whitelist successfully!";
    } else {
      const currentWhitelist = new Whitelist({
        whitelist,
        version
      });
      await currentWhitelist.save();
      message = "Create whitelist successfully!";
    }
    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// Delete misspelled table and test by id
exports.deleteMisspelledTableAndTestById = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id is required!"
      });
    }
    const misspelledRecord = await DictationMistake.findById(id).select("_id testId");
    if (!misspelledRecord) {
      return res.status(400).json({
        success: false,
        message: "Dictation not found!"
      });
    }
    const { testId } = misspelledRecord;
    // delete test record
    await Test.findByIdAndUpdate(testId, {
      deleted: true,
    });
    // delete current misspelling table
    await DictationMistake.findByIdAndUpdate(id, {
      deleted: true,
    });

    res.status(201).json({
      success: true,
      message: "Delete record successfully!"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}