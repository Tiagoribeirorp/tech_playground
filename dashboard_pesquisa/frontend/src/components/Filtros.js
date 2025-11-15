import React from 'react';

const Filtros = ({ filtrosDisponiveis, filtrosAtuais, onFiltroChange }) => {
  const { areas = [], cargos = [] } = filtrosDisponiveis;

  return (
    <div className="filtros-container">
      <div className="filtro-item">
        <label htmlFor="area-select">Filtrar por Área:</label>
        <select
          id="area-select"
          value={filtrosAtuais.area}
          onChange={(e) => onFiltroChange('area', e.target.value)}
        >
          <option value="">Todas</option>
          {areas.map(area => <option key={area} value={area}>{area}</option>)}
        </select>
      </div>
      <div className="filtro-item">
        <label htmlFor="cargo-select">Filtrar por Cargo:</label>
        <select
          id="cargo-select"
          value={filtrosAtuais.cargo}
          onChange={(e) => onFiltroChange('cargo', e.target.value)}
        >
          <option value="">Todos</option>
          {cargos.map(cargo => <option key={cargo} value={cargo}>{cargo}</option>)}
        </select>
      </div>
    </div>
  );
};

export default Filtros;
