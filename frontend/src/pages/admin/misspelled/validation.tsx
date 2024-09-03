import React, { useEffect } from 'react';
import { get } from '../../../utils/fetch';
import { useParams } from 'react-router-dom';
import classNames from 'classnames';

interface Word {
  practiceCount: number;
  trainingDuration: number;
  word: string;
  _id: string;
}

interface ValidationData {
  accuracyCount: number;
  accuracyRate: number;
  chapterNo: number;
  testPaperNo: number;
  createdAt: string;
  trainingDuration: number;
  words: [Word];
}

const ValidationPage: React.FC = () => {

  const { TestId } = useParams();

  const [validationData, setValidationData] = React.useState<ValidationData | null>(null);

  useEffect(() => {
    // fetch
    const fetchValidation = async (testId: string) => {
      const { success, data } = await get("/api/admin/mistake/queryByTestId", { testId });
      if (success) {
        setValidationData(data);
      }
    }
    if (!TestId) return;
    fetchValidation(TestId);
  }, [TestId]);

  const renderBaseInfo = () => {
    if (!validationData) return null;
    const { accuracyCount, accuracyRate, chapterNo, testPaperNo, createdAt, trainingDuration } = validationData;
    return (
      <div>
        <ul className='flex gap-3 whitespace-nowrap flex-wrap'>
          <li className='px-3 py-1 min-h-9 border border-dashed border-primary'>
            ChapterNo: {chapterNo}
          </li>
          <li className='px-3 py-1 min-h-9 border border-dashed border-primary'>
            TestPaperNo: {testPaperNo}
          </li>
        </ul>
        <ul className='flex gap-3 whitespace-nowrap flex-wrap pt-3'>
          <li className='px-3 py-1 min-h-9 border border-dashed border-primary'>
            AccuracyCount: {accuracyCount}
          </li>
          <li className='px-3 py-1 min-h-9 border border-dashed border-primary'>
            AccuracyRate: {accuracyRate}%
          </li>
          <li className='px-3 py-1 min-h-9 border border-dashed border-primary'>
            TrainingDuration: {formatTrainingDuration(trainingDuration)}
          </li>
          <li className='px-3 py-1 min-h-9 border border-dashed border-primary'>
            CreatedAt: {new Date(createdAt).toDateString()}
          </li>
        </ul>
      </div>
    )

    function formatTrainingDuration(time: number): string {
      const duration = Math.floor(time);
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = duration % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  const renderWordList = () => {
    if (!validationData) return null;
    return (
      <table className='w-full'>
        <thead>
          <tr>
            <th className='text-left'>Word</th>
            <th className='text-right'>Practice Count</th>
            <th className='text-right'>Training Duration</th>
          </tr>
        </thead>
        <tbody>
          {
            validationData.words.map(({ word, practiceCount, trainingDuration }: Word) => (
              <tr key={word} className={classNames(practiceCount <= 1 ? 'text-[#ff0000]' : '')}>
                <td>{word}</td>
                <td className='text-right'>{practiceCount}</td>
                <td className='text-right'>{trainingDuration}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    )
  }

  return (
    <div className="container mt-3 mx-auto px-3 h-full flex flex-col">
      <h1 className="text-3xl font-black flex items-center mb-3 justify-between">
        Validation Detail
      </h1>
      <hr />
      <div className='py-3'>
        {renderBaseInfo()}
      </div>
      <hr />
      <div className='py-3'>
        <h2 className='text-xl font-bold mb-3'>Misspelled Words</h2>
        <hr />
        {renderWordList()}
      </div>
    </div>
  );
};

export default ValidationPage;