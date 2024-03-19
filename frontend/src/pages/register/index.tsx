import { useState, FormEvent } from "react"
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import sha256 from 'crypto-js/sha256';

import { useAuth } from "../../components/authProvider";
import { post } from '../../utils/fetch';

interface FormData {
  username: String,
  password: String,
  repassword: String,
}

const RegisterPage = () => {

  const navigate = useNavigate();

  const { login } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
    repassword: ""
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

  const validateFormData = () => {
    const {
      username,
      password,
      repassword
    } = formData;
    console.log(formData);
    if (!username || !password || !repassword) {
      toast.warn("Username and Password are required!");
      return false;
    }
    if (password !== repassword) {
      toast.warn("Please confirm your password!");
      return false;
    }
    return true;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const {
      username,
      password,
    } = formData;
    // validate form data
    if (!validateFormData()) return;
    const { success, message } = await post('/api/auth/register', {
      username,
      password: sha256(password.toString()).toString()
    });
    if (success) {
      toast.success(message, { autoClose: 3000 });
      login();
      navigate('/chapters');
    }
  }

  return (
    <div className="register-page">
      <div className="mt-16">
        <form
          id="login-form"
          className="container border w-2/5 min-w-96 mx-auto bg-white p-8 py-12"
          onSubmit={handleSubmit}>
          <h1 className="text-3xl font-bold text-center mb-8">
            Sign up
          </h1>
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
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              name="password"
              className="border h-8 px-2"
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2 mb-8">
            <label htmlFor="repassword">Confirm Password:</label>
            <input
              type="password"
              name="repassword"
              className="border h-8 px-2"
              onChange={handleInputChange}
              onKeyUp={handleKeyPress}
            />
          </div>
          <div className="grid gap-2 mb-8 text-right">
            <Link to="/login" className="hover:text-primary">Log in</Link>
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

export default RegisterPage;