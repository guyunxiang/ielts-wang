import { useState, ReactElement, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { CHAPTERS, TEST_PAPERS } from '../../utils/const';
import { get } from '../../utils/fetch';
import { useAuth } from '../../components/authProvider';
import { loadVocabularyCounts, saveVocabularyCounts } from '../../utils';

interface VocabularyItem {
  chapterNo: number;
  testPaperNo: number;
  wordCount: number;
}

interface TestProgress {
  chapterNo: number;
  testPaperNo: number;
  highestAccuracyRecord: number;
}

function ChapterPage() {

  const { userInfo } = useAuth();
  const { role } = userInfo;

  const { state } = useLocation();

  // chapter number
  const [chapterNo, setChapterNo] = useState(state?.chapterNo ?? 3);
  const [testProgress, setTestProgress] = useState<TestProgress[]>([]);
  const [vocabularyCounts, setVocabularyCounts] = useState<VocabularyItem[]>([]);
  // total vocabulary count
  const [totalVocabularyCounts, setTotalVocabularyCounts] = useState(0);
  // lowest accuracy
  const [lownestAccuracy, setLownestAccuray] = useState(0);

  useEffect(() => {
    // fetch all chapter vocabulary counts
    const fetchVocabularyList = async () => {
      const { success, data } = await get("/api/vocabularyCounts/query");
      if (success) {
        // save vocabulary counts
        saveVocabularyCounts(data);
        // load current chapter vocabulary count
        const vocabularyCounts = loadVocabularyCounts(chapterNo);
        const totalVocabularyCounts = vocabularyCounts.reduce((total: number, currentValue: VocabularyItem) => (
          total + currentValue.wordCount
        ), 0);
        setVocabularyCounts(vocabularyCounts);
        setTotalVocabularyCounts(totalVocabularyCounts);
      }
    }
    fetchVocabularyList();
  }, [chapterNo]);

  useEffect(() => {
    // fetch dictation mistakes data to render complete progress
    const fetchDictationMistakes = async () => {
      const { success, data } = await get("/api/dictation/progress", { chapterNo });
      if (success) {
        setTestProgress(data);
        // get current chapter lownest accuracy
        const lownestAccuracy = data.reduce((min: number, currentValue: TestProgress) => (
          Math.min(min, currentValue.highestAccuracyRecord)
        ), Infinity);
        setLownestAccuray(lownestAccuracy);
      }
    }
    if (role === "user") {
      fetchDictationMistakes();
    }
  }, [chapterNo, role]);

  // render test paper list
  const renderChapterDetail = () => {
    const list: ReactElement[] = [];
    // get test paper number of current chapter
    const testPaperNums: number = TEST_PAPERS[`chapter${chapterNo}`];
    for (let i = 1; i <= testPaperNums; i++) {
      const highestAccuracyRecord = testProgress.find(({ testPaperNo }) => testPaperNo === i)?.highestAccuracyRecord ?? 0;
      const wordCount = vocabularyCounts.find(({ testPaperNo }) => testPaperNo === i)?.wordCount ?? 0;
      list.push(
        <li className={`chapter paper-${i} relative px-3 border border-dashed border-secondary-500 cursor-pointer hover:text-primary hover:font-medium hover:border-primary`} key={`paper-${i}`}>
          <span className={`absolute h-full left-0 transition-all duration-1000`} style={{ backgroundColor: `rgba(255, 102, 0, ${(highestAccuracyRecord / 100).toFixed(1)})`, width: `${highestAccuracyRecord}%` }}></span>
          <span className="absolute h-full border border-r-secondary-500 border-dashed right-[5%] border-b"></span>
          <Link
            className='relative flex items-center justify-center py-5 w-full'
            to={`/chapters/${chapterNo}/${i}`}
            state={{ chapterNo: chapterNo, testPaperNo: i, wordCount }}>
            {chapterNo === 11 ? "Section " : "Test Paper "}
            {i}
          </Link>
          {
            wordCount ? (
              <span className='absolute top-1 left-1 text-xs'>
                {wordCount}
              </span>
            ) : null
          }
        </li>
      )
    }
    return <ul className='grid grid-cols-4 gap-4'>{list}</ul>;
  }

  return (
    <div className='container mx-auto px-4 flex flex-col md:flex-row justify-center align-center gap-8 mt-8'>
      <div className="aside md:w-48">
        <ul className='flex flex-wrap flex-row md:flex-col gap-4'>
          {
            CHAPTERS.map((i) => (
              <li
                className={`chapter chapter-${i} flex px-3 h-12 cursor-pointer hover:bg-secondary-300 gap-4 items-center justify-center ${chapterNo === i ? 'bg-secondary-300 text-primary' : ''}`}
                key={`chapter-${i}`}
                onClick={() => setChapterNo(i)}>
                Chapter {i}
              </li>
            ))
          }
        </ul>
      </div>
      <div className="main flex-1">
        <div className='flex justify-end gap-3 text-sm'>
          {
            lownestAccuracy !== Infinity ? (
              <span>
                Lowest Accuracy: {lownestAccuracy.toFixed(2)}%
              </span>
            ) : null
          }
          <span>
            Total Word Count: {totalVocabularyCounts}
          </span>
        </div>
        <hr className="my-3" />
        {renderChapterDetail()}
      </div>
    </div>
  )
}

export default ChapterPage;