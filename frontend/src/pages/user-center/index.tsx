import { Link } from "react-router-dom";
import { get } from '../../utils/fetch';

import { ReactElement, useEffect, useState } from "react";
import React from "react";

interface Test {
  id: number;
  accuracyCount: number;
  accuracyRate: number;
  createdAt: Date;
}

interface MistakeData {
  chapterNo: number;
  testPaperNo: number;
  vocabularyCount: number;
  tests: Test[]; // Specify that tests is an array of Test objects
}

const UserCenter = () => {
  // Specify the type for mistakesData
  const [mistakesData, setMistakesData] = useState<MistakeData[]>([]);

  // Specify the type for maxTestTimes
  const [maxTestTimes, setMaxTestTimes] = useState<number>(1);

  useEffect(() => {
    fetchDictationMistakes();
  }, []);

  // Function to fetch dictation mistakes data
  const fetchDictationMistakes = async () => {
    const { success, data } = await get("/api/dictation/mistakes");
    if (success) {
      setMistakesData(data);
      // Find the maximum number of tests for any mistake data
      data.forEach((item: MistakeData) => {
        if (item.tests.length > maxTestTimes) {
          setMaxTestTimes(item.tests.length);
        }
      });
    }
  }

  // Function to render the <th> elements for table headers
  const renderTheadTimes = (isIndex: boolean) => {
    const thDoms: ReactElement[] = [];
    if (isIndex) {
      // Render index columns
      for (let i = 0; i < maxTestTimes; i++) {
        thDoms.push(<th key={`index-${i}`} colSpan={3} className="border border-primary text-primary px-3">{i + 1}</th>);
      }
    } else {
      // Render check, rate, and date columns
      for (let i = 0; i < maxTestTimes; i++) {
        thDoms.push(
          <React.Fragment key={`fragment-${i}`}>
            <th key={`check-${i}`} className="border border-primary text-primary px-3">✓</th>
            <th key={`rate-${i}`} className="border border-primary text-primary px-3">Rate</th>
            <th key={`date-${i}`} className="border border-primary text-primary px-3">Date</th>
          </React.Fragment>
        );
      }
    }
    return thDoms;
  }

  return (
    <div className='container mx-auto flex justify-center align-center gap-8 mt-8'>
      <table className="border-collapse border border-primary text-center" id="accuracy-rate-table">
        <thead className="bg-[#fdba74]">
          <tr>
            <th rowSpan={2} className="border border-primary text-primary px-3">Test Paper</th>
            <th rowSpan={2} className="border border-primary text-primary px-3">Vocabulary</th>
            {renderTheadTimes(true)}
          </tr>
          <tr>
            {renderTheadTimes(false)}
          </tr>
        </thead>
        <tbody>
          {
            mistakesData.map(({ chapterNo, testPaperNo, vocabularyCount, tests }) => (
              <tr key={testPaperNo}>
                <td className="border border-primary">Test Paper {testPaperNo}</td>
                <td className="border border-primary">{vocabularyCount}</td>
                {
                  tests.map((test: Test, idx: number) => (
                    <React.Fragment key={`${testPaperNo}-${idx}`}>
                      <td className="border border-primary px-3">
                        <Link className="hover:text-primary" to={`/training/${test.id}`} state={{ id: test.id }}>
                          {test.accuracyCount}
                        </Link>
                      </td>
                      <td className="border border-primary px-3">
                        <Link className="hover:text-primary" to={`/training/${test.id}`} state={{ id: test.id }}>
                          {test.accuracyRate}%
                        </Link>
                      </td>
                      <td className="border border-primary px-3">
                        <Link className="hover:text-primary" to={`/training/${test.id}`} state={{ id: test.id }}>
                          {new Date(test.createdAt).toLocaleDateString()}
                        </Link>
                      </td>
                    </React.Fragment>
                  ))
                }
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}

export default UserCenter;
