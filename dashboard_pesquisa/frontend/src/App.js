import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import Filtros from './components/Filtros';
import FuncionariosPorAreaChart from './components/FuncionariosPorAreaChart';
import MediaFeedbackChart from './components/MediaFeedbackChart';
import EnpsDistribuicaoChart from './components/EnpsDistribuicaoChart';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({ area: '', cargo: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams(filtros).toString();
    
    const endpoints = {
      filtros: `${API_BASE_URL}/filters`,
      enps: `${API_BASE_URL}/kpis/enps?${params}`,
      funcionariosPorArea: `${API_BASE_URL}/employees/by-area?${params}`
    };

    try {
      const [
        filtrosResponse, 
        enpsResponse, 
        funcionariosPorAreaResponse
      ] = await Promise.all([
        axios.get(endpoints.filtros),
        axios.get(endpoints.enps),
        axios.get(endpoints.funcionariosPorArea)
      ]);

      const enpsData = enpsResponse.data;
      const funcionariosPorAreaData = funcionariosPorAreaResponse.data;
      const filtrosData = filtrosResponse.data;

      const mediaFeedbackPlaceholder = [
        { name: 'Interesse no Cargo', value: 0 },
        { name: 'Feedback', value: 0 }
      ];

      const consolidatedData = {
        filtros: filtrosData,
        funcionariosPorArea: funcionariosPorAreaData,
        distribuicaoEnps: enpsData.distribuicao || [],
        mediaFeedback: enpsData.mediaFeedback || mediaFeedbackPlaceholder,
        enpsScore: enpsData.enpsScore
      };

      setDashboardData(consolidatedData);

    } catch (err) {
      console.error("Erro ao carregar dados do dashboard:", err);
      setError("Não foi possível carregar os dados. Verifique o console e o servidor backend.");
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div className="status-message loading">Carregando Dashboard...</div>;
  }

  if (error) {
    return <div className="status-message error">{error}</div>;
  }

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