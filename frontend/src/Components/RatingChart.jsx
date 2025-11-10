import { Bar,PolarArea} from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Ticks } from "chart.js";
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
        backgroundColor: "rgba(9, 248, 89, 0.76)",
        borderColor: "rgba(75, 192, 98, 1)",
        borderWidth: 1,
        barThickness: 45
      },
    ],
  };

  const options = {
    responsive:true,
    // maintainAspectRatio: false,
    scales: {
      x:{
        ticks:{
          font:{
            size:12,
          },
        },
      },
      y: {
        beginAtZero: true,
        max: 10,
        ticks:{
          stepSize:2,
          font:{
            size:12,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return <Bar data={data} options={options} />
}
