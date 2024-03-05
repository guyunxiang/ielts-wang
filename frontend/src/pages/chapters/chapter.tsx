import { useRef, useState, ReactElement } from 'react';
import { useParams } from 'react-router-dom';
import { TEST_PAPERS } from './const';

import './chapter.css';

// get Chapter Number
const getChapterNumber = (chapterId: string | undefined) => {
  if (chapterId === undefined) return '';
  const numbers = chapterId.match(/\d+/g);
  return numbers ? parseInt(numbers[0]) : null;
}

const ChapterPage = () => {

  const contentRef = useRef<HTMLDivElement>(null);

  const { chapterId } = useParams();
  const [testPaperValue, setTestPaperValue] = useState<number>(1);
  const [inputValue, setInputValue] = useState<string>('');
  const [wordRecord, setWordRecord] = useState<string[]>([]);
  const userId = 1;
  
  // chapter number
  const chapterNumber = getChapterNumber(chapterId);
  if (!chapterNumber || (chapterNumber < 2 || chapterNumber > 12)) {
    window.location.href = '/chapters';
    return null;
  }

  // onChange
  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
  }

  const handleSelectTestPaper = (event: any) => {
    setTestPaperValue(+event.target.value);
  }

  // scroll words list to bottom
  const scrollToBottom = () => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  };

  const cacheTestProgress = () => {
    const data = {
      words: wordRecord,
      chapter: chapterNumber,
      testPaper: testPaperValue
    };
    localStorage.setItem('cache', JSON.stringify(data));
    console.log(data);
  }

  // on type Enter
  const hanldeKeyUp = (event: any) => {
    if (event.key === 'Enter') {
      setWordRecord([...wordRecord, inputValue]);
      setInputValue('');
      setTimeout(scrollToBottom, 0);
      cacheTestProgress();
    }
  }

  // on submit
  const handleSubmit = () => {
    const data = {
      words: wordRecord,
      chapter: chapterNumber,
      testPaper: testPaperValue,
      userId,
    };
    fetch('/api/paper/test', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    }).then((res) => {
      if (!res.ok) {
          console.warn("Network response was not ok");
        }
        return res.json();
    }).then((res) => {
      const { message } = res;
      alert(message);
      setInputValue('');
      setWordRecord([]);
    });
  }

  const renderTestPaperList = () => {
    if (!chapterId) return null;
    const options:ReactElement[] = [];
    for (let i = 1; i <= TEST_PAPERS[chapterId]; i++) {
      options.push(<option value={i} key={i}>Test Paper {i}</option>);
    }
    return options;
  }

  return (
    <div className='chapter-page h-full'>
      <div className="container flex flex-col mx-auto h-full">
        <div className='w-2/3 mt-4 flex gap-4 items-center justify-between mx-auto'>
          <h2 className='whitespace-nowrap w-full'>Chapter { chapterNumber }</h2>
          <select
            className='form-select h-8 text-sm rounded-sm py-1 border border-primary text-primary'
            name="test-paper"
            id="test-paper"
            onChange={handleSelectTestPaper}>
            { renderTestPaperList() }
          </select>
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
                <li key={index} className='pl-2 border border-primary border-dashed'>{value}</li>
              ))
            }
          </ul>
        </div>
        <div className='flex gap-8 justify-center'>
          <input
            type="text"
            className='w-2/3 px-3 py-2 outline-primary'
            autoFocus
            onChange={handleInputChange}
            onKeyUp={hanldeKeyUp}
            value={inputValue}
          />
        </div>
      </div>
    </div>
  )
}

export default ChapterPage;