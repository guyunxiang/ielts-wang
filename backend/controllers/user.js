const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

const User = require("../models/user");
const DictationMistake = require('../models/dictationMistake');
const VocabularyList = require('../models/vocabularyList');
const Test = require("../models/test");

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user) {
      res.status(401).json({
        success: false,
        message: "User already exist!",
      });
      return;
    }
    const newUser = new User({
      username,
      password
    });
    const savedUser = await newUser.save();
    // login
    req.session.userId = savedUser._id;
    res.status(200).json({
      success: true,
      message: "Sign up successfully!",
    });
  } catch (error) {
    console.log(error);
  }
}

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not exist!",
      });
      return;
    }
    const same = await bcrypt.compare(password, user.password);
    if (!same) {
      res.status(401).json({
        success: false,
        message: "Invalidate password!",
      });
      return;
    }
    req.session.userId = user._id;
    res.status(200).json({
      success: true,
      message: "Login successfully!",
      data: {
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.log(error);
  }
};

// get user info
exports.getAuthStatus = async (req, res) => {
  const { session: { userId } } = req;
  const user = await User.findById(userId)
    .select("username role -_id");
  res.status(200).json({
    success: true,
    data: user
  });
}

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.status(200).send({
      success: true,
    });
  });
};

// Get user list
exports.getUserList = async (req, res) => {
  try {
    const userList = await User.find({ role: 'user' }).select("username role");
    res.status(200).json({
      success: true,
      data: userList
    });
  } catch (error) {
    console.error('Error getting dictation mistake:', error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the dictation mistake",
      error: error.message
    });
  }
}

// Get all dictation mistake data
exports.getAllDictationMistakes = async (req, res) => {
  try {
    const {
      session: { userId }
    } = req;

    // Query all DictationMistakes for the current user
    const dictationMistakes = await DictationMistake.find({ userId });

    // If no dictation mistake is found
    if (!dictationMistakes) {
      return res.status(404).json({
        success: false,
        message: "Dictation mistake not found!"
      });
    }

    const responseData = dictationMistakes.map(({
      accuracyCount,
      accouacyRate,
      chapterNo,
      testPaperNo,
      createdAt,
      words,
      _id,
    }) => ({
      _id,
      accuracyCount,
      accouacyRate,
      chapterNo,
      testPaperNo,
      createdAt,
      vocabularyCount: words.length + accuracyCount,
      fullPractice: words.every(word => word.practiceCount > 1)
    }));

    // Transforming the data
    const transformedData = responseData.reduce((acc, curr) => {

      // Calculate accuracy rate
      const accuracyRate = (curr.accuracyCount / curr.vocabularyCount) * 100;

      // Check if entry already exists in acc
      const existingEntry = acc.find(item =>
        item.chapterNo === curr.chapterNo &&
        item.testPaperNo === curr.testPaperNo &&
        item.vocabularyCount === curr.vocabularyCount
      );

      // If entry exists, push new test data; otherwise, create new entry
      if (existingEntry) {
        existingEntry.tests.push({
          id: curr._id,
          accuracyCount: curr.accuracyCount,
          accuracyRate: +accuracyRate.toFixed(2), // Round to 2 decimal places for accuracyRate
          createdAt: curr.createdAt,
          fullPractice: curr.fullPractice,
        });
      } else {
        acc.push({
          chapterNo: curr.chapterNo,
          testPaperNo: curr.testPaperNo,
          vocabularyCount: curr.vocabularyCount,
          tests: [{
            id: curr._id,
            accuracyCount: curr.accuracyCount,
            accuracyRate: +accuracyRate.toFixed(2), // Round to 2 decimal places for accuracyRate
            createdAt: curr.createdAt,
            fullPractice: curr.fullPractice,
          }]
        });
      }

      return acc;
    }, []);

    res.status(200).json({
      success: true,
      data: transformedData
    });
  } catch (error) {
    console.error('Error getting dictation mistake:', error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the dictation mistake",
      error: error.message
    });
  }
}

exports.getDictationMistakesByChapterNo = async (req, res) => {
  try {
    const { chapterNo } = req.query;
    const highestAccuracyRecords = await DictationMistake.aggregate([
      { $match: { chapterNo: +chapterNo } },
      {
        $group: {
          _id: '$testPaperNo',
          highestAccuracyRecord: { $max: '$accuracyRate' },
          record: { $first: '$$ROOT' }
        }
      },
      {
        $project: {
          _id: 0,
          highestAccuracyRecord: 1,
          record: 1
        }
      }
    ]);

    const data = highestAccuracyRecords.map(({ highestAccuracyRecord, record }) => ({
      chapterNo: record.chapterNo,
      testPaperNo: record.testPaperNo,
      highestAccuracyRecord,
    }))

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error getting dictation mistake:', error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the dictation mistake",
      error: error.message
    });
  }
}

// Get dictation mistake by id
exports.getDictationMistakeById = async (req, res) => {
  try {

    const { id } = req.query;

    // Check if id is provided
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Dictation mistake ID is required"
      });
    }


    // Find the dictation mistake by id
    const dictationMistake = await DictationMistake.findById(id);

    // If no dictation mistake is found
    if (!dictationMistake) {
      return res.status(404).json({
        success: false,
        message: "Dictation mistake not found"
      });
    }

    const { session: { userId } } = req;

    // Validate current userId
    if (dictationMistake.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this dictation mistake"
      });
    }

    // Find the corresponding vocabulary list
    const vocabularyList = await VocabularyList.findOne({
      chapterNo: dictationMistake.chapterNo,
      testPaperNo: dictationMistake.testPaperNo
    });

    if (!vocabularyList) {
      return res.status(404).json({
        success: false,
        message: "Corresponding vocabulary list not found"
      });
    }

    const testRecord = await Test.findById(dictationMistake.testId);
    if (!testRecord) {
      return res.status(404).json({
        success: false,
        message: "Corresponding vocabulary list not found"
      });
    }

    let totalTrainingDuration = 0;

    // Merge the data
    const mergedWords = vocabularyList.words.map((vocabWord, index) => {
      const mistakeWord = dictationMistake.words.find(w => w.word === vocabWord.word);
      const result = {
        id: vocabWord._id,
        word: vocabWord.word,
        phonetic: vocabWord.phonetic || '',
        translation: vocabWord.translation || '',
        correct: !mistakeWord,
      }
      if (mistakeWord) {
        result.misspelling = testRecord.words[index];
        result.mistakeWordId = mistakeWord._id;
        result.practiceCount = mistakeWord.practiceCount;
        result.trainingDuration = mistakeWord.trainingDuration;
        totalTrainingDuration += mistakeWord.trainingDuration;
      }
      return result;
    });

    // Prepare the response data
    const responseData = {
      chapterNo: dictationMistake.chapterNo,
      testPaperNo: dictationMistake.testPaperNo,
      words: mergedWords,
      trainingDuration: totalTrainingDuration,
    };

    // Return the merged data
    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error getting dictation mistake:', error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the dictation mistake",
      error: error.message
    });
  }
};

// Update practice count of a word
exports.updatePracticeCount = async (req, res) => {
  try {
    const { id, word, count } = req.body;

    // Check if id and word are provided
    if (!id || !word) {
      return res.status(400).json({
        success: false,
        message: "Dictation mistake ID and word are required"
      });
    }

    const {
      session: { userId }
    } = req;

    // Check if user is logged in
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in first!"
      });
    }

    // Find the dictation mistake by id
    const dictationMistake = await DictationMistake.findById(id);

    // If no dictation mistake is found
    if (!dictationMistake) {
      return res.status(404).json({
        success: false,
        message: "Dictation mistake not found"
      });
    }

    // Validate current userId
    if (dictationMistake.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this dictation mistake"
      });
    }

    // Find the word in the words array and update its practiceCount
    const wordIndex = dictationMistake.words.findIndex(w => w.word === word);
    if (wordIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Word not found in this dictation mistake"
      });
    }

    // Increment the practiceCount
    dictationMistake.words[wordIndex].practiceCount = count;

    // Save the updated dictationMistake
    await dictationMistake.save();

    // Return the updated dictationMistake
    res.status(200).json({
      success: true,
      message: "Practice count updated successfully",
      data: dictationMistake
    });

  } catch (error) {
    console.error('Error updating practice count:', error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the practice count",
      error: error.message
    });
  }
};

// Update accuracy count of a dictation mistake
exports.updateWordTranslation = async (req, res) => {
  try {
    const { chapterNo, testPaperNo, translation, wordId } = req.body;
    const update = {
      'words.$.translation': translation
    };
    console.log(wordId);
    const id = new mongoose.Types.ObjectId(wordId);
    const result = await VocabularyList.findOneAndUpdate(
      { chapterNo: chapterNo, testPaperNo: testPaperNo, 'words._id': id },
      { $set: update },
      { new: true }
    );
    if (!result) {
      res.status(401).json({
        success: false,
        message: "Word not found!"
      });
      return;
    }
    res.status(201).json({
      success: true,
      message: "Word updated successfully!"
    });
  } catch (error) {
    console.error('Error updating practice count:', error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the practice count",
      error: error.message
    });
  }
}

// Update training duration of a dictation mistake
exports.updateTrainingDuration = async (req, res) => {
  try {
    const { id, wordId, duration } = req.body;
    //  Check if id, wordId, and trainingDuration are provided
    if (!id || !wordId || !duration) {
      return res.status(400).json({
        success: false,
        message: "Dictation mistake ID, word ID, and training duration are required"
      });
    }
    // Find the dictation mistake by id
    const dictationMistake = await DictationMistake.findById(id);
    if (!dictationMistake) {
      return res.status(404).json({
        success: false,
        message: "Dictation mistake not found"
      });
    }
    // Find the word in the words array and update its trainingDuration
    const wordIndex = dictationMistake.words.findIndex(w => w._id.toString() === wordId);
    if (wordIndex === -1) {
      return res.status(404).json({
      success: false,
      message: "Word not found in this dictation mistake"
      });
    }

    // Update the trainingDuration of the word
    dictationMistake.words[wordIndex].trainingDuration += duration;

    // Update the trainingDuration of the dictationMistake
    dictationMistake.trainingDuration += duration;

    // Save the updated dictationMistake
    await dictationMistake.save();

    // Return the updated dictationMistake
    res.status(200).json({
      success: true,
      message: "Training duration updated successfully",
      data: dictationMistake
    });
    
  } catch (error) {
    console.error('Error updating training duration:', error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the training duration",
      error: error.message
    });
  }
}