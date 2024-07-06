import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom"
import { toast } from "react-toastify";

import Dictation from "../../../components/dictation";
import { get, post } from "../../../utils/fetch";

const AdminDictationPage = () => {

  const { state } = useLocation();
  const { testId } = state;

  const [words, setWords] = useState<string[]>([]);

  useEffect(() => {
    // Get DictationMistake data via id;
    const getDictationMistakeData = async () => {
      const { success, data } = await get('/api/admin/dictation/query', { testId });
      if (success && data) {
        setWords(data.words);
      }
    }
    // Get dictation mistake list
    getDictationMistakeData();
  }, [testId]);

  // onSubmit, update dictation record by testId
  const handleSubmit = async (words: string[]) => {
    const { success, message } = await post("/api/admin/dictation/update", {
      id: testId,
      words
    }, {
      method: "PUT"
    });
    if (!success) { return toast.error(message); }
    toast.success(message);
  }

  const props = {
    words,
    onSubmit: handleSubmit,
    ...state
  }

  return (
    <div className="container mt-3 mx-auto px-3 h-full flex flex-col">
      <h1 className="text-3xl font-black flex items-center justify-between">
        <Link to="/admin/misspelled" className="text-base hover:text-primary cursor-pointer">
          Back
        </Link>
        Dictation Record Detail
      </h1>
      <hr className="my-3" />
      <Dictation {...props} />
    </div>
  )
}

export default AdminDictationPage;