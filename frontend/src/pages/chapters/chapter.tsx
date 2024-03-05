import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import './chapter.css';

// get Chapter Number
const getChapterNumber = (chapterId: string | undefined) => {
  if (chapterId === undefined) return '';
  const numbers = chapterId.match(/\d+/g);
  return numbers ? parseInt(numbers[0]) : null;
}

const ChapterPage = () => {

  const { chapterId } = useParams();
  const contentRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [wordRecord, setWordRecord] = useState<string[]>([]);
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

  // on type Enter
  const hanldeKeyUp = (event: any) => {
    if (event.key === 'Enter') {
      setWordRecord([...wordRecord, inputValue]);
      setInputValue('');
      setTimeout(scrollToBottom, 0);
    }
  }

  // scroll words list to bottom
  const scrollToBottom = () => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  };

  // on submit
  const handleSubmit = () => {
    const data = {
      words: wordRecord,
      chapter: chapterNumber
    };
    console.log(data);
  }

  return (
    <div className='chapter-page h-full'>
      <div className="container flex flex-col mx-auto h-full">
        <div className='w-1/2 mt-4 flex gap-4 items-center justify-between mx-auto'>
          <h2>Chapter {chapterNumber }</h2>
          <select name="test-paper" id="test-paper">
            <option value="1">Test Paper 1</option>
          </select>
          <button
            className='submit px-8 py-2 border border-primary text-primary rounded-md'
            onClick={handleSubmit}>
            Submit
          </button>
        </div>
        <div className='flex-1 w-1/2 mx-auto my-12 overflow-auto scroll-smooth' ref={contentRef}>
          <ul className='grid grid-cols-4 gap-8 max-h-64 '>
            {
              wordRecord.map((value, index) => (
                <li key={index}>{value}</li>
              ))
            }
          </ul>
        </div>
        <div className='flex gap-8 justify-center'>
          <input
            type="text"
            className='w-1/2 px-4 py-4 outline-primary'
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