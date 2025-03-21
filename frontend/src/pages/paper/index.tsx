import { ReactElement, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { post } from '../../utils/fetch';
import { TEST_PAPERS } from '../../utils/const';
import { useAuth } from "../../components/authProvider";
import Dictation from '../../components/dictation';


const TestPaperpage = () => {

  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const { state: { chapterNo, testPaperNo } } = useLocation();

  const [words, setWords] = useState([]);

  // Go to next test paper
  const goToNextPaper = () => {
    let nextChapterNo = chapterNo;
    let nextTextPaperNo = testPaperNo;
    // the last paper
    if (testPaperNo < TEST_PAPERS[`chapter${chapterNo}`]) {
      nextTextPaperNo++;
    } else {
      nextChapterNo++;
      nextTextPaperNo = 1;
    }
    // console.log(nextChapterNo, nextTextPaperNo);
    navigate(`/chapters/${nextChapterNo}/${nextTextPaperNo}`, {
      state: {
        chapterNo: nextChapterNo,
        testPaperNo: nextTextPaperNo
      }
    })
  }

  // on submit
  const handleSubmit = async (words: string[]) => {
    if (!isLoggedIn) {
      toast.info("Your dictation test has been saved locally, please log in and submit it to the server.");
      return;
    }
    const { success, message } = await post('/api/paper/test', {
      words,
      chapter: chapterNo,
      paper: testPaperNo,
    });
    if (!success) {
      toast.error(message);
      return;
    }
    toast.success(message);
    setWords([]);
    goToNextPaper();
  }

  const RenderTestPaperList = () => {
    const testPaperNumber = TEST_PAPERS[`chapter${chapterNo}`];
    let options: ReactElement[] = [];
    for (let i = 1; i <= testPaperNumber; i++) {
      options.push(<option key={i} value={i}>
        {chapterNo === 11 ? "Section " : "Test Paper "}
        {i}
      </option>)
    }
    const handleChangePaper = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = event.target;
      navigate(`/chapters/${chapterNo}/${value}`, { state: { chapterNo, testPaperNo: +value } });
    }
    return (
      <select
        aria-label='Test Paper'
        className="bg-transparent"
        name="testPaper"
        defaultValue={testPaperNo}
        onChange={handleChangePaper}>
        {options}
      </select>
    );
  }

  // validate correct chapter and test paper
  if (!testPaperNo || chapterNo < 2 || chapterNo > 12) {
    navigate("/chapters");
    return null;
  }

  return (
    <div className='chapter-page h-full'>
      <div className="container flex flex-col mx-auto h-full px-4 max-w-screen-lg">
        <div className="flex justify-between mt-3 items-center">
          <h1 className="text-3xl font-black flex items-center justify-between">
            <Link to="/chapters" state={{ chapterNo }} className='hover:text-primary'>
              Chapter <strong>{chapterNo}</strong>
            </Link>
          </h1>
          <RenderTestPaperList />
        </div>
        <hr className="my-3" />
        <Dictation
          chapterNo={chapterNo}
          testPaperNo={testPaperNo}
          words={words}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}

export default TestPaperpage;