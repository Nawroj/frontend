import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function EventCategoriesChart({ data }) {
  const chartData = data.map((item, index) => ({
    name: item.category,
    count: item.count,
    index: index + 1
  }));

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Event Categories Over Time</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
            fontSize={12}
          />
          <YAxis fontSize={12} />
          <Tooltip 
            formatter={(value, name) => [value, 'Count']}
            labelFormatter={(label) => `Category: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#6050dc" 
            strokeWidth={3}
            dot={{ fill: '#6050dc', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, stroke: '#6050dc', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EventCategoriesChart;