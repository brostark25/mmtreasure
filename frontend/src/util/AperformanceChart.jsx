import React from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const PerformanceChart = () => {
  // Sample data for game performance
  const radarData = {
    labels: ["Paragmatic Play", "Live Casino", "Shan Koe Mee"], // Game Names
    datasets: [
      {
        label: "Performance Score",
        data: [70, 20, 90], // Performance scores for the games
        backgroundColor: "rgba(79, 129, 189, 0.2)", // Soft blue
        borderColor: "#4F81BD", // Blue color
        borderWidth: 3,
        pointBackgroundColor: "#4F81BD", // Points color
        pointBorderColor: "#FFF", // Border for points
        pointBorderWidth: 2,
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: "rgba(0, 0, 0, 0.1)" }, // Light grid lines
        grid: { color: "rgba(0, 0, 0, 0.1)" }, // Subtle grid
        ticks: {
          display: true,
          backdropColor: "transparent", // No backdrop
          color: "#000", // Black ticks
          stepSize: 20, // Increment steps
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "#000", // Black legend text
          font: { size: 14 },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#FFF", // White tooltip
        titleColor: "#000", // Black title text
        bodyColor: "#000", // Black body text
        borderColor: "#4F81BD", // Blue border
        borderWidth: 1,
        cornerRadius: 4,
      },
    },
  };

  return (
    <div className="p-6 shadow-md">
      <div className="w-full h-64">
        <Radar data={radarData} options={radarOptions} />
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Visual representation of agent unit sell performance scores base on
          games.
        </p>
      </div>
    </div>
  );
};

export default PerformanceChart;
