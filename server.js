// server.js --- VERSÃO FINAL COM API REATORADA (TASK 9)
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3001;

// --- Middlewares ---
// Habilita CORS para todas as origens. Em produção, seria mais restrito.
app.use(cors()); 
app.use(express.json());

// --- Configuração da Conexão com o Banco de Dados ---
// Lê as credenciais das variáveis de ambiente (para Docker) ou usa valores padrão.
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'Bioquimica@1',
  port: 5432,
});

// --- Funções Auxiliares ---
const executeQuery = async (query, params = []) => {
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error(`Erro ao executar a query: ${query}`, error);
    throw error; // Propaga o erro para ser tratado pelo endpoint
  }
};

// ==============================================================================
// ENDPOINTS DA API DE RH (TASK 9)
// ==============================================================================

/**
 * @route GET /api/kpis/enps
 * @description Retorna o score eNPS geral da companhia.
 * @returns {object} Ex: { enps_score: 45.5 }
 */
app.get('/api/kpis/enps', async (req, res) => {
  try {
    const rows = await executeQuery(`
      SELECT 
        (
          (SUM(CASE WHEN enps >= 9 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) -
          (SUM(CASE WHEN enps <= 6 THEN 1 ELSE 0 END) * 100.0 / COUNT(*))
        ) as enps_score
      FROM bronze.pesquisa_satisfacao;
    `);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular eNPS.' });
  }
});

/**
 * @route GET /api/employees/by-area
 * @description Retorna a contagem de funcionários por departamento (área).
 * @returns {array} Ex: [{ area: 'Tecnologia', count: '50' }, ...]
 */
app.get('/api/employees/by-area', async (req, res) => {
  try {
    const rows = await executeQuery(`
      SELECT area, COUNT(*) as count 
      FROM bronze.pesquisa_satisfacao 
      GROUP BY area 
      ORDER BY area;
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar funcionários por área.' });
  }
});

/**
 * @route GET /api/filters
 * @description Retorna as listas de áreas e cargos únicos para preencher os filtros.
 * @returns {object} Ex: { areas: ['Administrativo', ...], cargos: ['Analista', ...] }
 */
app.get('/api/filters', async (req, res) => {
  try {
    const [areasResult, cargosResult] = await Promise.all([
      executeQuery('SELECT DISTINCT area FROM bronze.pesquisa_satisfacao ORDER BY area;'),
      executeQuery('SELECT DISTINCT cargo FROM bronze.pesquisa_satisfacao ORDER BY cargo;')
    ]);
    res.json({
      areas: areasResult.map(r => r.area),
      cargos: cargosResult.map(r => r.cargo),
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados para filtros.' });
  }
});

// --- Endpoint de Teste ---
app.get('/api/ping', (req, res) => res.status(200).send('pong'));


// --- Inicialização do Servidor ---
// Apenas inicia o servidor se este arquivo não estiver sendo importado por um teste
if (require.main === module) {
  app.listen(port, () => {
    console.log(`API de RH rodando em http://localhost:${port}` );
    console.log('Endpoints disponíveis:');
    console.log('  - GET /api/kpis/enps');
    console.log('  - GET /api/employees/by-area');
    console.log('  - GET /api/filters');
    console.log('  - GET /api/ping');
  });
}

// Exporta o app para ser usado pelos testes
module.exports = app;
