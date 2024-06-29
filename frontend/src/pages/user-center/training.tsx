import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";

import { get, post } from '../../utils/fetch';

let timer:NodeJS.Timeout;
interface VocabularyData {
  chapterNo: number;
  testPaperNo: number;
  sectionNo: number;
  words: Word[];
}

interface Word {
  word: string;
  phonetic: string;
  translation: string;
  practiceCount: number;
  correct: boolean;
}


const VocabularyTraining = () => {
  const { state: { id } } = useLocation();

  const [word, setWord] = useState('');
  const [vocabularyData, setVocabularyData] = useState<VocabularyData>({
    chapterNo: 0,
    testPaperNo: 0,
    sectionNo: 0,
    words: []
  });
  const [input, setInput] = useState<string>('');
  const [coloredWord, setColoredWord] = useState<JSX.Element[]>([]);
  const [correctCount, setCorrectCount] = useState<number>(0);

  useEffect(() => {
    getDictationMistakeData();
  }, []);

  useEffect(() => {
    updateColoredWord(word);
  }, [input]);
  
  // auto play the word audio
  useEffect(() => {
    clearTimeout(timer);
    wordSpeaking()
    return () => {
      clearTimeout(timer);
      console.log('Timer cleared');
    }
  }, [word]);

  const wordSpeaking = () => {
    const voices = speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => voice.name == 'Google US English');

    const utterance = new SpeechSynthesisUtterance(word);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    } else {
      console.error('Selected voice is undefined or not found.');
      // Handle the case where selectedVoice is undefined
      return;
    }

    speechSynthesis.speak(utterance);
    timer = setTimeout(wordSpeaking, 3000);
  }

  // Get DictationMistake data via id;
  const getDictationMistakeData = async () => {
    await get('/api/dictation/mistake', { id }).then(({ success, data }) => {
      if (success && data) {
        // Find the latest practice word
        const { word, practiceCount } = data.words.find((word: Word) => (!word.correct && word.practiceCount <= 1));
        setWord(word);
        setVocabularyData(data);
        setCorrectCount(practiceCount);
        updateColoredWord(word);
      }
    });
  }

  const updateColoredWord = (word: string) => {
    const newColoredWord = word.split('').map((letter: string, index: number) => {
      let color = 'black';
      if (index < input.length) {
        color = input[index] === letter ? 'green' : 'red';
      }
      return <span key={index} style={{ color }}>{letter}</span>;
    });
    setColoredWord(newColoredWord);
  };

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
    updateColoredWord(nextWord);
    // Get practice count from new word
    const practiceCount = vocabularyData.words.find(({ word }) => word === nextWord)?.practiceCount ?? 0;
    setCorrectCount(practiceCount);
  }

  const handleWordListClick = async (event: React.MouseEvent<HTMLUListElement>) => {
    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'li') {
      const selectedWord = target.textContent;
      if (selectedWord) {
        handleChangeToNextWord(selectedWord);
      }
    }
  };

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

  const { words } = vocabularyData;

  const RenderVocabularyList = () => {
    const correctClass = "text-gray-400 border-gray-400 font-normal";
    const incorrectClass = "text-[#f00] border-[#f00] font-medium";
    const practicedClass = "text-primary border-primary font-normal";
    return (
      <ul
        className='grid grid-cols-4 max-h-64 gap-2 word-list'
        onClick={handleWordListClick}>
        {
          words.map(({ word, correct, practiceCount }) => {
            let finalClass = "";
            if (correct) {
              finalClass = correctClass;
            } else if (practiceCount > 1) {
              finalClass = practicedClass
            } else {
              finalClass = incorrectClass;
            }
            return (
              <li key={word}
                className={`pl-2 border border-dashed h-8 flex items-center cursor-pointer ${finalClass} `}>
                {word}
              </li>
            )
          })
        }
      </ul>
    )
  }

  return (
    <div className='mt-4 text-center flex flex-1 flex-col'>
      <div className="inline-block">
        <h1 className="text-9xl font-black font-sans mb-6 relative">
          {coloredWord}
          {
            correctCount > 0 && (
              <span className="rounded-full bg-[#07bc0c] h-12 w-12 absolute text-3xl text-white leading-normal">
                {correctCount}
              </span>
            )
          }
        </h1>
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