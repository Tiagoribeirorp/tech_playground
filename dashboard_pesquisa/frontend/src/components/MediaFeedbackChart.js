import React from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const MediaFeedbackChart = ({ data }) => {
  const labels = [
    'Interesse no Cargo', 'Contribuição', 'Aprendizado', 'Feedback', 
    'Interação Gestor', 'Clareza Carreira', 'Expectativa Permanência'
  ];
  
  const chartValues = [
    data.interesse, data.contribuicao, data.aprendizado, data.feedback,
    data.interacao_gestor, data.clareza_carreira, data.expectativa_permanencia
  ].map(val => parseFloat(val || 0).toFixed(2)); // Garante que é um número e formata

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Pontuação Média',
        data: chartValues,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Pontuações Médias de Feedback' },
    },
    scales: {
      r: {
        angleLines: { display: false },
        suggestedMin: 0,
        suggestedMax: 10,
      },
    },
  };

  return (
    <div className="chart-container">
      <Radar data={chartData} options={options} />
    </div>
  );
};

export default MediaFeedbackChart;
