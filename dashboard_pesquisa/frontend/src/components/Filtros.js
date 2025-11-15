import React from 'react';

// Recebe os filtros disponíveis e a função para atualizar os filtros no App.js
const Filtros = ({ filtrosDisponiveis, onFiltroChange }) => {

  // Função para lidar com a mudança em qualquer um dos selects
  const handleChange = (event) => {
    const { name, value } = event.target;
    // Chama a função do componente pai (App.js) para atualizar o estado dos filtros
    onFiltroChange(prevFiltros => ({
      ...prevFiltros,
      [name]: value,
    }));
  };

  // Extrai as listas de áreas e cargos das props com segurança
  // Se filtrosDisponiveis não existir, ou se areas/cargos não existirem, usa um array vazio como padrão
  const areas = filtrosDisponiveis?.areas || [];
  const cargos = filtrosDisponiveis?.cargos || [];

  return (
    <div className="filtros-container">
      {/* Filtro de Área */}
      <div className="filtro-item">
        <label htmlFor="area-select">Filtrar por Área:</label>
        <select id="area-select" name="area" onChange={handleChange}>
          <option value="">Todas</option>
          {/* O .map só será executado se 'areas' for um array */}
          {areas.map((area, index) => (
            <option key={index} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro de Cargo */}
      <div className="filtro-item">
        <label htmlFor="cargo-select">Filtrar por Cargo:</label>
        <select id="cargo-select" name="cargo" onChange={handleChange}>
          <option value="">Todos</option>
          {/* O .map só será executado se 'cargos' for um array */}
          {cargos.map((cargo, index) => (
            <option key={index} value={cargo}>
              {cargo}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Filtros;
