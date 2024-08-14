import classNames from 'classnames';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface UserCenterLayoutProps {
  children: React.ReactNode;
}

function UserCenterLayout({ children }: UserCenterLayoutProps) {

  const location = useLocation();
  const { pathname } = location;

  return (
    <div className='container mx-auto flex flex-col mt-8 px-3 justify-center gap-6'>
      <nav>
        <ul className='flex gap-3'>
          <li className={classNames('border border-dashed border-primary py-2 px-3 hover:text-primary text-center cursor-pointer', { 'bg-secondary-300 text-primary': pathname === '/user-center' })}>
            <Link to="/user-center">Accuracy Statistic</Link>
          </li>
          <li className={classNames('border border-dashed border-primary py-2 px-3 hover:text-primary text-center cursor-pointer', { 'bg-secondary-300 text-primary': pathname === '/user-center/schedule' })}>
            <Link to="/user-center/schedule">Review Schedule</Link>
          </li>
          <li className={classNames('border border-dashed border-primary py-2 px-3 hover:text-primary text-center cursor-pointer', { 'bg-secondary-300 text-primary': pathname === '/user-center/band-expect' })}>
            <Link to="/user-center/band-expect">Band Expect</Link>
          </li>
          {/* <li className={classNames('border border-dashed border-primary py-2 px-3 hover:text-primary text-center cursor-pointer', { 'bg-secondary-300 text-primary': pathname === '/user-center/changePassword' })}>
            <Link to="/user-center/changePassword">Change Password</Link>
          </li>
          <li className={classNames('border border-dashed border-primary py-2 px-3 hover:text-primary text-center cursor-pointer', { 'bg-secondary-300 text-primary': pathname === '/user-center/deleteAccount' })}>
            <Link to="/user-center/deleteAccount">Delete Account</Link>
          </li> */}
        </ul>
      </nav>
      {children}
    </div>
  );
};

export default UserCenterLayout;