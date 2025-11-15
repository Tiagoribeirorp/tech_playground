import React from 'react';
import { Bar } from 'react-chartjs-2';




const FuncionariosPorAreaChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.area),
    datasets: [
      {
        label: 'Nº de Funcionários',
        data: data.map(item => item.count),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Funcionários por Departamento' },
    },
  };

  return (
    <div className="chart-container">
      <Bar options={options} data={chartData} />
    </div>
  );
};

export default FuncionariosPorAreaChart;
