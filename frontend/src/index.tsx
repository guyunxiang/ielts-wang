import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

import reportWebVitals from './reportWebVitals';

import Layout from './components/layout';
import App from './pages';
import ChaptersPage from './pages/chapters';
import ChapterPage from './pages/chapters/chapter';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />}></Route>
        <Route path="/chapters" element={<Layout><ChaptersPage /></Layout>}></Route>
        <Route path="/chapters/:chapterId" element={<Layout><ChapterPage /></Layout>}></Route>
      </Routes>
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
