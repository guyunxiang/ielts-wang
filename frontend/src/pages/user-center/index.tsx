import React from "react";
import classNames from "classnames";
import { ReactElement, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { get } from '../../utils/fetch';
interface Test {
  id: number;
  accuracyCount: number;
  accuracyRate: number;
  totalCount: number;
  createdAt: Date;
  fullPractice: Boolean;
}

interface MistakeData {
  chapterNo: number;
  testPaperNo: number;
  vocabularyCount: number;
  tests: Test[]; // Specify that tests is an array of Test objects
}

interface ChapterGroup {
  [key: number]: MistakeData[]
}

const UserCenter = () => {
  // Specify the type for mistakesData
  const [mistakesData, setMistakesData] = useState<MistakeData[]>([]);

  const localMaxTestTimes = localStorage.getItem("maxTestTimes") ?? 1;
  // Specify the type for maxTestTimes
  const [maxTestTimes, setMaxTestTimes] = useState<number>(+localMaxTestTimes);

  useEffect(() => {
    // Function to fetch dictation mistakes data
    const fetchDictationMistakes = async () => {
      const { success, data } = await get("/api/dictation/mistakes");
      if (success) {
        setMistakesData(calculateChapterData(data));
        let maxTestsLength = 0;
        // Find the maximum number of tests for any mistake data
        data.forEach((item: MistakeData) => {
          if (item.tests.length > maxTestsLength) {
            maxTestsLength = item.tests.length;
          }
        });
        setMaxTestTimes(maxTestsLength);
        localStorage.setItem("maxTestTimes", maxTestsLength.toString());
      }
    }
    fetchDictationMistakes();
  }, []);

  // Calculate chapter data
  const calculateChapterData = (data: MistakeData[]) => {
    // group by chapter
    const chapterGroups = data.reduce((acc: ChapterGroup, item) => {
      if (!acc[item.chapterNo]) {
        acc[item.chapterNo] = [];
      }
      acc[item.chapterNo].push(item);
      return acc;
    }, {});

    // process each chapter
    const result = [];
    for (const [chapterNo, items] of Object.entries(chapterGroups)) {
      // Calculate total vocabular in this chapter
      const totalVocabularyCount = items.reduce((sum: number, item: MistakeData) => sum + item.vocabularyCount, 0);
      // Get Maximum test times
      const maxTestsLength = Math.max(...items.map((item: MistakeData) => item.tests.length));
      // Calculate summary test array
      const summaryTests = [];
      for (let i = 0; i < maxTestsLength; i++) {
        const testSummary = items.reduce((acc: Test, item: MistakeData) => {
          if (item.tests[i]) {
            acc.accuracyCount += item.tests[i].accuracyCount;
            acc.totalCount += item.vocabularyCount;
          }
          return acc;
        }, { accuracyCount: 0, totalCount: 0 });
        // calculate accuracy rate
        const accuracyRate = (testSummary.accuracyCount / testSummary.totalCount) * 100;
        summaryTests.push({
          accuracyCount: testSummary.accuracyCount,
          accuracyRate: parseFloat(accuracyRate.toFixed(2)),
          createdAt: items[0].tests[i]?.createdAt || null
        });
      }

      const chapterSummary = {
        chapterNo: parseInt(chapterNo),
        vocabularyCount: totalVocabularyCount,
        tests: summaryTests
      };

      // insert data
      const insertIndex = result.findIndex(item => item.chapterNo === parseInt(chapterNo));
      if (insertIndex === -1) {
        result.push(chapterSummary);
        result.push(...items);
      } else {
        result.splice(insertIndex, 0, chapterSummary);
      }
    }

    return result;
  }

  // Function to render the <th> elements for table headers
  const renderTheadTimes = (isIndex: boolean) => {
    const thDoms: ReactElement[] = [];
    if (isIndex) {
      // Render index columns
      for (let i = 0; i < maxTestTimes; i++) {
        thDoms.push(<th key={`index-${i}`} colSpan={3} className="border border-primary px-3">{i + 1}</th>);
      }
    } else {
      // Render check, rate, and date columns
      for (let i = 0; i < maxTestTimes; i++) {
        thDoms.push(
          <React.Fragment key={`fragment-${i}`}>
            <th key={`check-${i}`} className="border border-primary px-3 min-w-16">✓</th>
            <th key={`rate-${i}`} className="border border-primary px-3">Rate</th>
            <th key={`date-${i}`} className="border border-primary px-3">Date</th>
          </React.Fragment>
        );
      }
    }
    return thDoms;
  }

  // render record title
  const renderTitle = (chapterNo: number, testPaperNo: number) => {
    if (chapterNo === 11 && testPaperNo) return "Section " + testPaperNo;
    if (testPaperNo) return "Test Paper " + testPaperNo;
    return "Chapter " + chapterNo;
  }

  const renderAccuracyRate = (test: Test) => {
    const { id, accuracyRate, fullPractice } = test;
    if (!id) {
      return (
        <strong>
          {`${accuracyRate.toFixed(2)}%`}
        </strong>
      );
    }
    return (
      <React.Fragment>
        <Link className="text-primary hover:text-secondary-500" to={`/training/${test.id}`} state={{ id: test.id }}>
          {accuracyRate.toFixed(2)}%
        </Link>
        { fullPractice ? <span className="triangle"></span> : null }
      </React.Fragment>
    )
  }

  return (
    <div className="overflow-auto">
      <table className="border-collapse border border-primary text-center text-[#92400e]" id="accuracy-rate-table">
        <thead className="bg-secondary-700">
          <tr>
            <th rowSpan={2} className="border border-primary px-3 whitespace-nowrap">Test Paper</th>
            <th rowSpan={2} className="border border-primary px-3">Vocabulary</th>
            {renderTheadTimes(true)}
          </tr>
          <tr>
            {renderTheadTimes(false)}
          </tr>
        </thead>
        <tbody>
          {
            mistakesData.map(({ chapterNo, testPaperNo, vocabularyCount, tests }) => (
              <tr className={classNames(
                "hover:bg-secondary-200",
                { "bg-secondary-400": !testPaperNo }
              )}
                key={`chapter-${chapterNo}-${"testPaper-" + testPaperNo}`}>
                <td className="border border-primary px-3 whitespace-nowrap">
                  {renderTitle(chapterNo, testPaperNo)}
                </td>
                <td className="border border-primary px-3">{vocabularyCount}</td>
                {
                  tests.map((test: Test, idx: number) => (
                    <React.Fragment key={`${testPaperNo}-${idx}`}>
                      <td className="border border-primary px-3">
                        {test.accuracyCount}
                      </td>
                      <td className="relative border border-primary px-3 overflow-hidden">
                        {renderAccuracyRate(test)}
                      </td>
                      <td className="border border-primary px-3">
                        {new Date(test.createdAt).toLocaleDateString()}
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
