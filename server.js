// server.js --- VERSÃO FINAL (Compatível com Docker e Local)
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3001;

// Configuração do CORS
app.use(cors()); // Deixando aberto para simplificar no ambiente Docker
app.use(express.json());

// --- Configuração do Banco de Dados via Variáveis de Ambiente ---
// Ele tenta usar as variáveis de ambiente passadas pelo Docker Compose.
// Se não as encontrar, usa os valores padrão para rodar localmente.
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'Bioquimica@1',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Rota principal da API
app.get('/api/dashboard-data', async (req, res) => {
  console.log(`[${new Date().toLocaleTimeString()}] Recebida requisição para /api/dashboard-data`);
  
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
    const schemaTable = 'bronze.pesquisa_satisfacao';

    // Usamos Promise.all para rodar as consultas em paralelo para mais eficiência
    const [
      funcionariosResult,
      feedbackResult,
      enpsResult,
      areasUnicasResult,
      cargosUnicosResult
    ] = await Promise.all([
      pool.query(`SELECT area, COUNT(*) as count FROM ${schemaTable} ${whereClause} GROUP BY area ORDER BY area;`, queryParams),
      pool.query(`
        SELECT 
          AVG(interesse_no_cargo) as interesse, AVG(contribuicao) as contribuicao,
          AVG(aprendizado_e_desenvolvimento) as aprendizado, AVG(feedback) as feedback,
          AVG(interacao_com_gestor) as interacao_gestor,
          AVG(clareza_sobre_possibilidades_de_carreira) as clareza_carreira,
          AVG(expectativa_de_permanencia) as expectativa_permanencia
        FROM ${schemaTable} ${whereClause};
      `, queryParams),
      pool.query(`
        SELECT 
          COUNT(CASE WHEN enps >= 9 THEN 1 END) as promotores,
          COUNT(CASE WHEN enps >= 7 AND enps <= 8 THEN 1 END) as neutros,
          COUNT(CASE WHEN enps <= 6 THEN 1 END) as detratores
        FROM ${schemaTable} ${whereClause};
      `, queryParams),
      pool.query(`SELECT DISTINCT area FROM ${schemaTable} ORDER BY area;`),
      pool.query(`SELECT DISTINCT cargo FROM ${schemaTable} ORDER BY cargo;`)
    ]);

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
    console.error('ERRO NA CONSULTA SQL:', err.message);
    res.status(500).send('Erro no servidor ao processar dados do banco.');
  }
});

// Verifica se o script está sendo executado em um ambiente de teste
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Servidor backend FINAL rodando em http://localhost:${port}` );
  });
}

// Exporta o app para que os testes possam usá-lo
module.exports = app;
