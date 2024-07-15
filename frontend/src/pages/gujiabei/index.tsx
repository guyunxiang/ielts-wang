import classNames from "classnames";
import { ReactElement, useState } from "react";

const GuJiaBeiPage = () => {

  const [id, setId] = useState(1);

  const renderList = () => {
    let list: ReactElement[] = [];
    for (let i = 1; i <= 111; i++) {
      list.push(
        <li key={i}
          className={classNames(
            "cursor-pointer px-3 py-2 border border-dashed border-secondary-500 hover:bg-secondary-300 gap-4 flex items-center justify-center",
            `${id === i ? 'bg-secondary-300 text-primary' : ''}`
          )}
          onClick={() => { setId(i) }}>
          List {i}
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
        controls
        autoPlay
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