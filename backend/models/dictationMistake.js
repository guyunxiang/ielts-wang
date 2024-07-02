const mongoose = require('mongoose');

const WordSchema = new mongoose.Schema({
    word: {
        type: String,
        required: true
    },
    practiceCount: {
        type: Number,
        default: 0
    }
});

const DictationMistakeSchema = new mongoose.Schema({
    chapterNo: {
        type: Number,
        required: true
    },
    testPaperNo: {
        type: Number,
        required: false
    },
    sectionNo: {
        type: Number,
        required: false
    },
    accuracyCount: {
        type: Number,
        required: true
    },
    accuracyRate: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    words: [WordSchema],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true
    }
}, { timestamps: true });

const DictationMistake = mongoose.model('DictationMistake', DictationMistakeSchema);

module.exports = DictationMistake;