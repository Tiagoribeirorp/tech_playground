import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

// Importação dos componentes
import Filtros from './components/Filtros';
import FuncionariosPorAreaChart from './components/FuncionariosPorAreaChart';
import MediaFeedbackChart from './components/MediaFeedbackChart';
import EnpsDistribuicaoChart from './components/EnpsDistribuicaoChart';

function App() {
  // --- ESTADOS DO COMPONENTE ---
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para os filtros
  const [filtros, setFiltros] = useState({ area: '', cargo: '' });

  // --- LÓGICA DE BUSCA DE DADOS ---
  const fetchData = useCallback(async () => {
    setLoading(true); // Garante que o loading apareça em cada nova busca
    setError(null);

    // Constrói os parâmetros da URL a partir do estado dos filtros
    const params = new URLSearchParams(filtros).toString();
    const url = `http://localhost:3001/api/dashboard-data?${params}`;
    
    console.log(`Buscando dados da URL: ${url}` );

    try {
      const response = await axios.get(url);
      setDashboardData(response.data);
    } catch (err) {
      console.error("Erro ao carregar dados do dashboard:", err);
      setError("Não foi possível carregar os dados. Verifique o console e o servidor backend.");
    } finally {
      setLoading(false); // Garante que o loading termine, com sucesso ou erro
    }
  }, [filtros]); // A função é recriada apenas quando os filtros mudam

  // Efeito para buscar os dados na montagem inicial e quando os filtros mudam
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- LÓGICA DE RENDERIZAÇÃO ---

  // 1. Estado de Carregamento
  if (loading) {
    return <div className="status-message loading">Carregando Dashboard...</div>;
  }

  // 2. Estado de Erro
  if (error) {
    return <div className="status-message error">{error}</div>;
  }

  // 3. Estado de Sucesso (só renderiza se não estiver carregando e não houver erro)
  return (
    <div className="App">
      <header className="App-header">
        <h1>Dashboard de Pesquisa de Satisfação</h1>
      </header>
      
      <main>
        {dashboardData && dashboardData.filtros && (
          <Filtros 
            filtrosDisponiveis={dashboardData.filtros} 
            onFiltroChange={setFiltros} 
          />
        )}

        {dashboardData ? (
          <div className="charts-grid">
            <FuncionariosPorAreaChart data={dashboardData.funcionariosPorArea} />
            <MediaFeedbackChart data={dashboardData.mediaFeedback} />
            <EnpsDistribuicaoChart data={dashboardData.distribuicaoEnps} />
          </div>
        ) : (
          <p>Nenhum dado para exibir.</p>
        )}
      </main>
    </div>
  );
}

export default App;
