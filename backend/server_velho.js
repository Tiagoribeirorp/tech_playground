// server.js --- VERSÃO FINAL E OFICIAL, PRONTA PARA TESTES
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3001;

// Configuração explícita do CORS para aceitar requisições do frontend
app.use(cors({
  origin: 'http://localhost:3000'
} ));
app.use(express.json());

// --- SUAS CREDENCIAIS CORRETAS ---
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'Bioquimica@1',
  port: 5432,
});

app.get('/api/dashboard-data', async (req, res) => {
  console.log(`\n[${new Date().toLocaleTimeString()}] Recebida requisição para /api/dashboard-data`);
  
  const { area, cargo } = req.query;
  let whereClause = 'WHERE 1=1';
  const queryParams = [];

  if (area) {
    queryParams.push(area);
    whereClause += ` AND area = $${queryParams.length}`;
  }
  if (cargo) {
    queryParams.push(cargo);
    whereClause += ` AND cargo = $${queryParams.length}`;
  }
  console.log(`Cláusula WHERE construída: ${whereClause}`);

  try {
    let funcionariosResult, feedbackResult, enpsResult, areasUnicasResult, cargosUnicosResult;

    const schemaTable = 'bronze.pesquisa_satisfacao';

    try {
      const funcionariosQuery = `SELECT area, COUNT(*) as count FROM ${schemaTable} ${whereClause} GROUP BY area ORDER BY area;`;
      console.log("Executando consulta de funcionários...");
      funcionariosResult = await pool.query(funcionariosQuery, queryParams);
      console.log("Consulta de funcionários OK.");
    } catch (e) {
      console.error("ERRO NA CONSULTA DE FUNCIONÁRIOS:", e.message);
      throw e;
    }

    try {
      const feedbackQuery = `
        SELECT 
          AVG(interesse_no_cargo) as interesse, AVG(contribuicao) as contribuicao,
          AVG(aprendizado_e_desenvolvimento) as aprendizado, AVG(feedback) as feedback,
          AVG(interacao_com_gestor) as interacao_gestor,
          AVG(clareza_sobre_possibilidades_de_carreira) as clareza_carreira,
          AVG(expectativa_de_permanencia) as expectativa_permanencia
        FROM ${schemaTable} ${whereClause};
      `;
      console.log("Executando consulta de feedback...");
      feedbackResult = await pool.query(feedbackQuery, queryParams);
      console.log("Consulta de feedback OK.");
    } catch (e) {
      console.error("ERRO NA CONSULTA DE FEEDBACK:", e.message);
      throw e;
    }

    try {
      const enpsQuery = `
        SELECT 
          COUNT(CASE WHEN enps >= 9 THEN 1 END) as promotores,
          COUNT(CASE WHEN enps >= 7 AND enps <= 8 THEN 1 END) as neutros,
          COUNT(CASE WHEN enps <= 6 THEN 1 END) as detratores
        FROM ${schemaTable} ${whereClause};
      `;
      console.log("Executando consulta de eNPS...");
      enpsResult = await pool.query(enpsQuery, queryParams);
      console.log("Consulta de eNPS OK.");
    } catch (e) {
      console.error("ERRO NA CONSULTA DE ENPS:", e.message);
      throw e;
    }

    try {
      console.log("Executando consulta de filtros...");
      [areasUnicasResult, cargosUnicosResult] = await Promise.all([
        pool.query(`SELECT DISTINCT area FROM ${schemaTable} ORDER BY area;`),
        pool.query(`SELECT DISTINCT cargo FROM ${schemaTable} ORDER BY cargo;`)
      ]);
      console.log("Consulta de filtros OK.");
    } catch (e) {
      console.error("ERRO NA CONSULTA DE FILTROS:", e.message);
      throw e;
    }

    console.log("Todas as consultas foram bem-sucedidas. Enviando resposta JSON.");
    res.json({
      funcionariosPorArea: funcionariosResult.rows,
      mediaFeedback: feedbackResult.rows[0],
      distribuicaoEnps: enpsResult.rows[0],
      filtros: {
        areas: areasUnicasResult.rows.map(r => r.area),
        cargos: cargosUnicosResult.rows.map(r => r.cargo),
      }
    });

  } catch (err) {
    console.error('Um erro de SQL ocorreu. A requisição foi interrompida.');
    res.status(500).send('Erro no servidor ao processar dados do banco.');
  }
});

// --- MUDANÇA PARA OS TESTES COMEÇA AQUI ---

// A linha original era: app.listen(port, () => { ... });
// Envolvemos o app.listen() em uma condição para que o servidor não inicie durante os testes.
// O Jest define a variável 'process.env.NODE_ENV' como 'test' automaticamente.
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Servidor backend FINAL rodando em http://localhost:${port}` );
  });
}

// Adicionamos esta linha no final para exportar a instância do app Express.
// Isso permite que o Supertest (nossa ferramenta de teste) importe e use o app.
module.exports = app;
