import { useState, ReactElement, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { TEST_PAPERS } from '../../utils/const';
import { get } from '../../utils/fetch';
import { useAuth } from '../../components/authProvider';

interface VocabularyItem {
  testPaperNo: number;
  wordCount: number;
}

function ChapterPage() {

  const { userInfo } = useAuth();
  const { role } = userInfo;

  const { state } = useLocation();

  let ChapterNo = 3;
  if (state) {
    ChapterNo = state.ChapterNo;
  }

  // chapter number
  const [chapterNo, setChapterNo] = useState(ChapterNo);
  const [testPaperList, setTestPaperList] = useState<VocabularyItem[]>([]);

  useEffect(() => {
    const fetchVocabularyList = async () => {
      const { success, data } = await get("/api/dictation/vocabulary/query", { chapterNo });
      if (success) {
        setTestPaperList(data);
      }
    }
    if (role === "admin") {
      fetchVocabularyList();
    }
  }, [chapterNo, role]);

  const renderChapterList = () => {
    const list: ReactElement[] = [];
    for (let i = 2; i <= 12; i++) {
      list.push(
        <li
          className={`chapter chapter-${i} flex h-12 cursor-pointer hover:bg-secondary-300 gap-4 items-center justify-center ${chapterNo === i ? 'bg-secondary-300 text-primary' : ''}`}
          key={`chapter-${i}`}
          onClick={() => setChapterNo(i)}>
          Chapter {i}
        </li>
      )
    }
    return <ul>{list}</ul>;
  }

  // Display complete test paper and word count
  const findTestPaperAvailable = (index: number) => {
    const wordCount = testPaperList.find(({ testPaperNo }) => testPaperNo === index)?.wordCount ?? 0;
    if (!wordCount) return null
    return (
      <span className='absolute top-0 right-0 text-xs'>
        {wordCount}
      </span>
    )
  }

  const renderChapterDetail = () => {
    const list: ReactElement[] = [];
    // get test paper number of current chapter
    const testPaperNums: number = TEST_PAPERS[`chapter${chapterNo}`];
    for (let i = 1; i <= testPaperNums; i++) {
      list.push(
        <li className={`chapter paper-${i} relative px-3 border border-dashed border-secondary-500 cursor-pointer hover:text-primary hover:border-primary`} key={`paper-${i}`}>
          <Link
            className='flex items-center justify-center h-16 w-full'
            to={`/chapters/${chapterNo}/${i}`}
            state={{ ChapterNo: chapterNo, TestPaperNo: i }}>
            {chapterNo === 11 ? "Section " : "Test Paper "}
            {i}
          </Link>
          {findTestPaperAvailable(i)}
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