import { useRef, useState, useEffect, ReactElement } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { get, post } from '../../utils/fetch';
import { TEST_PAPERS } from '../../utils/const';
import { useAuth } from "../../components/authProvider";

interface WordItem {
  word: string;
  _id: string;
}

interface VocabularyItem {
  chapterNo: number;
  testPaperNo: number;
  wordCount: number;
}

const TestPaperpage = () => {

  const contentRef = useRef<HTMLDivElement>(null);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const { state: { chapterNo, testPaperNo, wordCount } } = useLocation();

  const [inputValue, setInputValue] = useState<string>('');
  const [cache, setCache] = useState<boolean>(false);
  const [wordRecord, setWordRecord] = useState<string[]>([]);
  const [wordIndex, setWordIndex] = useState(-1);
  const [vocabularyCount, setVocabularyCount] = useState(0);

  const localStorageKey = `Chapter${chapterNo}_TestPaper${testPaperNo}`;

  // initial dictation progress
  useEffect(() => {
    const cacheData = localStorage.getItem(localStorageKey) || '{}';
    const { words, chapter, paper } = JSON.parse(cacheData);
    if (chapter !== chapterNo || paper !== testPaperNo) return;
    if (!words) return;
    setCache(true);
  }, [chapterNo, testPaperNo, localStorageKey]);

  useEffect(() => {
    const loadVocabularyListWordCount = () => {
      const localDataStr: string = sessionStorage.getItem("vocabularyCounts") ?? "[]";
      const localData = JSON.parse(localDataStr);
      const count = localData.filter((item: VocabularyItem) => (item.chapterNo === chapterNo && item.testPaperNo === testPaperNo))[0]?.wordCount;
      setVocabularyCount(count);
    }
    loadVocabularyListWordCount();
  }, [chapterNo, testPaperNo])

  // validate correct chapter and test paper
  if (!testPaperNo || chapterNo < 2 || chapterNo > 12) {
    navigate("/Chapters");
    return null;
  }

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
    const data = {
      words,
      chapter: chapterNo,
      paper: testPaperNo
    };
    localStorage.setItem(localStorageKey, JSON.stringify(data));
  }

  // Switch next word to training
  const handleWordListClick = async (event: React.MouseEvent<HTMLUListElement>) => {
    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'li') {
      const word = target.textContent;
      if (word) {
        setInputValue(word);
        setWordIndex(wordRecord.indexOf(word));
      }
    }
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

  const handleLoadCache = () => {
    const cacheData = localStorage.getItem(localStorageKey) || '{}';
    const { words, chapter, paper } = JSON.parse(cacheData);
    if (chapter !== chapterNo || paper !== testPaperNo) return;
    if (!words) return;
    setWordRecord(words);
  }

  // on submit
  const handleSubmit = async () => {
    if (!isLoggedIn) {
      toast.info("Your dictation test has been saved locally, please log in and submit it to the server.");
      return;
    }
    if (!wordRecord.length) {
      toast.info("Please start your dictation!");
      return;
    }
    const { success, message } = await post('/api/paper/test', {
      words: wordRecord,
      chapter: chapterNo,
      paper: testPaperNo,
    });
    if (!success) {
      toast.error(message);
      return;
    }
    toast.success(message);
    setInputValue('');
    setWordRecord([]);
  }

  const renderTestPaperList = () => {
    const testPaperNumber = TEST_PAPERS[`chapter${chapterNo}`];
    let options: ReactElement[] = [];
    for (let i = 1; i <= testPaperNumber; i++) {
      options.push(<option key={i} value={i}>
        {chapterNo === 11 ? "Section " : "Test Paper "}
        {i}
      </option>)
    }
    const handleChangePaper = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = event.target;
      navigate(`/chapters/${chapterNo}/${value}`, { state: { chapterNo, testPaperNo: +value } });
    }
    return (
      <select
        className="bg-transparent"
        name="testPaper"
        defaultValue={testPaperNo}
        onChange={handleChangePaper}>
        {options}
      </select>
    );
  }

  // set grid column number
  // fixed tailwind grid-cols-[nums] not working at 2024-07-01 15:53:00
  let gridColsNumber = "repeat(4, 1fr)";
  if (chapterNo === 5 && testPaperNo < 12) {
    gridColsNumber = "repeat(3, 1fr)";
  } else if (chapterNo === 11) {
    gridColsNumber = "repeat(2, 1fr)";
  }

  return (
    <div className='chapter-page h-full'>
      <div className="container flex flex-col mx-auto h-full px-4 max-w-screen-lg">
        <div className='mt-4 flex gap-4 items-center justify-between'>
          <h2 className='whitespace-nowrap w-full'>
            <Link to="/chapters" state={{ chapterNo }} className='hover:text-primary'>
              Chapter <strong>{chapterNo}</strong>
            </Link>
            <span> / </span>
            {renderTestPaperList()}
            {
              cache ? (
                <button className='ml-2 px-4 underline text-primary' onClick={handleLoadCache}>
                  Load Cache
                </button>
              ) : null
            }
          </h2>
          <div className='flex items-center gap-3'>
            <span className='whitespace-nowrap'>{wordRecord.length} / {vocabularyCount}</span>
            <button
              className='submit h-8 px-6 py-1 bg-primary text-white hover:bg-secondary-700 rounded-sm'
              onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
        <div className='flex-1 my-12 overflow-auto scroll-smooth' ref={contentRef}>
          <ul className={`grid max-h-64 gap-2 word-list`} style={{ gridTemplateColumns: gridColsNumber }} onClick={handleWordListClick}>
            {
              wordRecord.map((word, index) => (
                <li key={word + index} className='pl-2 border border-primary border-dashed min-h-8 flex items-center text-primary font-normal cursor-pointer'>
                  {word}
                </li>
              ))
            }
          </ul>
        </div>
        <div className='flex gap-8 justify-center'>
          <input
            type="text"
            className='px-3 py-2 outline-primary text-center w-full'
            autoFocus
            placeholder='Press Enter key to save'
            onChange={handleInputChange}
            onKeyUp={hanldeKeyUp}
            value={inputValue}
          />
        </div>
      </div>
    </div>
  )
}

export default TestPaperpage;