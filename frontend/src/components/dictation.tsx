import { useRef, useState, useEffect } from 'react';
import classNames from 'classnames';
import { toast } from 'react-toastify';

import { CHAPTER11_PARTS } from '../utils/const';

interface Props {
  chapterNo: number;
  testPaperNo: number;
  words: string[];
  onSubmit: (words: string[]) => {};
}

const Dictation = ({
  chapterNo,
  testPaperNo,
  words,
  onSubmit,
}: Props) => {

  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputValue, setInputValue] = useState<string>('');
  const [wordRecord, setWordRecord] = useState<string[]>([]);
  const [wordIndex, setWordIndex] = useState(-1);

  const localStorageKey = `Chapter${chapterNo}_TestPaper${testPaperNo}`;

  // initial word record
  useEffect(() => {
    setWordRecord(words);
  }, [words])

  const handleLoadCacheData = () => {
    const localCacheData = localStorage.getItem(localStorageKey) || '{}';
    const { words } = JSON.parse(localCacheData);
    setWordRecord(words);
  }

  const handleMouseOver = () => {
    inputRef.current?.focus();
  };

  // onChange
  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
  }

  // scroll words list to bottom
  const scrollToBottom = () => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  };

  // cache the dictation
  const saveDictation = (words: string[]) => {
    localStorage.setItem(localStorageKey, JSON.stringify({
      words,
      chapterNo: chapterNo,
      testPaperNo: testPaperNo
    }));
  }

  // Switch next word to training
  const handleWordListClick = (word: string, index: number) => {
    setInputValue(word);
    setWordIndex(index);
    console.log(word, index);
    inputRef.current?.focus();
  };

  // on type Enter
  const hanldeKeyUp = (event: any) => {
    if (event.key === 'Enter') {
      const value = inputValue.trim();
      const newWordRecord = [...wordRecord];
      // edit current word
      if (wordIndex > -1) {
        newWordRecord[wordIndex] = value;
      } else {
        // add new word
        newWordRecord.push(value);
        setTimeout(scrollToBottom, 0);
      }
      setWordRecord(newWordRecord);
      saveDictation(newWordRecord);
      setInputValue('');
      setWordIndex(-1);
    }
  }

  // insert a word after current word
  const handleAddWord = () => {
    if (wordIndex < 0) {
      toast.warning("Please select a word which you want to insert a new word after.");
      return;
    }
    const newVocabularyList = [...wordRecord];
    newVocabularyList.splice(wordIndex + 1, 0, "");
    setWordRecord(newVocabularyList);
    setWordIndex(wordIndex + 1);
    setInputValue("");
    inputRef.current?.focus();
  }

  // delete a word
  const handleDeleteWord = () => {
    if (wordIndex < 0) {
      toast.warning("Please select a word which you want to delete.");
      return;
    }
    const newVocabularyList = [...wordRecord];
    newVocabularyList.splice(wordIndex, 1);
    setWordRecord(newVocabularyList);
    setWordIndex(-1);
    setInputValue("");
  }

  // on submit
  const handleSubmit = async () => {
    console.log("submit");
  }

  const RenderDictationRecord = () => {
    // Set grid column number fixed tailwind grid-cols-[nums] not working at 2024-07-01 15:53:00
    let gridColsNumber = "repeat(4, 1fr)";
    if (chapterNo === 5 && testPaperNo < 12) {
      gridColsNumber = "repeat(3, 1fr)";
    }
    // render chapter 11
    if (chapterNo === 11) {
      const [part1Count] = CHAPTER11_PARTS[`section${testPaperNo}`];
      return (
        <div className="max-h-64">
          <ul className={`relative grid gap-2 word-list`} style={{ gridTemplateColumns: gridColsNumber }}>
            {
              wordRecord.slice(0, part1Count).map((word, index) => (
                <li key={word + index}
                  className={classNames(
                    'pl-2 border border-secondary-700 border-dashed min-h-8 flex items-center text-primary font-normal cursor-pointer',
                    { 'bg-secondary-200': wordIndex === index }
                  )}
                  onClick={() => { handleWordListClick(word, index) }}>
                  {word}
                </li>
              ))
            }
          </ul>
          {wordRecord.length > part1Count ? <hr className="my-2" /> : null}
          <ul className={`grid gap-2 word-list`} style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
            {
              wordRecord.slice(part1Count).map((word, index) => (
                <li key={word + (part1Count + index)}
                  className={classNames(
                    'pl-2 border border-secondary-700 border-dashed min-h-8 flex items-center text-primary font-normal cursor-pointer',
                    { 'bg-secondary-200': wordIndex === (part1Count + index) }
                  )}
                  onClick={() => { handleWordListClick(word, part1Count + index) }}>
                  {word}
                </li>
              ))
            }
          </ul>
        </div>
      )
    }
    return (
      <ul
        className={`grid max-h-64 gap-2 word-list`}
        style={{ gridTemplateColumns: gridColsNumber }}>
        {
          wordRecord.map((word, index) => (
            <li key={word + index}
              className={classNames(
                'pl-2 border border-secondary-700 border-dashed min-h-8 flex items-center text-primary font-normal cursor-pointer',
                { 'bg-secondary-200': wordIndex === index }
              )}
              onClick={() => { handleWordListClick(word, index) }}>
              {word}
            </li>
          ))
        }
      </ul>
    )
  }

  return (
    <div className="container flex flex-col mx-auto h-full px-4 max-w-screen-lg">
      <div className='flex-1 overflow-auto scroll-smooth' ref={contentRef}>
        <RenderDictationRecord />
      </div>
      <hr className="my-3" />
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-5">
          Actions:
          <button className="text-sm text-primary hover:underline"
            onClick={handleAddWord}>
            Insert
          </button>
          <button className="text-sm text-primary hover:underline"
            onClick={handleDeleteWord}>
            Delete
          </button>
          <button className="text-sm text-primary hover:underline"
            onClick={handleLoadCacheData}>
            Load Cache
          </button>
        </div>
        <span>
          Word Count: {wordRecord.length}
        </span>
      </div>
      <div className='flex gap-3 justify-center'>
        <input
          ref={inputRef}
          type="text"
          className='px-3 py-2 outline-primary text-center w-full'
          autoFocus
          placeholder='Press Enter key to save'
          onChange={handleInputChange}
          onKeyUp={hanldeKeyUp}
          value={inputValue}
          onMouseOver={handleMouseOver}
        />
        <input
          type="button"
          value="Submit"
          className={classNames(
            "bg-primary px-8 text-white rounded",
            { "cursor-pointer hover:bg-secondary-700": wordRecord.length, },
            { "cursor-not-allowed bg-secondary-500": !wordRecord.length }
          )}
          disabled={!wordRecord.length}
          onClick={() => { onSubmit(wordRecord) }}
        />
      </div>
    </div>
  )
}

export default Dictation;