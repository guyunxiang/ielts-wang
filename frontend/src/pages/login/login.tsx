import { useState, FormEvent } from "react"
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import sha256 from 'crypto-js/sha256';

import { useAuth } from "../../components/authProvider";
import { post } from '../../utils/fetch';

interface FormData {
  username: String,
  password: String,
}

export default function LoginPage() {

  const navigate = useNavigate();
  
  const { login, updateUserInfo } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  }

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const {
      username,
      password
    } = formData;
    if (!username || !password) {
      toast.warn("Username and Password are required!");
      return;
    }
    const { success, message, data } = await post('/api/auth/login', {
      username,
      password: sha256(password.toString()).toString()
    });
    if (success) {
      updateUserInfo(data);
      toast.success(message, { autoClose: 3000 });
      login();
      if (data.role === "user") {
        navigate('/chapters');
      } else {
        navigate("/admin/vocabulary");
      }
    }
  }

  return (
    <div className="login-page">
      <div className="mt-16">
        <form
          id="login-form"
          className="container border w-2/5 min-w-96 mx-auto bg-white p-8 py-12 max-w-md"
          onSubmit={handleSubmit}>
          <h1 className="text-3xl font-bold text-center mb-8">Login</h1>
          <div className="grid gap-2 mb-4">
            <label htmlFor="username">UserName:</label>
            <input
              type="text"
              name="username"
              autoFocus
              className="border h-8 px-2"
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2 mb-8">
            <label htmlFor="username">Password:</label>
            <input
              type="password"
              name="password"
              className="border h-8 px-2"
              onChange={handleInputChange}
              onKeyUp={handleKeyPress}
            />
          </div>
          <div className="grid gap-2 mb-8 text-right">
            <Link to="/register" className="hover:text-primary">Sign up</Link>
          </div>
          <div>
            <input
              type="button"
              value="submit"
              className="bg-blue w-full h-8 cursor-pointer bg-primary text-white"
              onClick={handleSubmit}
            />
          </div>
        </form>
      </div>
    </div>
  )
}