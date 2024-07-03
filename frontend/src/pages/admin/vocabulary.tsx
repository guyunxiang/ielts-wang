import { ReactElement, useEffect, useRef, useState } from "react";
import { TEST_PAPERS } from "../../utils/const";
import { get, post } from "../../utils/fetch";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

interface WordItem {
  word: string;
  _id: string;
}

const VocabularyPage = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [chapterNo, setChapterNo] = useState(3);
  const [testPaperNo, setTestPaperNo] = useState(1);

  // vocabulary list
  const [vocabularyList, setVocabularyList] = useState<string[]>([]);
  // test paper id
  const [testPaperId, setTestPaperId] = useState('');
  // input value
  const [inputValue, setInputValue] = useState<string>('');
  // currenct edit word index
  const [wordIndex, setWordIndex] = useState(-1);

  useEffect(() => {
    const fetchVocabularyList = async () => {
      const { success, message, data } = await get("/api/dictation/vocabulary/testPaper/query", {
        chapterNo: chapterNo,
        testPaperNo: testPaperNo,
      });
      if (!success) {
        return toast.error(message);
      }
      if (data) {
        const words = data.words.map((word: WordItem) => word.word);
        setTestPaperId(data._id);
        setVocabularyList(words);
      } else {
        setVocabularyList([]);
        setTestPaperId("");
      }
    }
    fetchVocabularyList();
  }, [chapterNo, testPaperNo]);

  const handleChapterClick = async (event: React.MouseEvent<HTMLUListElement>) => {
    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'li') {
      const { chapter } = target.dataset;
      if (chapter) {
        setChapterNo(+chapter);
      }
    }
  };

  // Switch next word to training
  const handleTestPaperClick = async (event: React.MouseEvent<HTMLUListElement>) => {
    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'li') {
      const { paper } = target.dataset;
      if (paper) {
        setTestPaperNo(+paper);
      }
    }
  };

  const handleWordListClick = async (event: React.MouseEvent<HTMLUListElement>) => {
    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'li') {
      const word = target.textContent;
      if (word) {
        setInputValue(word);
        setWordIndex(vocabularyList.indexOf(word));
        inputRef.current?.focus();
      }
    }
  };

  // onChange
  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
  }

  // scroll words list to bottom
  const scrollToBottom = () => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  };

  // on type Enter
  const hanldeKeyUp = (event: any) => {
    if (event.key === 'Enter') {
      const value = inputValue.trim();
      const newVocabularyList = [...vocabularyList];
      // edit current word
      if (wordIndex > -1) {
        newVocabularyList[wordIndex] = value;
      } else {
        // add new word
        newVocabularyList.push(value);
        setTimeout(scrollToBottom, 0);
      }
      setVocabularyList(newVocabularyList);
      setInputValue('');
      setWordIndex(-1);
    }
  }

  const handleSubmit = async () => {
    console.log("first")
    const postData = {
      chapterNo: chapterNo,
      testPaperNo: testPaperNo,
      words: vocabularyList.map((word) => ({ word })),
      id: testPaperId
    };
    const { success, message } = await post("/api/admin/vocabulary/save", postData);
    if (!success) {
      toast.error(message);
      return;
    }
    toast.success(message);
  }

  const RenderChapter = () => {
    const chapters: ReactElement[] = [];
    for (let index = 1; index <= 12; index++) {
      chapters.push(
        <li key={index} data-chapter={index} className={`cursor-pointer px-3 py-2 border border-dashed border-secondary-500 hover:bg-secondary-300 gap-4 flex items-center justify-center ${chapterNo === index ? 'bg-secondary-300 text-primary' : ''}`}>
          Chapter {index}
        </li>
      )
    }
    return (
      <ul className="flex flex-wrap gap-3 mb-3" onClick={handleChapterClick}>
        {chapters}
      </ul>
    )
  }

  const RenderTestPaperList = () => {
    const list: ReactElement[] = [];
    // get test paper number of current chapter
    const testPaperNums: number = TEST_PAPERS[`chapter${chapterNo}`];
    for (let i = 1; i <= testPaperNums; i++) {
      list.push(
        <li data-paper={i} className={`chapter paper-${i} relative px-3 py-1 border border-dashed border-secondary-500 cursor-pointer hover:text-primary hover:font-medium hover:border-primary ${testPaperNo === i ? 'bg-secondary-300 text-primary' : ''}`} key={`paper-${i}`}>
          {chapterNo === 11 ? "Section " : "Test Paper "}
          {i}
        </li>
      )
    }
    return <ul className='grid grid-cols-4 gap-3 mt-3' onClick={handleTestPaperClick}>{list}</ul>;
  }

  const RenderVocabularyList = () => {
    // set grid column number
    // fixed tailwind grid-cols-[nums] not working at 2024-07-01 15:53:00
    let gridColsNumber = "repeat(4, 1fr)";
    if (chapterNo === 5 && testPaperNo < 12) {
      gridColsNumber = "repeat(3, 1fr)";
    } else if (chapterNo === 11) {
      gridColsNumber = "repeat(2, 1fr)";
    }
    return (
      <div className='flex-1 overflow-auto scroll-smooth' ref={contentRef}>
        <ul className={`max-h-64 grid gap-2 word-list`} style={{ gridTemplateColumns: gridColsNumber }} onClick={handleWordListClick}>
          {
            vocabularyList.map((word, index) => (
              <li key={word + index} className='pl-2 border border-primary border-dashed min-h-8 flex items-center text-primary font-normal cursor-pointer'>
                {word}
              </li>
            ))
          }
        </ul>
      </div>
    )
  }

  return (
    <div className="container mt-3 mx-auto h-full flex flex-col">
      <h1 className="text-3xl font-black flex items-center justify-between">
        <Link to="/admin" className="text-base hover:text-primary cursor-pointer">Admin Page</Link>
        &nbsp;Vocabulary Management
      </h1>
      <hr className="my-3" />
      <div>
        <RenderChapter />
        <hr className="my-3" />
        <RenderTestPaperList />
      </div>
      <hr className="my-3" />
      <RenderVocabularyList />
      <hr className="my-3" />
      <div className="text-right mb-3">Word Count: {vocabularyList.length}</div>
      <div className='flex gap-3 justify-center'>
        <input
          type="text"
          className='px-3 py-2 outline-primary text-center w-full'
          autoFocus
          ref={inputRef}
          placeholder='Press enter key to save'
          onChange={handleInputChange}
          onKeyUp={hanldeKeyUp}
          value={inputValue}
        />
        <input
          type="button"
          value="Submit"
          className={`bg-primary px-5 text-white rounded ${vocabularyList.length ? "cursor-pointer" : "cursor-not-allowed bg-secondary-500" }`}
          disabled={vocabularyList.length < 1}
          onClick={handleSubmit}
        />
      </div>
    </div>
  )
}

export default VocabularyPage;