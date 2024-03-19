import { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import './paper.css';
import { post } from '../../utils/fetch';
import { toast } from 'react-toastify';

const TestPaperpage = () => {

  const contentRef = useRef<HTMLDivElement>(null);

  const { state: { ChapterNo, TestPaperNo } } = useLocation();

  const [inputValue, setInputValue] = useState<string>('');
  const [cache, setCache] = useState<boolean>(false);
  const [wordRecord, setWordRecord] = useState<string[]>([]);
  
  const localStorageKey = `Chapter${ChapterNo}_TestPaper${TestPaperNo}`;

  // initial dictation progress
  useEffect(() => {
    const cacheData = localStorage.getItem(localStorageKey) || '{}';
    const { words, chapter, paper } = JSON.parse(cacheData);
    if (chapter !== ChapterNo || paper !== TestPaperNo) return;
    if (!words) return;
    setWordRecord(words);
    setCache(true);
  }, [ChapterNo, TestPaperNo, localStorageKey]);

  // validate correct chapter and test paper
  if (!TestPaperNo || ChapterNo < 2 || ChapterNo > 12) {
    window.location.href = '/Chapters';
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
  const saveDictation = (words: String[]) => {
    const data = {
      words,
      chapter: ChapterNo,
      paper: TestPaperNo
    };
    localStorage.setItem(localStorageKey, JSON.stringify(data));
  }

  // on type Enter
  const hanldeKeyUp = (event: any) => {
    if (event.key === 'Enter') {
      setWordRecord([...wordRecord, inputValue]);
      saveDictation([...wordRecord, inputValue]);
      setInputValue('');
      setTimeout(scrollToBottom, 0);
    }
  }

  const handleCleanCache = () => {
    setWordRecord([]);
    setCache(false);
    localStorage.removeItem(localStorageKey);
  }

  // on submit
  const handleSubmit = async () => {
    const { success, message } = await post('/api/paper/test', {
      words: wordRecord,
      chapter: ChapterNo,
      paper: TestPaperNo,
    });
    if (!success) {
      toast.error(message);
      return;
    }
    toast.success(message);
    setInputValue('');
    setWordRecord([]);
  }

  return (
    <div className='chapter-page h-full'>
      <div className="container flex flex-col mx-auto h-full">
        <div className='w-2/3 mt-4 flex gap-4 items-center justify-between mx-auto'>
          <h2 className='whitespace-nowrap w-full'>
            Chapter <strong>{ChapterNo}</strong>
            <span> / </span>
            Test Paper <strong>{TestPaperNo}</strong>
            {
              !cache ? null : (
                <button className='ml-2 px-4 underline text-primary' onClick={handleCleanCache}>
                  Clean Cache
                </button>
              )
            }
          </h2>
          <button
            className='submit h-8 px-6 py-1 border border-primary text-primary rounded-sm'
            onClick={handleSubmit}>
            Submit
          </button>
        </div>
        <div className='flex-1 w-2/3 mx-auto my-12 overflow-auto scroll-smooth' ref={contentRef}>
          <ul className='grid grid-cols-4 max-h-64 gap-2 word-list'>
            {
              wordRecord.map((value, index) => (
                <li key={index} className='pl-2 border border-primary border-dashed h-8 flex items-center'>{value}</li>
              ))
            }
          </ul>
        </div>
        <div className='flex gap-8 justify-center'>
          <input
            type="text"
            className='w-2/3 px-3 py-2 outline-primary'
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