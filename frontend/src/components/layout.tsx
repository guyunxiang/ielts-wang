import React, { ReactNode, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import classNames from 'classnames';

import { useAuth } from "./authProvider";

interface LayoutProps {
  children: ReactNode;
}

// NoTabUrls are the urls that should not be able to tab through
const NoTabUrls = [
  "/gujiabei-6000words"
];

function Layout({ children }: LayoutProps) {

  const navigate = useNavigate();
  const { isLoggedIn, userInfo, logout } = useAuth();
  const { pathname } = useLocation();

  const { role } = userInfo;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isNoTabUrl = NoTabUrls.some(url => pathname.startsWith(url));
      if (event.key === 'Tab' && isNoTabUrl) {
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pathname]);

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
            <Link to="/chapters" className={classNames(
              { "text-primary hover:text-secondary-500": pathname.startsWith("/chapters") }
            )}>Chapters</Link>
          </li>
        </React.Fragment>
      )
    }
  }

  const renderUserNavigation = () => {
    if (role === "user") {
      return (
        <React.Fragment>
          <li className='hover:text-primary text-center'>
            <Link
              to="/user-center"
              className={classNames(
                { "text-primary hover:text-secondary-500": pathname.startsWith("/user-center") }
              )}>
              User Center
            </Link>
          </li>
          {/* <li className='text-center hover:text-primary'>
            <Link to="/gujiabei-6000words"
              className={classNames({ "text-primary hover:text-secondary-500": pathname.startsWith("/gujiabei-6000words") })}>
              GuJiaBei 6000 words
            </Link>
          </li> */}
        </React.Fragment>
      )
    }
  }

  const renderAdminNavigation = () => {
    if (role === "admin") {
      return (
        <React.Fragment>
          <li className='hover:text-primary text-center'>
            <Link to="/admin/vocabulary" className={classNames(
              "block px-3",
              { "text-primary hover:text-secondary-500": pathname.startsWith("/admin/vocabulary") }
            )}>
              Vocabulary
            </Link>
          </li>
          <li className='hover:text-primary text-center'>
            <Link to="/admin/whitelist" className={classNames(
              "block px-3",
              { "text-primary hover:text-secondary-500": pathname.startsWith("/admin/whitelist") }
            )}>
              Whitelist
            </Link>
          </li>
          <li className='hover:text-primary text-center'>
            <Link to="/admin/misspelled" className={classNames(
              "block px-3",
              { "text-primary hover:text-secondary-500": pathname.startsWith("/admin/misspelled") }
            )}>
              Dictation
            </Link>
          </li>
        </React.Fragment>
      )
    }
  }

  return (
    <div className="layout flex flex-col h-full">
      <header className='h-16 min-h-16 flex justify-center items-center'>
        <div className="container flex justify-between px-3">
          <div>
            IELTS
          </div>
          <nav>
            <ul className='flex gap-4'>
              <li className='hover:text-primary text-center'>
                <Link to="/">Home</Link>
              </li>
              {renderCommonNavigation()}
              {renderUserNavigation()}
              {renderAdminNavigation()}
              <li className='hover:text-primary text-center cursor-pointer' onClick={handleClickLogin}>
                {isLoggedIn ? 'Logout' : 'Login'}
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className='flex flex-col flex-1'>{children}</main>
      <footer className='mt-3 py-3 flex justify-center items-center bg-[#ede0c7]'>
        <p className='text-center text-sm'>
          Powered by Yunxiang Gu 2025
        </p>
      </footer>
    </div>
  )
}

export default Layout;