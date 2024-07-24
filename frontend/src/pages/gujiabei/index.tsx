import { ReactElement, useEffect, useRef, useState } from "react";
import classNames from "classnames";

const GuJiaBeiPage = () => {
  // Create a ref for the audio element
  const audioRef = useRef<HTMLAudioElement>(null);

  // State to store the current list ID
  const [id, setId] = useState(-1);

  useEffect(() => {
    // Retrieve the list ID from localStorage or default to 1
    const localId = localStorage.getItem('GuJiaBei-ListId');
    if (localId) {
      setId(+localId);
    }
  }, [])

  useEffect(() => {
    // Function to handle keydown events
    const handleKeyDown = (event: KeyboardEvent) => {
      if (audioRef.current) {
        switch (event.key) {
          case "ArrowLeft":
            // Rewind the audio by 5 seconds
            audioRef.current.currentTime -= 5;
            break;
          case "ArrowRight":
            // Fast forward the audio by 5 seconds
            audioRef.current.currentTime += 5;
            break;
        }
      }
    };

    // Add event listener for keydown events
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Function to handle changing the list ID
  const handleChangeListId = (id: number) => {
    localStorage.setItem('GuJiaBei-ListId', id.toString());
    setId(id);
  }

  const renderList = () => {
    let list: ReactElement[] = [];
    for (let i = 1; i <= 111; i++) {
      list.push(
        <li key={i}
          className={classNames(
            "relative px-3 py-2 border border-dashed border-secondary-500 hover:bg-secondary-300 gap-4 flex items-center justify-center cursor-pointer overflow-hidden",
            `${id === i ? 'bg-secondary-300 text-primary' : ''}`
          )}
          onClick={() => handleChangeListId(i)}>
          List {i}
          {i === id && <span className="triangle"></span> }
        </li>
      )
    }
    return list;
  }



  return (
    <div className="container mt-3 mx-auto px-3 h-full flex flex-col">
      <h1 className="text-3xl font-black flex items-center justify-between">
        《顾家北手把手教你6000单词——实现无字典阅读》
      </h1>
      <hr className="my-3" />
      <audio
        ref={audioRef}
        controls
        // autoPlay
        src={`/assets/audio/${id.toString().padStart(3, "0")}.mp3`}
      />
      <hr className="my-3" />
      <div>
        <ul className="flex flex-wrap gap-3 select-none">
          {renderList()}
        </ul>
      </div>
    </div>
  )
}

export default GuJiaBeiPage;