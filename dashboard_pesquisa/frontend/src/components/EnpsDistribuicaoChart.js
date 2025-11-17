import React from 'react';
//import { Pie } from 'react-chartjs-2';
import { Doughnut } from 'react-chartjs-2';




const EnpsDistribuicaoChart = ({ data }) => {
  const total = parseInt(data.promotores) + parseInt(data.neutros) + parseInt(data.detratores);
  const eNPS = total > 0 ? (((data.promotores - data.detratores) / total) * 100).toFixed(1) : 0;

  const chartData = {
    labels: ['Promotores (9-10)', 'Neutros (7-8)', 'Detratores (0-6)'],
    datasets: [
      {
        label: 'Contagem',
        data: [data.promotores, data.neutros, data.detratores],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(255, 99, 132, 0.7)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Distribuição eNPS (Score: ${eNPS})` },
    },
  };

  return (
    <div className="chart-container">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default EnpsDistribuicaoChart;
