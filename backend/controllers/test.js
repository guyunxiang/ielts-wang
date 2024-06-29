const Test = require('../models/test');
const VocabularyList = require("../models/vocabularyList");
const DictationMistake = require("../models/dictationMistake");

// save paper test
exports.savePaperTest = async (req, res) => {
  try {

    const {
      session: { userId }
    } = req;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in first!"
      });
    }

    const {
      chapter,
      paper,
      words,
    } = req.body;

    const newTest = new Test({
      chapterNo: chapter,
      paperNo: paper,
      words,
      userId,
      createAt: new Date(),
    });

    await newTest.save();

    res.status(201).json({
      success: true,
      message: "success"
    });

    // to do create a misspelled words record
    await createMisspelledWords(chapter, paper, words, userId);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while registering user",
    });
  }
}

// create misspelled words table
const createMisspelledWords = async (chapter, paper, testWords, userId) => {
  try {
    // Fetch the vocabulary list for this chapter and paper
    const vocabularyList = await VocabularyList.findOne({ chapterNo: chapter, testPaperNo: paper });

    if (!vocabularyList) {
      throw new Error('Vocabulary list not found');
    }

    // Compare test words with vocabulary list
    const misspelledWords = vocabularyList.words.filter(vocabWord =>
      !testWords.some(testWord => testWord.toLowerCase() === vocabWord.word.toLowerCase())
    );

    // Calculate accuracy rate
    const accuracyCount = (vocabularyList.words.length - misspelledWords.length);
    const accuracyRate = (accuracyCount / vocabularyList.words.length) * 100;

    // Create new DictationMistake record
    const newMistake = new DictationMistake({
      chapterNo: chapter,
      testPaperNo: paper,
      accuracyRate: accuracyRate,
      accuracyCount: accuracyCount,
      words: misspelledWords.map(word => ({
        word: word.word,
        practiceCount: 1
      })),
      userId
    });

    await newMistake.save();

    console.log('Misspelled words record created successfully');
  } catch (error) {
    console.error('Error creating misspelled words record:', error);
    throw error;
  }
}