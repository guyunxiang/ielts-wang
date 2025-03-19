import { useQuery } from '@tanstack/react-query';
import { get } from '../utils/fetch';

interface Test {
  id: number;
  accuracyCount: number;
  accuracyRate: number;
  totalCount: number;
  createdAt: Date;
  fullPractice: Boolean;
}

export interface MistakeData {
  chapterNo: number;
  testPaperNo: number;
  vocabularyCount: number;
  tests: Test[];
}

interface ChapterGroup {
  [key: number]: MistakeData[]
}

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
      }, { accuracyCount: 0, totalCount: 0 } as Test);
      // calculate accuracy rate
      const accuracyRate = (testSummary.accuracyCount / testSummary.totalCount) * 100;
      summaryTests.push({
        accuracyCount: testSummary.accuracyCount,
        accuracyRate: parseFloat(accuracyRate.toFixed(2)),
        createdAt: items[0].tests[i]?.createdAt || new Date(),
        id: 0,
        totalCount: 0,
        fullPractice: false
      });
    }

    const chapterSummary = {
      chapterNo: parseInt(chapterNo),
      vocabularyCount: totalVocabularyCount,
      tests: summaryTests,
      testPaperNo: 0
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
};

export const useDictationMistakes = () => {
  return useQuery({
    queryKey: ['dictation-mistakes'],
    queryFn: async () => {
      const { success, data } = await get("/api/dictation/mistakes");
      if (success) {
        return calculateChapterData(data);
      }
      return [];
    }
  });
};

export const getMaxTestTimes = (mistakesData: MistakeData[]) => {
  let maxTestsLength = 0;
  mistakesData.forEach((item: MistakeData) => {
    if (item.tests.length > maxTestsLength) {
      maxTestsLength = item.tests.length;
    }
  });
  return maxTestsLength;
};

export default useDictationMistakes; 