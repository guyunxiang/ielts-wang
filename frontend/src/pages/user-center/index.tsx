import React from "react";
import classNames from "classnames";
import { ReactElement } from "react";
import { Link } from "react-router-dom";

import useDictationMistakes, { getMaxTestTimes, MistakeData } from "../../hooks/useDictationMistakes";

interface Test {
  id: number;
  accuracyCount: number;
  accuracyRate: number;
  totalCount: number;
  createdAt: Date;
  fullPractice: Boolean;
}

interface ChapterGroup {
  [key: number]: MistakeData[]
}

const UserCenter = () => {
  // Use the React Query hook to fetch data
  const { data: mistakesData = [], isLoading, error } = useDictationMistakes();
  
  // Get max test times from the data
  const maxTestTimes = mistakesData.length > 0 ? getMaxTestTimes(mistakesData) : 1;

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

  // Show loading state
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[300px]">Loading data...</div>;
  }

  // Show error state
  if (error) {
    return <div className="text-red-500">Error loading data. Please try again later.</div>;
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
