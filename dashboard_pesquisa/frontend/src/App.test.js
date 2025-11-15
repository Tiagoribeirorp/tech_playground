// frontend/src/App.test.js
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import axios from 'axios';

// Mock do Axios (continua igual)
jest.mock('axios');

// --- A "BAZUCA" ---
// Mockamos nossos próprios componentes de gráfico.
// Dizemos ao Jest: "Quando o App.js tentar usar esses componentes, renderize uma div simples em vez deles."
jest.mock('./components/FuncionariosPorAreaChart', () => () => <div data-testid="funcionarios-chart-mock">Funcionários por Departamento</div>);
jest.mock('./components/MediaFeedbackChart', () => () => <div data-testid="media-chart-mock">Pontuações Médias de Feedback</div>);
jest.mock('./components/EnpsDistribuicaoChart', () => () => <div data-testid="enps-chart-mock">Distribuição de eNPS</div>);


const mockSuccessData = {
  funcionariosPorArea: [],
  mediaFeedback: {},
  distribuicaoEnps: {},
  filtros: { areas: [], cargos: [] }
};

describe('Testes do Componente App', () => {

  beforeEach(() => {
    axios.get.mockClear();
  });

  test('deve renderizar a mensagem de carregamento', () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    render(<App />);
    expect(screen.getByText(/Carregando Dashboard.../i)).toBeInTheDocument();
  });

  test('deve renderizar o dashboard completo após o sucesso da API', async () => {
    axios.get.mockResolvedValue({ data: mockSuccessData });
    render(<App />);

    // Esperamos pelo título principal
    expect(await screen.findByText(/Dashboard de Pesquisa de Satisfação/i)).toBeInTheDocument();

    // Verificamos se os textos dos nossos mocks estão na tela
    expect(screen.getByText(/Funcionários por Departamento/i)).toBeInTheDocument();
    expect(screen.getByText(/Pontuações Médias de Feedback/i)).toBeInTheDocument();
    expect(screen.getByText(/Distribuição de eNPS/i)).toBeInTheDocument();

    // Verificamos se o loading sumiu
    expect(screen.queryByText(/Carregando Dashboard.../i)).not.toBeInTheDocument();
  });

  test('deve renderizar a mensagem de erro em caso de falha da API', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'));
    render(<App />);
    expect(await screen.findByText(/Não foi possível carregar os dados/i)).toBeInTheDocument();
  });

});
