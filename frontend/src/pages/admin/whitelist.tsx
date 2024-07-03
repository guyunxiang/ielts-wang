import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { get } from "../../utils/fetch";

interface Whitelist {
  original: string;
  alternative: string[];
}

const WHITELIST = [
  {
    original: 'booklist',
    alternative: ['book list']
  }
]

const WhiteListPage = () => {

  const inputRef = useRef<HTMLInputElement>(null);
  const [whitelist, setWhitelist] = useState<Whitelist[]>(WHITELIST);
  const [currentOriginalWord, setCurrentOriginalWord] = useState('');

  useEffect(() => {
    const fetchWhiteList = async () => {
      const { success, data } = await get("/api/whitelist/query");
      if (success) {
        setWhitelist(data);
      }
    }
    // fetchWhiteList();
  }, []);

  const handleSaveOriginalWord = (event: any) => {
    if (event.key === 'Enter') {
      const { value } = event.target;
    }
  }

  const RenderOriginalWord = () => {
    return (
      <ul>
        {
          whitelist.map(({ original }, index: number) => (
            <li key={index} className="px-3 py-1 border border-dashed border-primary cursor-pointer text-primary"
              onClick={() => { setCurrentOriginalWord(original) }}>
              {original}
            </li>
          ))
        }
      </ul>
    )
  }

  const RenderAlternativeWord = () => {
    const alternativeList = whitelist.find(({ original }) => original === currentOriginalWord)?.alternative ?? [];
    return (
      <ul className="flex">
        {
          alternativeList.map(word => (
            <li key={word} className="px-3 py-1 border border-dashed border-primary cursor-pointer text-primary">
              {word}
            </li>
          ))
        }
      </ul>
    )
  }

  return (
    <div className="container mt-3 mx-auto h-full flex flex-col">
      <h1 className="text-3xl font-black flex items-center justify-between">
        <Link to="/admin" className="text-base hover:text-primary cursor-pointer">Admin Page</Link>
        &nbsp;Whitelist Management
      </h1>
      <hr className="my-3" />
      <div className="flex flex-1 gap-3">
        <div className='flex flex-col w-1/3 gap-3'>
          <div className="flex justify-between items-center py-1">
            <h2 className="font-bold">Original Word</h2>
          </div>
          <div className="flex-1">
            <RenderOriginalWord />
          </div>
          <div className="flex gap-3 w-full">
            <input
              type="text"
              className='px-3 py-2 outline-primary text-center w-full'
              autoFocus
              ref={inputRef}
              placeholder='Press enter key to save original word'
              onKeyUp={handleSaveOriginalWord}
            />
          </div>
        </div>
        <div className='flex flex-1 flex-col gap-3 pl-3 border border-y-0 border-r-0 border-dashed border-primary'>
          <div className="flex justify-between items-center">
            <h2 className="font-bold">Alternative Word</h2>
            <input
              type="button"
              value="Submit"
              className={`bg-primary px-5 py-1 text-white rounded ${true ? "cursor-pointer" : "cursor-not-allowed bg-secondary-500"}`}
            />
          </div>
          <div className="flex-1">
            <RenderAlternativeWord />
          </div>
          <div className="flex gap-3 w-full">
            <input
              type="text"
              className='px-3 py-2 outline-primary text-center w-full'
              autoFocus
              placeholder='Press enter key to save alternative word'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default WhiteListPage;