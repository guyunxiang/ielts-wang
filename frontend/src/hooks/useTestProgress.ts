import { useQuery } from '@tanstack/react-query';
import { get } from '../utils/fetch';

export interface TestProgress {
  chapterNo: number;
  testPaperNo: number;
  highestAccuracyRecord: number;
}

export const useTestProgress = (chapterNo: number) => {
  return useQuery({
    queryKey: ['test-progress', chapterNo],
    queryFn: async () => {
      const { success, data } = await get("/api/dictation/progress", { chapterNo });
      if (success) {
        return data as TestProgress[];
      }
      return [] as TestProgress[];
    },
    // Skip if role is not user (this will be handled in the component)
    enabled: false
  });
};

export default useTestProgress; 