import { useState, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { TEST_PAPERS } from './const';

import './index.css';

function ChapterPage() {

  const [chapter, setChapter] = useState(3);

  const renderChapterList = () => {
    const list: ReactElement[] = [];
    for (let i = 2; i <= 12; i++) {
      list.push(
        <li
          className={`chapter chapter-${i} flex h-12 cursor-pointer hover:bg-secondary-300 gap-4 items-center justify-center ${chapter === i ? 'bg-secondary-300 text-primary' : ''}`}
          key={`chapter-${i}`}
          onClick={() => setChapter(i)}>
          Chapter {i}
        </li>
      )
    }
    return <ul>{list}</ul>;
  }

  const renderChapterDetail = () => {
    const list: ReactElement[] = [];
    const testPaperNums: number = TEST_PAPERS[`chapter${chapter}`];
    for (let i = 1; i <= testPaperNums; i++) {
      list.push(
        <li className={`chapter paper-${i} flex items-center justify-center h-16 border border-dashed border-secondary-500 cursor-pointer hover:text-primary hover:border-primary`} key={`paper-${i}`}>
          <Link to={`/chapters/chapter${chapter}`} state={{ testPaper: i }}>
            Test Paper {i}
          </Link>
        </li>
      )
    }
    return <ul className='grid grid-cols-4 gap-4'>{list}</ul>;
  }

  return (
    <div className='container mx-auto flex justify-center align-center gap-8 mt-8'>
      <div className="aside w-48">
        {renderChapterList()}
      </div>
      <div className="main flex-1">
        {renderChapterDetail()}
      </div>
    </div>
  )
}

export default ChapterPage;