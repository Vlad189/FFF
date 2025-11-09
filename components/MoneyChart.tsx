import React from 'react';

interface MoneyChartProps {
  data: number[];
}

const MoneyChart: React.FC<MoneyChartProps> = ({ data }) => {
  const width = 100;
  const height = 50;
  const maxVal = Math.max(...data, 1); // Avoid division by zero
  const minVal = Math.min(...data);

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - minVal) / (maxVal - minVal)) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className='text-center'>
      <h4 className='text-xs font-bold mb-1'>Капітал (10д)</h4>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-gray-300 border border-black">
        <polyline
          fill="none"
          stroke="#4ade80" // green-400
          strokeWidth="2"
          points={points}
        />
      </svg>
    </div>
  );
};

export default MoneyChart;
