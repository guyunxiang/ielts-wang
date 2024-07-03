import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import copy from 'clipboard-copy';

import { get, post } from '../../utils/fetch';
import { toast } from 'react-toastify';

let timer: number;
interface VocabularyData {
  chapterNo: number;
  testPaperNo: number;
  sectionNo: number;
  words: Word[];
}

interface Word {
  word: string;
  misspelling: string;
  phonetic: string;
  translation: string;
  practiceCount: number;
  correct: boolean;
}

const VocabularyTraining = () => {
  const { state: { id } } = useLocation();

  const [vocabularyData, setVocabularyData] = useState<VocabularyData>({
    chapterNo: 0,
    testPaperNo: 0,
    sectionNo: 0,
    words: []
  });
  const [word, setWord] = useState('');
  const [input, setInput] = useState<string>('');
  const [coloredWord, setColoredWord] = useState<JSX.Element[]>([]);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // Get DictationMistake data via id;
    const getDictationMistakeData = async () => {
      await get('/api/dictation/mistake', { id }).then(({ success, data }) => {
        if (success && data) {
          // Find the latest practice word
          const foundWord = data.words.find((word: Word) => (!word.correct && word.practiceCount <= 1));
          setVocabularyData(data);
          if (foundWord) {
            const { word, practiceCount } = foundWord;
            setWord(word);
            setCorrectCount(practiceCount);
          }
        }
      });
    }
    // Get dictation mistake list
    getDictationMistakeData();
  }, [id]);

  useEffect(() => {
    // Update type status
    const updateColoredWord = (word: string) => {
      const newColoredWord = word.split('').map((letter: string, index: number) => {
        let color = 'black';
        if (index < input.length) {
          color = input[index] === letter ? 'green' : 'red';
        }
        return <span key={index} style={{ color }} className="cursor-pointer">{letter}</span>;
      });
      setColoredWord(newColoredWord);
    };
    updateColoredWord(word);
  }, [input, word]);

  useEffect(() => {
    const wordSpeaking = () => {
      clearTimeout(timer);
      if (paused) return;

      const voices = speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => voice.name === 'Google US English');

      const utterance = new SpeechSynthesisUtterance(word);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      speechSynthesis.speak(utterance);
      timer = setTimeout(wordSpeaking, 3000) as any as number;
    }
    wordSpeaking();

    return () => {
      // Stop timer when leave this page
      clearTimeout(timer);
      // console.log('Timer cleared');
    }
  }, [word, paused]);

  // Update practice count to database
  const updatePracticeCount = async () => {
    // validate if update he practice count
    let updated = false;
    vocabularyData.words.forEach((item) => {
      if (item.word === word) {
        updated = item.practiceCount < correctCount;
      }
    });
    if (!updated) return;
    await post("/api/dictation/practiceCount/update", {
      id,
      word,
      count: correctCount
    }, {
      method: "PUT"
    });
  }

  // Update practice count into local vocabulary data
  const updateLocalVocabularyData = () => {
    const words = vocabularyData.words.map((item) => {
      if (item.word === word) {
        item.practiceCount = correctCount;
      }
      return item;
    });
    setVocabularyData({
      ...vocabularyData,
      words
    });
  }

  // Select next word
  const handleChangeToNextWord = async (nextWord: string) => {
    // Update practice count to database
    await updatePracticeCount();
    // Update practice count to local data
    updateLocalVocabularyData();
    setWord(nextWord);
    setInput('');
    // Get practice count from new word
    const practiceCount = vocabularyData.words.find(({ word }) => word === nextWord)?.practiceCount ?? 0;
    setCorrectCount(practiceCount);
  }

  // On paused audio
  const handlePauseAudio = () => {
    setPaused(!paused);
  }

  // On input word
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // On key press Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (input === word) {
        setCorrectCount(prevCount => prevCount + 1);
        setInput('');
      }
    }
  };

  // on Press Tab key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      let nextWord = "";
      const { words } = vocabularyData;
      const currentIndex = words.findIndex((item) => item.word === word);
      words.forEach((item, index) => {
        if (!item.correct && index > currentIndex && !nextWord) {
          nextWord = item.word;
        }
      });
      handleChangeToNextWord(nextWord);
    }
  }

  // copy the word
  const handleCopyWord = () => {
    copy(word);
    toast.success("Copied to clipboard.");
  }

  const transformSpellingWord = (misselling: string = "", word: string, practiceCount: number) => {
    if (!misselling) { return word }
    return misselling.split("").map((letter, index) => {
      let color = '';
      if (index < word.length) {
        color = word[index] === letter ? 'green' : 'red';
      }
      if (letter === " ") {
        return (
          <span key={index} style={{ color }} className="cursor-pointer inline-block invisible">
            -
          </span>
        )
      }
      return (
        <span key={index} style={{ color }} className="cursor-pointer inline-block">
          {letter}
        </span>
      )
    })
  }

  const RenderVocabularyList = () => {
    const correctClass = "text-gray-400 border-gray-400 font-normal";
    const incorrectClass = "text-[#f00] border-[#f00] font-medium";
    const { chapterNo, testPaperNo, words } = vocabularyData;
    let gridColsNumber = "repeat(4, 1fr)";
    if (chapterNo === 5 && testPaperNo < 12) {
      gridColsNumber = "repeat(3, 1fr)";
    } else if (chapterNo === 11) {
      gridColsNumber = "repeat(2, 1fr)";
    }
    return (
      <ul style={{ gridTemplateColumns: gridColsNumber }}
        className='grid grid-cols-4 max-h-64 gap-2 word-list'>
        {
          words.map(({ word, misspelling, correct, practiceCount }) => {
            return (
              <li key={word}
                data-word={word}
                className={`pl-2 border border-dashed min-h-8 text-left flex items-center cursor-pointer ${correct ? correctClass : incorrectClass}`}
                onClick={() => handleChangeToNextWord(word) }>
                {transformSpellingWord(misspelling, word, practiceCount)}
              </li>
            )
          })
        }
      </ul>
    )
  }

  return (
    <div className='mt-4 text-center flex flex-1 flex-col'>
      <div className="inline-block relative">
        <h1 className="text-9xl font-black font-sans mb-6 relative" onClick={handleCopyWord}>
          {coloredWord}
          {
            correctCount > 0 && (
              <span className="rounded-full bg-[#07bc0c] h-12 w-12 absolute text-3xl text-white leading-normal">
                {correctCount}
              </span>
            )
          }
        </h1>
        {
          word ? (
            <button className='absolute top-0 right-0 mr-4 px-3 text-primary border rounded border-primary' onClick={handlePauseAudio}>
              {paused ? "Play" : "Pause"}
            </button>
          ) : null
        }
      </div>
      <div className="container mx-auto flex-1 justify-center gap-8 overflow-auto mb-10">
        <RenderVocabularyList />
      </div>
      <div className='flex gap-8 justify-center'>
        <input
          type="text"
          className='w-2/3 px-3 py-2 outline-primary text-center'
          autoFocus
          placeholder='Press Enter key to practice'
          value={input}
          onChange={handleInputChange}
          onKeyUp={handleKeyPress}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  )
}

export default VocabularyTraining;