import { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { toast } from "react-toastify";

import { get, post } from "../../utils/fetch";

interface Whitelist {
  original: string;
  alternative: string[];
}

const WhiteListPage = () => {

  const originalRef = useRef<HTMLInputElement>(null);
  const alternativeRef = useRef<HTMLInputElement>(null);

  const [id, setId] = useState("");
  const [version, setVersion] = useState(18);
  const [whitelist, setWhitelist] = useState<Whitelist[]>([]);
  // original word
  const [originalWord, setOriginalWord] = useState('');
  const [currentOriginalIndex, setCurrentOriginalIndex] = useState(-1);
  // alternative word
  const [alternativeWord, setAlternativeWord] = useState("");
  const [currentAlternativeIndex, setCurrentAlternativeIndex] = useState(-1);

  useEffect(() => {
    const fetchWhiteList = async () => {
      const { success, data } = await get("/api/admin/whitelist/query", { version });
      if (!success) return;
      if (data._id) {
        const { _id, whitelist } = data;
        setId(_id);
        setWhitelist(whitelist);
        setCurrentOriginalIndex(0);
        setOriginalWord(whitelist[0].original);
        setCurrentAlternativeIndex(0);
      } else {
        setId("");
        setWhitelist([]);
      }
    }
    fetchWhiteList();
  }, [version]);

  // onChange
  const handleOriginalChange = (event: any) => {
    setOriginalWord(event.target.value);
  }

  const handleSaveOriginalWord = (event: any) => {
    if (event.key === 'Enter') {
      const { value } = event.target;
      const newWhitelist = [...whitelist];
      // Update current original word
      if (currentOriginalIndex > -1) {
        const { alternative } = whitelist[currentOriginalIndex]
        newWhitelist.splice(currentOriginalIndex, 1, { original: value, alternative });
      } else {
        newWhitelist.push({
          original: value,
          alternative: []
        });
      }
      setWhitelist(newWhitelist);
      setOriginalWord("");
      setCurrentOriginalIndex(-1);
      setAlternativeWord("");
      setCurrentAlternativeIndex(-1);
    }
  }

  const handleDeleteOriginalWord = () => {
    if (currentOriginalIndex > -1) {
      const newWhitelist = [...whitelist];
      newWhitelist.splice(currentOriginalIndex, 1);
      setWhitelist(newWhitelist);
    }
    setCurrentOriginalIndex(-1);
    setOriginalWord("");
  }

  const handleAlternativeChange = (event: any) => {
    setAlternativeWord(event.target.value);
  }

  const handleSaveAlternativeWord = (event: any) => {
    if (event.key === 'Enter') {
      const { value } = event.target;
      const newWhitelist = [...whitelist];
      const { alternative } = whitelist[currentOriginalIndex];
      // Update current original word
      if (currentAlternativeIndex > -1) {
        alternative[currentAlternativeIndex] = value;
      } else {
        alternative.push(value);
      }
      newWhitelist.splice(currentOriginalIndex, 1, { original: originalWord, alternative });
      setWhitelist(newWhitelist);
      setAlternativeWord("");
    }
  }

  // Delete an alternative word
  const handleDeleteAlternativeWord = () => {
    const newWhitelist = [...whitelist];
    if (currentOriginalIndex < 0) return;
    const { alternative } = whitelist[currentOriginalIndex];
    alternative.splice(currentAlternativeIndex, 1);
    newWhitelist.splice(currentOriginalIndex, 1, { original: originalWord, alternative });
    setWhitelist(newWhitelist);
    setAlternativeWord("");
    setCurrentAlternativeIndex(-1);
  }

  // On submit
  const handleSubmit = async () => {
    const { success, message } = await post("/api/admin/whitelist/update", {
      id,
      version,
      whitelist,
    }, { method: "PUT" });
    if (!success) {
      return toast.error(message);
    }
    toast.success(message);
  }

  const RenderOriginalWord = () => {
    return (
      <ul className="flex flex-col gap-3">
        {
          whitelist.map(({ original }, index: number) => (
            <li key={original + index}
              className={classNames(
                "px-3 py-1 min-h-9 border border-dashed border-primary cursor-pointer text-primary",
                { "bg-secondary-200": index === currentOriginalIndex }
              )}
              onClick={() => {
                setOriginalWord(original);
                setCurrentOriginalIndex(index);
                // initial alternative word and index
                setAlternativeWord("");
                setAlternativeWord(whitelist[index].alternative[0] ?? "");
                setCurrentAlternativeIndex(0);
              }}>
              {original}
            </li>
          ))
        }
      </ul >
    )
  }

  const RenderAlternativeWord = () => {
    const alternativeList = whitelist.find(({ original }) => original === originalWord)?.alternative ?? [];
    return (
      <ul className="grid grid-cols-4 gap-3">
        {
          alternativeList.map((word, index) => (
            <li key={word + index}
              className={classNames(
                "px-3 py-1 min-h-9 border border-dashed border-primary cursor-pointer text-primary",
                { "bg-secondary-200": index === currentAlternativeIndex }
              )}
              onClick={() => {
                setAlternativeWord(word);
                setCurrentAlternativeIndex(index);
              }}>
              {word}
            </li>
          ))
        }
      </ul>
    )
  }

  return (
    <div className="container mt-3 mx-auto px-3 h-full flex flex-col">
      <h1 className="text-3xl font-black flex items-center justify-between">
        Whitelist Management
        <div className="text-sm font-normal">
          {/* User List: */}
          <select
            name="userList" id="userList"
            value={version}
            onChange={(e: any) => {
              setVersion(e.target.value);
              setOriginalWord("");
              setCurrentOriginalIndex(-1);
              setAlternativeWord("");
              setCurrentAlternativeIndex(-1);
            }}
            className="ml-3 min-h-10 px-4 bg-transparent outline-none">
            {
              [16, 17, 18].map((version) => (
                <option key={version} id={`${version}`} value={version}>
                  Cambridge {version}
                </option>
              ))
            }
          </select>
        </div>
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
          <hr />
          <div className="flex items-center gap-3">
            Actions:
            <button
              className="text-primary hover:underline cursor-pointer"
              onClick={() => {
                setCurrentOriginalIndex(-1);
                setOriginalWord("");
                setAlternativeWord("");
                setCurrentAlternativeIndex(-1);
                originalRef.current?.focus();
              }}>
              Insert
            </button>
            <button
              className="text-primary hover:underline cursor-pointer"
              onClick={handleDeleteOriginalWord}>
              Delete
            </button>
          </div>
          <hr />
          <div className="flex gap-3 w-full">
            <input
              type="text"
              className='px-3 py-2 outline-primary text-center w-full'
              autoFocus
              ref={originalRef}
              placeholder='Press enter key to save original word'
              onKeyUp={handleSaveOriginalWord}
              onChange={handleOriginalChange}
              value={originalWord}
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
              onClick={handleSubmit}
            />
          </div>
          <div className="flex-1">
            <RenderAlternativeWord />
          </div>
          <hr />
          <div className="flex items-center gap-3">
            Actions:
            <button
              className="text-primary hover:underline cursor-pointer"
              onClick={() => {
                setAlternativeWord("");
                setCurrentAlternativeIndex(-1);
                alternativeRef.current?.focus();
              }}>
              Insert
            </button>
            <button
              className="text-primary hover:underline cursor-pointer"
              onClick={handleDeleteAlternativeWord}>
              Delete
            </button>
          </div>
          <hr />
          <div className="flex gap-3 w-full">
            <input
              type="text"
              className='px-3 py-2 outline-primary text-center w-full'
              autoFocus
              ref={alternativeRef}
              placeholder='Press enter key to save alternative word'
              disabled={currentOriginalIndex < 0}
              onKeyUp={handleSaveAlternativeWord}
              onChange={handleAlternativeChange}
              value={alternativeWord}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default WhiteListPage;