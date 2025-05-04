import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from "chart.js";
import React from "react";

ChartJS.register(BarElement, CategoryScale, LinearScale);

export default function RatingChart({ ratings }) {
  if (!ratings || ratings.length === 0) {
    return null;
  }

  const data = {
    // labels: [
    //   "Time Complexity",
    //   "Memory Usage",
    //   "Code Structure",
    //   "Algorithm Efficiency",
    //   "Readability",
    // ],
    datasets: [
      {
        label: "Code Rating",
        data: ratings,
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return <Bar data={data} options={options} />;
}
