import React from 'react';
import { Competitor } from '../types';

interface MarketSharePieChartProps {
  playerShare: number;
  competitors: Competitor[];
}

const MarketSharePieChart: React.FC<MarketSharePieChartProps> = ({ playerShare, competitors }) => {
  const data = [
    { name: 'Цитрін', value: playerShare, color: '#fde047' }, // yellow-300
    { name: competitors[0]?.name || 'C1', value: competitors[0]?.marketShare || 0, color: '#f87171' }, // red-400
    { name: competitors[1]?.name || 'C2', value: competitors[1]?.marketShare || 0, color: '#60a5fa' }, // blue-400
  ];
  const otherShare = 100 - data.reduce((sum, item) => sum + item.value, 0);
  if (otherShare > 0) {
      data.push({ name: 'Інші', value: otherShare, color: '#9ca3af' }); // gray-400
  }


  let cumulativePercent = 0;

  return (
    <div className='text-center'>
      <h4 className='text-xs font-bold mb-1'>Частка ринку</h4>
      <svg viewBox="0 0 32 32" className="w-full h-auto">
        {data.map((slice, index) => {
          if (slice.value <= 0) return null;
          const startAngle = (cumulativePercent / 100) * 360;
          cumulativePercent += slice.value;
          const endAngle = (cumulativePercent / 100) * 360;

          const largeArcFlag = slice.value > 50 ? 1 : 0;

          const x1 = 16 + 15 * Math.cos(Math.PI * startAngle / 180);
          const y1 = 16 + 15 * Math.sin(Math.PI * startAngle / 180);
          const x2 = 16 + 15 * Math.cos(Math.PI * endAngle / 180);
          const y2 = 16 + 15 * Math.sin(Math.PI * endAngle / 180);

          return (
            <path
              key={index}
              d={`M16,16 L${x1},${y1} A15,15 0 ${largeArcFlag},1 ${x2},${y2} z`}
              fill={slice.color}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default MarketSharePieChart;
