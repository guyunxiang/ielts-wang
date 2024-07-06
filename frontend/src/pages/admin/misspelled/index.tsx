import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import { get, post } from "../../../utils/fetch";
interface User {
  _id: string;
  username: string;
  role: string;
}

interface MisspelledItem {
  accuracyCount: number;
  accuracyRate: number;
  chapterNo: number;
  testPaperNo: number;
  totalCount: number;
  testId: string;
  _id: string;
  createdAt: Date;
}

const MisspelledPage = () => {

  const [userList, setUserList] = useState([]);
  const [userInfo, setUserInfo] = useState<User>({
    _id: '',
    username: '',
    role: ''
  });
  const [misspelledList, setMisspelledList] = useState<MisspelledItem[]>([]);

  useEffect(() => {
    const fetchUserList = async () => {
      const { success, data } = await get("/api/auth/user/list");
      if (success) {
        setUserList(data)
        setUserInfo(data[0]);
      }
    }
    fetchUserList();
  }, []);

  const fetchUserMisspelledList = async (userId: string) => {
    const { success, message, data } = await get("/api/admin/mistakes/query", { userId });
    if (!success) {
      toast.error(message);
      return;
    }
    setMisspelledList(data);
  }

  useEffect(() => {
    const { _id } = userInfo;
    if (_id) {
      fetchUserMisspelledList(_id)
    }
  }, [userInfo]);

  const handleRecheck = async (id: string, testId: string) => {
    console.log(id, testId);
    const { success, message } = await post("/api/admin/mistake/renew", { id, testId }, {
      method: 'PUT'
    });
    if (!success) {
      toast.error(message);
      return;
    }
    toast.success(message);
    fetchUserMisspelledList(userInfo._id);
  }

  const renderMisspelledList = () => {
    return misspelledList.map(({
      chapterNo,
      testPaperNo,
      accuracyCount,
      accuracyRate,
      totalCount,
      testId,
      _id,
      createdAt,
    }) => (
      <tr key={_id} className="hover:bg-secondary-200">
        <td className="border border-primary">{new Date(createdAt).toLocaleDateString()}</td>
        <td className="border border-primary">{chapterNo}</td>
        <td className="border border-primary">{testPaperNo}</td>
        <td className="border border-primary">{accuracyCount}</td>
        <td className="border border-primary">{accuracyRate.toFixed(2)}%</td>
        <td className="border border-primary">{totalCount}</td>
        <td className="border border-primary">
          <Link to={`/admin/misspelled/dictation/${testId}`} state={{ testId, chapterNo, testPaperNo }}
            className="hover:text-primary cursor-pointer mr-3">
            View
          </Link>
          <span className="hover:text-primary cursor-pointer" onClick={() => { handleRecheck(_id, testId) }}>
            Recheck
          </span>
        </td>
      </tr>
    ));
  }

  return (
    <div className="container mt-3 mx-auto px-3 h-full flex flex-col">
      <h1 className="text-3xl font-black flex items-center justify-between">
        Misspelled Table Management
        <div className="text-sm font-normal">
          {/* User List: */}
          <select name="userList" id="userList" className="ml-3 min-h-10 px-4 bg-transparent outline-none">
            {
              userList.map((item: User) => (
                <option key={item._id} id={item._id} value={item.username}>{item.username}</option>
              ))
            }
          </select>
        </div>
      </h1>
      <hr className="my-3" />
      <div className="overflow-auto h-full">
        <div className="max-h-96">
          <table className="w-full border text-center border-primary">
            <thead className="bg-secondary-700 ">
              <tr>
                <th className="border border-primary">Test Date</th>
                <th className="border border-primary">Chapter</th>
                <th className="border border-primary">Test Paper</th>
                <th className="border border-primary">Accuracy Count</th>
                <th className="border border-primary">Accuracy Rate</th>
                <th className="border border-primary">Total Count</th>
                <th className="border border-primary">Action</th>
              </tr>
            </thead>
            <tbody>
              {renderMisspelledList()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default MisspelledPage;