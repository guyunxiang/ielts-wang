import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import copy from 'clipboard-copy';

import { get, post } from '../../utils/fetch';
import { toast } from 'react-toastify';
import { CHAPTER11_PARTS } from '../../utils/const';

let timer: number;
interface VocabularyData {
  chapterNo: number;
  testPaperNo: number;
  words: Word[];
}

interface Word {
  id: string;
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
    words: []
  });
  const [word, setWord] = useState('');
  const [input, setInput] = useState<string>('');
  const [wordId, setWordId] = useState("");
  const [coloredWord, setColoredWord] = useState<JSX.Element[]>([]);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [paused, setPaused] = useState(true);
  const [editStatus, setEditStatus] = useState(false);

  useEffect(() => {
    // Get DictationMistake data via id;
    const getDictationMistakeData = async () => {
      await get('/api/dictation/mistake', { id }).then(({ success, data }) => {
        if (success && data) {
          // Find the latest practice word
          const foundWord = data.words.find((word: Word) => (!word.correct && word.practiceCount <= 1));
          setVocabularyData(data);
          if (foundWord) {
            const { id, word, practiceCount } = foundWord;
            setWord(word);
            setWordId(id);
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
          color = input[index].toLocaleLowerCase() === letter.toLocaleLowerCase() ? 'green' : 'red';
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
  const handleChangeToNextWord = async (nextWord: string, id: string) => {
    // Update practice count to database
    await updatePracticeCount();
    // Update practice count to local data
    updateLocalVocabularyData();
    setWord(nextWord);
    setInput('');
    setWordId(id ?? "");
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
      if (input.toLocaleLowerCase() === word.toLocaleLowerCase()) {
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
      let nextId = "";
      const { words } = vocabularyData;
      const currentIndex = words.findIndex((item) => item.word === word);
      words.forEach((item, index) => {
        if (!item.correct && index > currentIndex && !nextWord) {
          nextWord = item.word;
          nextId = item.id;
        }
      });
      handleChangeToNextWord(nextWord, nextId);
    }
  }

  // copy the word
  const handleCopyWord = () => {
    copy(word);
    toast.success("Copied to clipboard.");
  }

  const validateNoChangeTranslation = (value: string) => {
    const description = vocabularyData.words.find((item: Word) => item.id === wordId)?.translation;
    if (value.trim() === description?.trim()) {
      setEditStatus(false);
      return false;
    };
    return true;
  }

  const handleOnBlur = (e: any) => {
    const { value } = e.target;
    if (!validateNoChangeTranslation(value)) return;
    handleSubmitTranslation(value);
  }

  const handleSubmitTranslation = async (text: string) => {
    const newVocabularyData = { ...vocabularyData };
    newVocabularyData.words.forEach((item) => {
      if (item.id === wordId) {
        item.translation = text.trim();
      }
    });
    const { chapterNo, testPaperNo } = newVocabularyData;
    const { success, message } = await post("/api/vocabulary/word/update", {
      chapterNo,
      testPaperNo,
      translation: text.trim(),
      wordId,
    }, { method: "PUT" });
    if (!success) {
      toast.error(message);
      return;
    }
    setVocabularyData(newVocabularyData);
    setEditStatus(false);
  }

  const handleKeyUpTranslation = async (e: any) => {
    if (e.key === "Enter") {
      const { value } = e.target;
      if (!validateNoChangeTranslation(value)) return;
      handleSubmitTranslation(value);
    }
  }

  const transformSpellingWord = (misspelling: string = "", word: string, practiceCount: number) => {
    if (!misspelling) { return word }
    if (practiceCount > 1) {
      return (
        <span key={word} className="cursor-pointer inline-block text-primary">
          {word}
        </span>
      )
    }
    return misspelling.split("").map((letter, index) => {
      let color = '';
      if (index < word.length) {
        color = word[index].toLocaleLowerCase() === letter.toLocaleLowerCase() ? 'green' : 'red';
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
    }
    // render chapter 11
    if (chapterNo === 11) {
      const [part1Count] = CHAPTER11_PARTS[`section${testPaperNo}`];
      return (
        <div className="max-h-64">
          <ul className="flex flex-col gap-3" style={{ gridTemplateColumns: gridColsNumber }}>
            {
              words.slice(0, part1Count).map(({ id, word, misspelling, correct, practiceCount }) => (
                <li key={id} className={`pl-2 border border-dashed min-h-8 text-left flex items-center cursor-pointer ${correct ? correctClass : incorrectClass}`}
                  onClick={() => handleChangeToNextWord(word, id)}>
                  {transformSpellingWord(misspelling, word, practiceCount)}
                </li>
              ))
            }
          </ul>
          {words.length > part1Count ? <hr className="my-2" /> : null}
          <ul className="flex flex-col gap-3" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
            {
              words.slice(part1Count).map(({ id, word, misspelling, correct, practiceCount }) => (
                <li key={id} className={`pl-2 border border-dashed min-h-8 text-left flex items-center cursor-pointer ${correct ? correctClass : incorrectClass}`}
                  onClick={() => handleChangeToNextWord(word, id)}>
                  {transformSpellingWord(misspelling, word, practiceCount)}
                </li>
              ))
            }
          </ul>
        </div>
      )
    }
    return (
      <ul style={{ gridTemplateColumns: gridColsNumber }}
        className='max-h-64 flex flex-col gap-3'>
        {
          words.map(({ id, word, misspelling, correct, practiceCount }) => (
            <li key={id}
              data-word={word}
              className={`pl-2 border border-dashed min-h-8 text-left flex items-center cursor-pointer ${correct ? correctClass : incorrectClass}`}
              onClick={() => handleChangeToNextWord(word, id)}>
              {transformSpellingWord(misspelling, word, practiceCount)}
            </li>
          ))
        }
      </ul>
    )
  }

  const renderDescription = () => {
    if (!wordId) return null;
    const { chapterNo, testPaperNo } = vocabularyData;
    const description = vocabularyData.words.find((item: Word) => item.id === wordId)?.translation;
    if (!description && !editStatus) {
      return (
        <button
          className='text-primary hover:underline'
          onClick={() => { setEditStatus(true) }}>
          Add
        </button>
      )
    }
    if (editStatus) {
      let text = "";
      if (description) {
        text = description
      } else {
        if (chapterNo === 3) {
          text = "n. ";
        } else if (chapterNo === 4) {
          text = testPaperNo <= 3 ? "adj. " : "adv. ";
        }
      }
      return (
        <input
          type="text"
          className='outline-none px-2 py-1 text-center'
          autoFocus
          defaultValue={text}
          onBlur={handleOnBlur}
          onKeyUp={handleKeyUpTranslation} />
      )
    }
    return <span onClick={() => { setEditStatus(true) }}>{description}</span>
  }

  const RenderBasicInfo = () => {
    const accuracyCount = vocabularyData.words.filter(({ correct }) => correct).length;
    const accuracyRate = (accuracyCount / (vocabularyData.words.length) * 100).toFixed(2);
    return (
      <div className='flex justify-between'>
        {
          word ? (
            <button className='px-3 text-primary border rounded border-primary' tabIndex={-1} onClick={handlePauseAudio}>
              {paused ? "Play" : "Pause"}
            </button>
          ) : null
        }
        <div className='container mx-auto text-right'>
          <span className='mr-3'>Accuracy Rate: {accuracyRate}%</span>
          <span>Accuracy Count: {accuracyCount} / {vocabularyData.words.length}</span>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-3 mt-4 text-center flex flex-1 gap-3'>
      <div className="w-1/3 overflow-auto max-w-80">
        <RenderVocabularyList />
      </div>
      <div className='flex flex-1 flex-col gap-3'>
        <div className="relative flex flex-1 flex-col justify-center items-center gap-3">
          <h1 className="text-5xl font-black font-sans relative" onClick={handleCopyWord}>
            {coloredWord}
            {
              correctCount > 0 && (
                <span className="rounded-full bg-[#07bc0c] h-8 w-8 absolute text-xl text-white leading-normal">
                  {correctCount}
                </span>
              )
            }
          </h1>
          <div className='h-10 flex items-center'>
            {renderDescription()}
          </div>
        </div>
        <hr />
        <div>
          <RenderBasicInfo />
        </div>
        <div className='container mx-auto flex gap-8 justify-center'>
          <input
            type="text"
            className='w-full px-3 py-2 outline-primary text-center'
            autoFocus
            placeholder='Press Enter key to practice'
            value={input}
            onChange={handleInputChange}
            onKeyUp={handleKeyPress}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </div>
  )
}

export default VocabularyTraining;