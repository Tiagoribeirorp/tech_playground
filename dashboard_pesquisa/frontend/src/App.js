import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Filtros from './components/Filtros';
import FuncionariosPorAreaChart from './components/FuncionariosPorAreaChart';
import MediaFeedbackChart from './components/MediaFeedbackChart';
import EnpsDistribuicaoChart from './components/EnpsDistribuicaoChart';
import './App.css';

const App = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ area: '', cargo: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(filtros).filter(([_, value]) => value !== '')
      );
      const params = new URLSearchParams(activeFilters).toString();
      
      // Usando a URL completa para funcionar com a configuração CORS do backend
      const fullURL = `http://localhost:3001/api/dashboard-data?${params}`;
      console.log("Buscando dados da URL:", fullURL );

      // A chamada axios usa a variável fullURL
      const response = await axios.get(fullURL);
      setDashboardData(response.data);

    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFiltroChange = (nomeFiltro, valor) => {
    setFiltros(prevFiltros => ({ ...prevFiltros, [nomeFiltro]: valor }));
  };

  if (loading) {
    return <div className="loading">Carregando Dashboard...</div>;
  }

  if (!dashboardData) {
    return <div className="loading">Não foi possível carregar os dados. Verifique o console e o servidor backend.</div>;
  }

  return (
    <div className="App">
      <header className="App-header"><h1>Dashboard de Pesquisa de Satisfação</h1></header>
      <main>
        <Filtros
          filtrosDisponiveis={dashboardData.filtros}
          filtrosAtuais={filtros}
          onFiltroChange={handleFiltroChange}
        />
        <div className="charts-grid">
          <MediaFeedbackChart data={dashboardData.mediaFeedback} />
          <EnpsDistribuicaoChart data={dashboardData.distribuicaoEnps} />
          <FuncionariosPorAreaChart data={dashboardData.funcionariosPorArea} />
        </div>
      </main>
    </div>
  );
};

export default App;
