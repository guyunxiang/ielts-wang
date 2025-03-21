import classNames from 'classnames';

function Schedule() {

  const currentDate = new Date();
  const currentDay = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="flex justify-between">
      <table className='border-collapse border border-primary text-center text-[#92400e]'>
        <thead>
          <tr className='bg-secondary-700'>
            <th className='border border-primary px-3 py-2'>Day</th>
            <th className='border border-primary px-3 py-2'>Tasks</th>
            <th className='border border-primary px-3 py-2'>Vocabulary</th>
          </tr>
        </thead>
        <tbody>
          <tr className={classNames({ 'bg-secondary-300': currentDay === 'Monday' })}>
            <td className='border border-primary px-3 py-1 bg-secondary-400'>Monday</td>
            <td className='border border-primary px-3 py-1 text-[#92400e] font-bold'>
              <div className="flex justify-between gap-3">
                <span>Chapter 3 <sup>Test Paper 1 - 5</sup></span>
                <span>Chapter 11 <sup>Section 1</sup></span>
              </div>
            </td>
            <td className='border border-primary px-3 py-1 text-[#92400e] font-bold'>
              <span>991</span>
            </td>
          </tr>
          <tr className={classNames({ 'bg-secondary-300': currentDay === 'Tuesday' })}>
            <td className='border border-primary px-3 py-1 bg-secondary-400'>Tuesday</td>
            <td className='border border-primary px-3 py-1 text-[#92400e] font-bold'>
              <div className="flex justify-between gap-3">
                <span>Chapter 3 <sup>Test Paper 6 - 9</sup></span>
                <span>Chapter 4 <sup>Test Paper 1</sup></span>
                <span>Chapter 11 <sup>Section 2</sup></span>
              </div>
            </td>
            <td className='border border-primary px-3 py-1 text-[#92400e] font-bold'>
              <span>1010</span>
            </td>
          </tr>
          <tr className={classNames({ 'bg-secondary-300': currentDay === 'Wednesday' })}>
            <td className='border border-primary px-3 py-1 bg-secondary-400'>Wednesday</td>
            <td className='border border-primary px-3 py-1 text-[#92400e] font-bold'>
              <div className="flex gap-3">
                <span>Chapter 4 <sup>Test Paper 2 - 4</sup></span>
                <span>Chapter 5 <sup>Test Paper 1 - 6</sup></span>
              </div>
            </td>
            <td className='border border-primary px-3 py-1 text-[#92400e] font-bold'>
              <span>894</span>
            </td>
          </tr>
          <tr className={classNames({ 'bg-secondary-300': currentDay === 'Thursday' })}>
            <td className='border border-primary px-3 py-1 bg-secondary-400'>Thursday</td>
            <td className='border border-primary px-3 py-1 text-[#92400e] font-bold'>
              <div className="flex justify-between gap-3">
                <span>Chapter 5 <sup>Test Paper 7 - 11</sup></span>
                <span>Chapter 11 <sup>Section 3</sup></span>
              </div>
            </td>
            <td className='border border-primary px-3 py-1 text-[#92400e] font-bold'>
              <span>1031</span>
            </td>
          </tr>
          <tr className={classNames({ 'bg-secondary-300': currentDay === 'Friday' })}>
            <td className='border border-primary px-3 py-1 bg-secondary-400'>Friday</td>
            <td className='border border-primary px-3 py-1 text-[#92400e] font-bold'>
              <div className="flex justify-between gap-3">
                <span>Chapter 5 <sup>12</sup></span>
                <span>Chapter 11 <sup>Section 4</sup></span>
              </div>
            </td>
            <td className='border border-primary px-3 py-1 text-[#92400e] font-bold'>
              <span>1000</span>
            </td>
          </tr>
          <tr className={classNames({ 'bg-secondary-300': currentDay === 'Saturday' })}>
            <td className='border border-primary px-3 py-1 bg-secondary-400'>Saturday</td>
            <td className='border border-primary px-3 py-1 text-[#92400e] font-bold'>
              <span>Listening Test</span>
            </td>
          </tr>
          <tr className={classNames({ 'bg-secondary-300': currentDay === 'Sunday' })}>
            <td className='border border-primary px-3 py-1 bg-secondary-400'>Sunday</td>
            <td className='border border-primary px-3 py-1 text-[#92400e] font-bold'>
              -
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Schedule;