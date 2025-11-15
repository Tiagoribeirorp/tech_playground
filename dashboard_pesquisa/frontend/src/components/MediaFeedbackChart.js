import React from 'react';
// A importação do tipo de gráfico (Radar) continua!
import { Radar } from 'react-chartjs-2';

// AS LINHAS DE 'Chart as ChartJS' E 'ChartJS.register' FORAM REMOVIDAS DAQUI.
// Elas agora vivem no arquivo 'src/chartConfig.js' e são chamadas no 'src/index.js'.

const MediaFeedbackChart = ({ data }) => {
  const labels = [
    'Interesse no Cargo', 'Contribuição', 'Aprendizado', 'Feedback', 
    'Interação Gestor', 'Clareza Carreira', 'Expectativa Permanência'
  ];
  
  // Garante que 'data' exista antes de tentar acessar suas propriedades
  const chartValues = data ? [
    data.interesse, data.contribuicao, data.aprendizado, data.feedback,
    data.interacao_gestor, data.clareza_carreira, data.expectativa_permanencia
  ].map(val => parseFloat(val || 0).toFixed(2)) : []; // Se não houver dados, usa um array vazio

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
