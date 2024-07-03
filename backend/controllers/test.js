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

    const { _id } = await newTest.save();

    res.status(201).json({
      success: true,
      message: "Submit successfully!"
    });

    // to do create a misspelled words record
    await createMisspelledWords(_id);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while registering user",
    });
  }
}

const calculateMisspelledData = (testWords, vocabularyList) => {
  // Compare test words with vocabulary list
  const whitelist = [
    { original: 'centre', alternative: 'center' },
    { original: 'booklist', alternative: 'book list' }
  ];

  // Compare test words with vocabulary list
  const misspelledWords = vocabularyList.words.filter(vocabWord =>
    !testWords.some(testWord => {
      const normalizedVocabWord = vocabWord.word.toLowerCase();
      const normalizedTestWord = testWord.toLowerCase();

      // Check if words are equal without considering the whitelist
      if (normalizedVocabWord === normalizedTestWord) {
        return false; // Exact match, not misspelled
      }

      // Check against whitelist
      for (const pair of whitelist) {
        if ((normalizedVocabWord === pair.original && normalizedTestWord === pair.alternative) ||
          (normalizedVocabWord === pair.alternative && normalizedTestWord === pair.original)) {
          return false; // Match found in whitelist, not misspelled
        }
      }

      return true; // Not found in whitelist, consider as misspelled
    })
  );

  // Calculate accuracy rate
  const accuracyCount = (vocabularyList.words.length - misspelledWords.length);
  const accuracyRate = (accuracyCount / vocabularyList.words.length) * 100;

  return {
    accuracyRate: accuracyRate,
    accuracyCount: accuracyCount,
    words: misspelledWords.map(word => ({
      word: word.word,
      practiceCount: 1
    })),
  }
}

// create misspelled words table
const createMisspelledWords = async (testId, misspelledRecordId) => {
  try {
    const testRecord = await Test.findById(testId);
    if (!testRecord) {
      throw new Error('Vocabulary list not found');
    }
    const { chapterNo, paperNo, words, userId } = testRecord;

    // Fetch the vocabulary list for this chapter and paper
    const vocabularyList = await VocabularyList.findOne({ chapterNo: chapterNo, testPaperNo: paperNo });
    if (!vocabularyList) {
      throw new Error('Vocabulary list not found');
    }

    let newMistake;
    const misspelledRecord = calculateMisspelledData(words, vocabularyList);
    if (!misspelledRecordId) {
      // Create new DictationMistake record
      newMistake = new DictationMistake({
        chapterNo: chapterNo,
        testPaperNo: paperNo,
        ...misspelledRecord,
        userId,
        testId,
      });
    } else {
      newMistake = await DictationMistake.findByIdAndUpdate(
        misspelledRecordId,
        misspelledRecord,
        { new: true }
      );
    }
    await newMistake.save();
    console.log('Misspelled words record created successfully');
  } catch (error) {
    console.error('Error creating misspelled words record:', error);
    throw error;
  }
}