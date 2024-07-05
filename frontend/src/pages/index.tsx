import { useNavigate } from 'react-router-dom';

import { useAuth } from '../components/authProvider';

import './index.css';

// home page
function HomePage() {

  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const { role } = userInfo;

  const getStart = () => {
    if (role === "admin") {
      navigate("/admin/vocabulary");
      return;
    }
    navigate("/chapters");
  }

  return (
    <div className="App">
      <header className="App-header mt-32 p-16 text-center">
        <h2 className='text-5xl font-black text-primary'>雅思王听力真题语料库</h2>
        <h1 className='text-7xl mt-12 font-bold'>IELTS</h1>
      </header>
      <div className='px-16 pt-8'>
        <h2 className='text-3xl text-right text-primary'>（机考笔试第二版）</h2>
        <h3 className='mt-8 text-3xl text-center'>王陆 编著</h3>
        <div className='note mt-24 text-center text-primary'>
          <p className='text-3xl'>含《剑18》内容</p>
          <p className='mt-4 text-3xl'>愿每一位考生梦想成真</p>
        </div>
      </div>
      <div className='text-center mt-24'>
        <span className='text-2xl underline cursor-pointer text-primary' onClick={getStart}>
          开始
        </span>
      </div>
    </div>
  );
}

export default HomePage;
