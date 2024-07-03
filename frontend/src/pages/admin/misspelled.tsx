import { useEffect, useState } from "react";
import { get } from "../../utils/fetch";
import { Link } from "react-router-dom";

interface User {
  _id: string;
  username: string;
  role: string;
}

const MisspelledPage = () => {
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    const fetchUserList = async () => {
      const { success, data } = await get("/api/auth/user/list");
      if (success) {
        setUserList(data)
      }
    }
    fetchUserList();
  }, [])
  return (
    <div className="container mt-3 mx-auto h-full flex flex-col">
      <h1 className="text-3xl font-black flex items-center justify-between">
        <Link to="/admin" className="text-base hover:text-primary cursor-pointer">Admin Page</Link>
        &nbsp;Misspelled Table Management
      </h1>
      <hr className="my-3" />
      <div>
        User List:
        <select name="userList" id="userList" className="ml-3 min-h-10 px-4">
          {
            userList.map((item: User) => (
              <option id={item._id} value={item.username}>{item.username}</option>
            ))
          }
        </select>
      </div>
    </div>
  )
}

export default MisspelledPage;