const User = require("../models/user");
const bcrypt = require("bcrypt");
const DictationMistake = require('../models/dictationMistake');
const VocabularyList = require('../models/vocabularyList');

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
    });
  } catch (error) {
    console.log(error);
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.status(200).send({
      success: true,
    });
  });
};

// Get dictation mistake by id
exports.getDictationMistakeById = async (req, res) => {
  try {

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

    // Merge the data
    const mergedWords = vocabularyList.words.map(vocabWord => {
      const mistakeWord = dictationMistake.words.find(w => w.word === vocabWord.word);
      return {
        word: vocabWord.word,
        phonetic: vocabWord.phonetic || '',
        translation: vocabWord.translation || '',
        practiceCount: mistakeWord ? mistakeWord.practiceCount : 0,
        correct: !mistakeWord
      };
    });

    // Prepare the response data
    const responseData = {
      chapterNo: dictationMistake.chapterNo,
      testPaperNo: dictationMistake.testPaperNo,
      sectionNo: dictationMistake.sectionNo,
      words: mergedWords
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

// Update practice count
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