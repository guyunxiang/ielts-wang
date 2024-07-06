import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

import { useAuth } from "./authProvider";
import React from 'react';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {

  const navigate = useNavigate();
  const { isLoggedIn, userInfo, logout } = useAuth();

  const { role } = userInfo;

  const handleClickLogin = () => {
    if (isLoggedIn) {
      logout();
    }
    navigate('/login');
  }

  const renderCommonNavigation = () => {
    if (role !== "admin") {
      return (
        <React.Fragment>
          <li className='hover:text-primary min-w-20 text-center'>
            <Link to="/chapters">Chapters</Link>
          </li>
        </React.Fragment>
      )
    }
  }

  const renderUserNavigation = () => {
    if (role === "user") {
      return (
        <React.Fragment>
          <li className='hover:text-primary min-w-20 text-center'>
            <Link to="/user-center">User Center</Link>
          </li>
        </React.Fragment>
      )
    }
  }

  const renderAdminNavigation = () => {
    if (role === "admin") {
      return (
        <React.Fragment>
          <li className='hover:text-primary text-center'>
            <Link to="/admin/vocabulary" className='block px-3'>
              Vocabulary
            </Link>
          </li>
          <li className='hover:text-primary text-center'>
            <Link to="/admin/whitelist" className='block px-3'>
              Whitelist
            </Link>
          </li>
          <li className='hover:text-primary text-center'>
            <Link to="/admin/misspelled" className='block px-3'>
              Misspelled Table
            </Link>
          </li>
        </React.Fragment>
      )
    }
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
              {renderCommonNavigation()}
              {renderUserNavigation()}
              {renderAdminNavigation()}
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
      <footer className='mt-3 py-3 flex justify-center items-center bg-[#ede0c7]'>
        <p className='text-center text-sm'>
          Powered by Yunxiang Gu 2024
        </p>
      </footer>
    </div>
  )
}

export default Layout;