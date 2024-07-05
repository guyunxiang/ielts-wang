interface TestPaper {
  [key: string]: number
}

interface Chapter11Parts {
  [key: string]: number[]
}

export const CHAPTERS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const TEST_PAPERS: TestPaper = {
  chapter2: 5,
  chapter3: 9,
  chapter4: 4,
  chapter5: 12,
  chapter6: 18,
  chapter7: 3,
  chapter8: 16,
  chapter9: 1,
  chapter10: 1,
  chapter11: 4,
  chapter12: 3
}

// define chapter 11, part1 & part2 word count
export const CHAPTER11_PARTS: Chapter11Parts = {
  section1: [145, 222],
  section2: [129, 267],
  section3: [139, 210],
  section4: [550, 218]
}