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
import RegisterPage from './pages/register';
import UserCenter from './pages/user-center';
import VocabularyTraining from './pages/user-center/training';
import GuJiaBeiPage from './pages/gujiabei';

import AdminPage from './pages/admin';
import MisspelledPage from './pages/admin/misspelled';
import AdminDictationPage from './pages/admin/misspelled/dictation';
import WhiteListPage from './pages/admin/whitelist';
import VocabularyPage from './pages/admin/vocabulary';
import UserCenterLayout from './components/userCenterLayout';
import Schedule from './pages/user-center/schedule';
import BandExpectPage from './pages/user-center/band';
import ValidationPage from './pages/admin/misspelled/validation';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />}></Route>
          <Route path="/chapters" element={<Layout><ChaptersPage /></Layout>}></Route>
          <Route path="/chapters/:ChpaterId/:TestPaperId" element={<Layout><TestPaperPage /></Layout>}></Route>
          <Route path="/user-center" element={<Layout><UserCenterLayout><UserCenter /></UserCenterLayout></Layout>}></Route>
          <Route path="/user-center/schedule" element={<Layout><UserCenterLayout><Schedule /></UserCenterLayout></Layout>}></Route>
          <Route path="/user-center/band-expect" element={<Layout><UserCenterLayout><BandExpectPage /></UserCenterLayout></Layout>}></Route>
          <Route path="/training/:id" element={<Layout><VocabularyTraining /></Layout>}></Route>
          <Route path="/gujiabei-6000words" element={<Layout><GuJiaBeiPage /></Layout>}></Route>
          <Route path="/admin" element={<Layout><AdminPage /></Layout>}></Route>
          <Route path="/admin/misspelled" element={<Layout><MisspelledPage /></Layout>}></Route>
          <Route path="/admin/misspelled/dictation/:TestId" element={<Layout><AdminDictationPage /></Layout>}></Route>
          <Route path="/admin/misspelled/validation/:TestId" element={<Layout><ValidationPage /></Layout>}></Route>
          <Route path="/admin/whitelist" element={<Layout><WhiteListPage /></Layout>}></Route>
          <Route path="/admin/vocabulary" element={<Layout><VocabularyPage /></Layout>}></Route>
          <Route path="/login" element={<Layout><LoginPage /></Layout>}></Route>
          <Route path="/register" element={<Layout><RegisterPage /></Layout>}></Route>
        </Routes>
      </Router>
      <ToastContainer position="bottom-right" />
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
