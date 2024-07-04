const mongoose = require('mongoose');

const WordSchema = new mongoose.Schema({
    word: {
        type: String,
        required: true
    },
    phonetic: {
        type: String,
        required: false
    },
    translation: {
        type: String,
        required: false
    }
});

const VocabularyListSchema = new mongoose.Schema({
    chapterNo: {
        type: Number,
        required: true
    },
    testPaperNo: {
        type: Number,
        required: false
    },
    words: [WordSchema]
}, { timestamps: true });

const VocabularyList = mongoose.model('VocabularyList', VocabularyListSchema);

module.exports = VocabularyList;