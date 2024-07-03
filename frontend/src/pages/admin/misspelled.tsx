import { useEffect, useState } from "react";
import { get } from "../../utils/fetch";

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
    <div className="container mx-auto mt-3">
      <h1>Misspelled Table Management</h1>
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