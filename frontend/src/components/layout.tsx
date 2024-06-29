import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

import { useAuth } from "./authProvider";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {

  const navigate = useNavigate();
  const { isLoggedIn, userInfo, logout } = useAuth();

  const handleClickLogin = () => {
    if (isLoggedIn) {
      logout();
    }
    navigate('/login');
  }

  const RenderPersonalCentre = () => {
    if (!isLoggedIn) return null;
    console.log(userInfo);
    if (userInfo.role === 'admin') {
      return (
        <li className='hover:text-primary min-w-20 text-center'>
          Administrator
        </li>
      )
    }
    return (
      <li className='hover:text-primary min-w-20 text-center'>
        <Link to="/user-center">User Center</Link>
      </li>
    )
  }

  return (
    <div className="layout flex flex-col h-full">
      <header className='h-16 min-h-16 flex justify-center items-center'>
        <div className="container flex justify-between">
          <div>
            IELTS
          </div>
          <nav>
            <ul className='flex gap-4'>
              <li className='hover:text-primary min-w-20 text-center'>
                <Link to="/">Home</Link>
              </li>
              <li className='hover:text-primary min-w-20 text-center'>
                <Link to="/chapters">Chapters</Link>
              </li>
              <RenderPersonalCentre />
              <li className='hover:text-primary min-w-20 text-center' onClick={handleClickLogin}>
                <span className='cursor-pointer'>
                  {isLoggedIn ? 'Logout' : 'Login'}
                </span>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className='flex flex-col flex-1'>{children}</main>
      <footer className='h-16 min-h-16 flex justify-center items-center'>
        <p className='text-center'>
          Powered by Yunxiang Gu 2024
        </p>
      </footer>
    </div>
  )
}

export default Layout;