const Test = require('../models/test');
const VocabularyList = require("../models/vocabularyList");
const DictationMistake = require("../models/dictationMistake");
const Whitelist = require('../models/whitelist');

const testController = require("./test");

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

    // to do create a misspelled words record
    await testController.createMisspelledWords(_id);

    res.status(201).json({
      success: true,
      message: "Submit successfully!"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "",
    });
  }
}

const calculateMisspelledData = async (testWords, vocabularyList, originalWords) => {

  // TODO, version 18
  const { whitelist } = await Whitelist.findOne({ version: 18 }).select("whitelist") ?? { whitelist: WHITELIST };

  // ignore plural
  const ignorePlural = (word) => {
    const lowercaseWord = word.toLowerCase();
    if (lowercaseWord.endsWith('ies')) {
      return lowercaseWord.slice(0, -3) + 'y';
    } else if (lowercaseWord.endsWith('ses') || lowercaseWord.endsWith('xes') || lowercaseWord.endsWith('ches') || lowercaseWord.endsWith('shes')) {
      return lowercaseWord.slice(0, -2);
    } else if (lowercaseWord.endsWith('s') && lowercaseWord.length > 3 && !lowercaseWord.endsWith('ss')) {
      return lowercaseWord.slice(0, -1);
    }
    return lowercaseWord;
  };

  const wordsMatch = (word1, word2) => {
    return ignorePlural(word1) === ignorePlural(word2);
  };

  const misspelledWords = vocabularyList.words.filter(vocabWord => {
    const normalizedVocabWord = vocabWord.word.toLowerCase();

    return !testWords.some(testWord => {
      const normalizedTestWord = testWord.toLowerCase();

      // Check for exact match
      if (wordsMatch(normalizedVocabWord, normalizedTestWord)) {
        return true;
      }

      // Check against whitelist
      return whitelist.some(pair =>
        (wordsMatch(normalizedTestWord, pair.original) &&
          pair.alternative.some(alt => wordsMatch(alt, normalizedVocabWord))) ||
        (wordsMatch(normalizedVocabWord, pair.original) &&
          pair.alternative.some(alt => wordsMatch(alt, normalizedTestWord)))
      );
    });
  });

  // Calculate accuracy rate
  const accuracyCount = testWords.length - misspelledWords.length;
  const accuracyRate = (accuracyCount / testWords.length) * 100;

  // Get original practice count for each misspelled word
  const getOriginalPracticeCount = (word) => {
    const { practiceCount } = originalWords.find(originalWord => wordsMatch(originalWord.word, word));
    return practiceCount || 0;
  }

  return {
    accuracyRate: accuracyRate.toFixed(2),
    accuracyCount: accuracyCount,
    words: misspelledWords.map(word => ({
      word: word.word,
      practiceCount: getOriginalPracticeCount(word.word),
    })),
  }
}

// create misspelled words table
exports.createMisspelledWords = async (testId, misspelledRecordId) => {
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

    // Fetch original misspelled record
    const originalMisspelledRecord = await DictationMistake.findById(misspelledRecordId);

    let newMistake;
    const misspelledRecord = await calculateMisspelledData(words, vocabularyList, originalMisspelledRecord.words);
    if (!misspelledRecordId) {
      // Create new DictationMistake record
      newMistake = new DictationMistake({
        chapterNo: chapterNo,
        testPaperNo: paperNo,
        ...misspelledRecord,
        userId,
        testId,
      });
      await newMistake.save();
    } else {
      newMistake = await DictationMistake.findByIdAndUpdate(
        misspelledRecordId,
        misspelledRecord,
        { new: true }
      );
    }
    console.log('Misspelled words record created successfully');
  } catch (error) {
    console.error('Error creating misspelled words record:', error);
    throw error;
  }
}