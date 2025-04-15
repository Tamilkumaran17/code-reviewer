import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine
} from "recharts";

const ratingData = [
  { contest: "Week 1", rating: 40 },
  { contest: "Week 2", rating: 50 },
  { contest: "Week 3", rating: 80 },
  { contest: "Week 4", rating: 70 },
  { contest: "Week 5", rating: 90 },
  { contest: "Week 7", rating: 30 },
  { contest: "Week 8", rating: 50 },
  { contest: "Week 9", rating: 70 },
  { contest: "Week 10", rating: 10 },
];

const RatingChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={ratingData} margin={{ top: 10, right: 10, left: -15, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="contest" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        {/* Optional threshold lines like LeetCode rating tiers
        <ReferenceLine y={1600} label="Knight" stroke="#00C49F" strokeDasharray="3 3" />
        <ReferenceLine y={1800} label="Guardian" stroke="#FFBB28" strokeDasharray="3 3" /> */}

        <Line
          type="monotone"
          dataKey="rating"
          stroke="#8884d8"
          strokeWidth={2.3}
          dot={{ r: 5 }}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RatingChart;