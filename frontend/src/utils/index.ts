interface VocabularyCount {
  chapterNo: number;
  testPaperNo: number;
  wordCount: number;
}

// Load vocabulary count from localStorage
export const loadVocabularyCounts = (chapterNo: number, testPaperNo?: number) => {
  const localDataStr: string = localStorage.getItem("vocabularyCounts") ?? "[]";
  const localData = JSON.parse(localDataStr);
  if (!testPaperNo) {
    return localData.filter((vocabularyCount: VocabularyCount) => vocabularyCount.chapterNo === chapterNo);
  }
  return localData.find((vocabularyCount: VocabularyCount) =>
    vocabularyCount.chapterNo === chapterNo &&
    vocabularyCount.testPaperNo === testPaperNo
  );
}

// Save vocabulary count into localStorage
export const saveVocabularyCounts = (data: VocabularyCount[]) => {
  localStorage.setItem("vocabularyCounts", JSON.stringify(data));
}