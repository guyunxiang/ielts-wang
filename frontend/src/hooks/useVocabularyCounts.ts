import { useQuery } from '@tanstack/react-query';
import { get } from '../utils/fetch';
import { loadVocabularyCounts, saveVocabularyCounts } from '../utils';

export interface VocabularyItem {
  chapterNo: number;
  testPaperNo: number;
  wordCount: number;
}

// Hook to fetch all vocabulary counts
export const useAllVocabularyCounts = () => {
  return useQuery({
    queryKey: ['vocabulary-counts'],
    queryFn: async () => {
      const { success, data } = await get("/api/vocabularyCounts/query");
      if (success) {
        // Save to local storage/utility
        saveVocabularyCounts(data);
        return data;
      }
      return [];
    }
  });
};

// Hook to get vocabulary counts for a specific chapter
export const useChapterVocabularyCounts = (chapterNo: number) => {
  const { data: allCounts = [] } = useAllVocabularyCounts();
  
  return useQuery({
    queryKey: ['vocabulary-counts', chapterNo],
    queryFn: () => {
      // Load from local storage/utility
      const vocabularyCounts = loadVocabularyCounts(chapterNo);
      return vocabularyCounts;
    },
    // Only execute this query after the parent query is successful
    enabled: allCounts.length > 0,
  });
};

export default useChapterVocabularyCounts; 