import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// Custom Y-axis tick: show only first 5 words split into max 2 lines
const renderYAxisTickWithMaxFiveWords = ({ x, y, payload }) => {
  const words = payload.value.split(' ').slice(0, 5);
  const lines = [];

  let currentLine = '';
  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length > 18 && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) lines.push(currentLine);

  return (
    <g transform={`translate(${x},${y})`}>
      {lines.slice(0, 2).map((line, index) => (
        <text
          key={index}
          x={0}
          y={0}
          dy={index * 12}
          textAnchor="end"
          fontSize={12}
        >
          {line}{index === 1 && words.length > 2 && '…'}
        </text>
      ))}
    </g>
  );
};

const AttrCountsChart = ({ data }) => {
  const top10Data = [...data].sort((a, b) => b.count - a.count).slice(0, 10);

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Top 10 Attribute Counts by Event</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={top10Data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="event"
            tick={renderYAxisTickWithMaxFiveWords}
            width={160}
          />
          <Tooltip />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttrCountsChart;
