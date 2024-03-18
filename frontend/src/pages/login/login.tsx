import { useState, FormEvent } from "react"
import sha256 from 'crypto-js/sha256';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../components/authProvider";
import { post } from '../../utils/fetch';

interface FormData {
  username: String,
  password: String,
}

export default function LoginPage() {

  const navigate = useNavigate();
  
  const { login } = useAuth();

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

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const {
      username,
      password
    } = formData;
    if (!username || !password) {
      toast.warn("Username and Password are required!");
      return;
    }
    const { success, message } = await post('/api/auth/login', {
      username,
      password: sha256(password.toString()).toString()
    });
    if (success) {
      toast.success(message, { autoClose: 3000 });
      login();
      navigate('/');
    }
  }

  return (
    <div className="login-page">
      <div className="mt-16">
        <form id="login-form" className="container border w-2/5 min-w-96 mx-auto bg-white p-8 py-12">
          <h1 className="text-3xl font-bold text-center mb-8">Login</h1>
          <div className="grid gap-2 mb-4">
            <label htmlFor="username">UserName:</label>
            <input
              type="text"
              name="username"
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
            />
          </div>
          <div>
            <input
              type="button"
              value="submit"
              className="bg-blue w-full h-8 cursor-pointer bg-primary text-white"
              onClick={onSubmit}
            />
          </div>
        </form>
      </div>
    </div>
  )
}