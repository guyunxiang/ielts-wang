import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import './index.css';

import reportWebVitals from './reportWebVitals';

import Layout from './components/layout';

import { AuthProvider } from './components/authProvider';
import App from './pages';
import ChaptersPage from './pages/chapters';
import TestPaperPage from './pages/paper';
import LoginPage from './pages/login/login';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />}></Route>
          <Route path="/Chapters" element={<Layout><ChaptersPage /></Layout>}></Route>
          <Route path="/Chapters/:ChpaterId/:TestPaperId" element={<Layout><TestPaperPage /></Layout>}></Route>
          <Route path="/login" element={<Layout><LoginPage /></Layout>}></Route>
        </Routes>
      </Router>
      <ToastContainer />
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
