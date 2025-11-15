// frontend/src/chartConfig.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,        // Para Pie/Doughnut
  RadialLinearScale, // Para Radar
  PointElement,      // Para Radar/Line
  LineElement,       // Para Radar/Line
  Filler             // Para Radar (preenchimento da área)
} from 'chart.js';

// Registra TODOS os elementos que usamos no projeto
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);
