import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from "react-router-dom";
import copy from 'clipboard-copy';
import classNames from 'classnames';
import { toast } from 'react-toastify';

import { get, post } from '../../utils/fetch';
import { CHAPTER11_PARTS } from '../../utils/const';

let timer: number;
interface VocabularyData {
  chapterNo: number;
  testPaperNo: number;
  words: Word[];
  trainingDuration?: number;
}

interface Word {
  id: string;
  word: string;
  mistakeWordId: string;
  misspelling: string;
  phonetic: string;
  translation: string;
  practiceCount: number;
  correct: boolean;
  trainingDuration: number;
}

const VocabularyTraining = () => {

  // Get dictation id from url
  const { id } = useParams<{ id: string }>();

  const vocabularyListRef = useRef<HTMLUListElement>(null);
  const wordRefs = useRef<{ [key: string]: HTMLLIElement | null }>({});

  const [vocabularyData, setVocabularyData] = useState<VocabularyData>({
    chapterNo: 0,
    testPaperNo: 0,
    words: []
  });
  const [word, setWord] = useState('');
  const [input, setInput] = useState<string>('');
  // vocabulary word id
  const [wordId, setWordId] = useState("");
  // mistake word id
  const [mistakeWordId, setMistakeWordId] = useState("");
  const [coloredWord, setColoredWord] = useState<JSX.Element[]>([]);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [paused, setPaused] = useState(true);
  const [editStatus, setEditStatus] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [totalPracticeCount, setTotalPracticeCount] = useState(0);
  const [totalTrainingDuration, setTotalTrainingDuration] = useState(0);

  useEffect(() => {
    // Get DictationMistake data via id;
    const getDictationMistakeData = async () => {
      await get('/api/dictation/mistake', { id }).then(({ success, data }) => {
        if (success && data) {
          // Find the latest practice word
          const foundWord = data.words.find((word: Word) => (!word.correct && word.practiceCount <= 1));
          setVocabularyData(data);
          if (foundWord) {
            const { id, word, mistakeWordId, practiceCount } = foundWord;
            setWord(word);
            setWordId(id);
            setMistakeWordId(mistakeWordId);
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
        let color = input.length ? 'var(--background-color)' : 'black';
        if (index < input.length) {
          color = input[index].toLocaleLowerCase() === letter.toLocaleLowerCase() ? 'green' : 'red';
        }
        return <span key={index} style={{ color }} className="cursor-pointer">{letter}</span>;
      });
      setColoredWord(newColoredWord);
    };
    updateColoredWord(word);
  }, [input, word]);

  // Start timer when start typing
  useEffect(() => {
    if (!startTime && (input || editStatus)) {
      setStartTime(Date.now());
    }
  }, [input, startTime, editStatus]);

  // Speak word when paused is false
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

  // Update total practice count and training duration
  useEffect(() => {
    const totalPracticeCount = vocabularyData.words.reduce((acc, { practiceCount }) => acc + (practiceCount || 0), 0);
    const totalTrainingDuration = vocabularyData.words.reduce((acc, { trainingDuration }) => acc + (trainingDuration || 0), 0);
    setTotalPracticeCount(totalPracticeCount);
    setTotalTrainingDuration(totalTrainingDuration);
  }, [vocabularyData]);

  // Update practice count into local vocabulary data
  const updateVocabularyData = (duration: number) => {
    setVocabularyData(prevData => {
      const updatedWords = prevData.words.map((item) => {
        if (item.word === word) {
          return { ...item, practiceCount: correctCount, trainingDuration: duration };
        }
        return item;
      });
      return { ...prevData, words: updatedWords };
    });
  }

  // Update practice count and training duration
  const updatePracticeRecord = async () => {
    // if no start time - no change, return
    if (!startTime) return;
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    const { success, message } = await post("/api/dictation/practiceRecord/update", {
      id,
      wordId: mistakeWordId,
      trainingDuration: duration,
      practiceCount: correctCount
    }, {
      method: "PUT"
    });
    if (!success) {
      toast.error(message);
      return;
    }
    updateVocabularyData(duration);
  }

  // Select next word
  const handleChangeToNextWord = async (nextWord: string, id: string, mistakeId: string) => {
    // Update practice record to database
    await updatePracticeRecord();

    setInput('');
    setWord(nextWord);
    setStartTime(null);
    setWordId(id ?? "");
    setMistakeWordId(mistakeId ?? "");
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
    const { value } = e.target;
    // Only update value when type a-z A-Z space and dash
    if (/^[a-zA-Z\s'-]*$/.test(value)) {
      setInput(e.target.value);
    }
  };

  // On key press Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Submit word when press Enter key
    if (e.key === 'Enter') {
      if (input.toLocaleLowerCase() === word.toLocaleLowerCase()) {
        setInput('');
        setCorrectCount(correctCount + 1);
      }
    }
    // shortcut key for play or pause audio
    if (e.key === '9') {
      handlePauseAudio();
    }
    // shortcut key for edit translation
    if (e.key === '0') {
      setEditStatus(true);
      // Pasue audio during edit translation
      setPaused(true);
    }
  };

  // on Press Tab key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      let nextWord = "";
      let nextId = "";
      let nextWordMistakeId = "";
      const { words } = vocabularyData;
      const currentIndex = words.findIndex((item) => item.word === word);
      words.forEach((item, index) => {
        if (!item.correct && index > currentIndex && !nextWord) {
          nextWord = item.word;
          nextId = item.id;
          nextWordMistakeId = item.mistakeWordId;
        }
      });
      handleChangeToNextWord(nextWord, nextId, nextWordMistakeId);

      if (nextWord && vocabularyListRef.current && wordRefs.current[nextWord]) {
        wordRefs.current[nextWord]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }

  // copy the word
  const handleCopyWord = () => {
    copy(word);
    toast.success("Copied to clipboard.");
  }

  // Validate if there is no change in translation
  const validateNoChangeTranslation = (value: string) => {
    const description = vocabularyData.words.find((item: Word) => item.id === wordId)?.translation;
    if (value.trim() === description?.trim()) {
      setEditStatus(false);
      return false;
    };
    return true;
  }

  // On blur translation input
  const handleOnBlur = (e: any) => {
    const { value } = e.target;
    if (!validateNoChangeTranslation(value)) return;
    handleSubmitTranslation(value);
  }

  // Submit translation
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
    setPaused(false);
  }

  // On key up translation input
  const handleKeyUpTranslation = async (e: any) => {
    if (e.key === "Enter") {
      const { value } = e.target;
      if (!validateNoChangeTranslation(value)) return;
      handleSubmitTranslation(value);
    }
  }

  // Transform spelling word
  const transformSpellingWord = (misspelling: string = "", word: string, practiceCount: number) => {
    if (practiceCount > 1) {
      return (
        <span key={word} className="cursor-pointer inline-block text-primary">
          {word}
        </span>
      )
    }
    if (!misspelling) { return word }
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

  // Render vocabulary list
  const renderVocabularyList = () => {
    const correctClass = "text-gray-400 border-gray-400 font-normal";
    const incorrectClass = "text-[#f00] border-[#f00] font-medium";
    const practicedClass = "text-primary border-primary font-medium";
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
          <ul
            className="flex flex-col gap-3"
            style={{ gridTemplateColumns: gridColsNumber }}
            ref={vocabularyListRef}>
            {
              words.slice(0, part1Count).map(({ id, word, mistakeWordId, misspelling, correct, practiceCount }) => (
                <li key={id}
                  className={classNames(
                    "pl-2 border border-dashed min-h-8 text-left flex items-center cursor-pointer",
                    correct ? correctClass : practiceCount > 1 ? practicedClass : incorrectClass
                  )}
                  ref={el => wordRefs.current[word] = el}
                  onClick={() => handleChangeToNextWord(word, id, mistakeWordId)}>
                  {transformSpellingWord(misspelling, word, practiceCount)}
                </li>
              ))
            }
          </ul>
          {words.length > part1Count ? <hr className="my-2" /> : null}
          <ul
            className="flex flex-col gap-3"
            style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
            ref={vocabularyListRef}>
            {
              words.slice(part1Count).map(({ id, word, mistakeWordId, misspelling, correct, practiceCount }) => (
                <li key={id}
                  className={classNames(
                    "pl-2 border border-dashed min-h-8 text-left flex items-center cursor-pointer",
                    correct ? correctClass : practiceCount > 1 ? practicedClass : incorrectClass
                  )}
                  ref={el => wordRefs.current[word] = el}
                  onClick={() => handleChangeToNextWord(word, id, mistakeWordId)}>
                  {transformSpellingWord(misspelling, word, practiceCount)}
                </li>
              ))
            }
          </ul>
        </div>
      )
    }
    return (
      <ul
        className='max-h-64 flex flex-col gap-3'
        style={{ gridTemplateColumns: gridColsNumber }}
        ref={vocabularyListRef}>
        {
          words.map(({ id, word, mistakeWordId, misspelling, correct, practiceCount }) => (
            <li key={id}
              data-word={word}
              className={classNames(
                "pl-2 border border-dashed min-h-8 text-left flex items-center cursor-pointer",
                correct ? correctClass : practiceCount > 1 ? practicedClass : incorrectClass
              )}
              ref={el => wordRefs.current[word] = el}
              onClick={() => handleChangeToNextWord(word, id, mistakeWordId)}>
              {transformSpellingWord(misspelling, word, practiceCount)}
            </li>
          ))
        }
      </ul>
    )
  }

  // Render description, add translation to current word
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
          className='outline-none px-2 py-1 w-full text-center bg-transparent'
          autoFocus
          defaultValue={text}
          onBlur={handleOnBlur}
          onKeyUp={handleKeyUpTranslation} />
      )
    }
    return <span onClick={() => { setEditStatus(true) }}>{description}</span>
  }

  // Render basic info, play/pause button, accuracy rate, accuracy count
  const renderBasicInfo = () => {
    const accuracyCount = vocabularyData.words.filter(({ correct }) => correct).length;
    const accuracyRate = (accuracyCount / (vocabularyData.words.length) * 100).toFixed(2);
    return (
      <div className='flex justify-between'>
        {
          word && (
            <button
              className='px-3 text-primary border rounded border-primary'
              tabIndex={-1}
              onClick={handlePauseAudio}>
              {paused ? "Play" : "Pause"}
            </button>
          )
        }
        <div className='container mx-auto text-right'>
          <span className='mr-3'>Accuracy Rate: {accuracyRate}%</span>
          <span>Accuracy Count: {accuracyCount} / {vocabularyData.words.length}</span>
        </div>
      </div>
    )
  }

  // Render paper name
  const renderPaperName = () => {
    const { chapterNo, testPaperNo } = vocabularyData;
    return (
      <div className="flex items-center justify-between gap-3 ">
        <Link to="/user-center" className='hover:text-primary'>
          {'<'} Back
        </Link>
        <h2>
          Chapter {chapterNo}
          &nbsp;-&nbsp;
          {
            chapterNo === 11 ?
              `Section ${testPaperNo}` :
              `Test Paper ${testPaperNo}`
          }
        </h2>
      </div>
    )
  }

  // Transform duration to HH:MM:SS
  const transformDuration = (trainingDuration?: number) => {
    if (trainingDuration === undefined) return "00:00:00";
    const hours = Math.floor(trainingDuration / 3600);
    const minutes = Math.floor((trainingDuration % 3600) / 60);
    const seconds = parseInt((trainingDuration % 60).toFixed(0));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Render remain word count
  const renderRemainWordCount = () => {
    const remainWords = vocabularyData.words.reduce((acc, { correct, practiceCount }) => (
      acc + (practiceCount <= 1 && !correct ? 1 : 0)
    ), 0);
    return `Remain: ${remainWords} words`;
  }

  return (
    <div className='container mx-auto px-3 mt-4 text-center flex flex-1 gap-3'>
      <div className="w-1/3 overflow-auto max-w-80">
        {renderVocabularyList()}
      </div>
      <div className='flex flex-1 flex-col gap-3'>
        {renderPaperName()}
        <hr />
        <div className='flex justify-between'>
          <p>Training duration: {transformDuration(totalTrainingDuration)}</p>
          <p>{renderRemainWordCount()}</p>
          <p>Total training: {totalPracticeCount} times</p>
        </div>
        <div className="relative flex flex-1 flex-col justify-center items-center gap-3">
          <h1 className="text-5xl font-black relative" style={{ fontFamily: 'serif' }} onClick={handleCopyWord}>
            {coloredWord}
            {
              correctCount > 0 && (
                <span className="rounded-full bg-[#07bc0c] h-8 w-8 ml-2 absolute text-xl text-white leading-normal">
                  {correctCount}
                </span>
              )
            }
          </h1>
          <div className='h-10 w-full flex items-center justify-center'>
            {renderDescription()}
          </div>
        </div>
        <div className="tips flex items-end justify-between gap-3">
          <p className='text-left text-xs text-gray-500'>
            Key 9: Play/Pause, 0: Edit Translation
          </p>
        </div>
        <hr />
        <div>
          {renderBasicInfo()}
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