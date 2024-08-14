import React, { useState, useEffect } from 'react';
import { get } from '../../utils/fetch';

interface BandData {
  band: number;
  vocabularyCount: number;
  accuracyRate: number;
}

const BandExpectPage: React.FC = () => {
  const bandData = [
    {
      practiceTimes: 2,
      bandExpectation: 0.5,
    },
    {
      practiceTimes: 4,
      bandExpectation: 1,
    },
    {
      practiceTimes: 6,
      bandExpectation: 1.5,
    },
    {
      practiceTimes: 8,
      bandExpectation: 2,
    },
    {
      practiceTimes: 10,
      bandExpectation: 2.5,
    },
    {
      practiceTimes: 12,
      bandExpectation: 3,
    },
  ]

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Band Expectation</h1>
      <table className="w-full border-collapse border border-primary text-[#92400e]">
        <thead>
          <tr className="bg-secondary-700">
            <th className="border border-primary px-4 py-2">Band Expectation</th>
            <th className="border border-primary px-4 py-2">Practice Times</th>
          </tr>
        </thead>
        <tbody>
          {bandData.map((band) => (
            <tr key={band.practiceTimes}>
              <td className="border border-primary px-4 py-2 text-center">{band.bandExpectation}</td>
              <td className="border border-primary px-4 py-2 text-center">{band.practiceTimes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BandExpectPage;
