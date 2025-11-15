// backend/test-db.js
const { Pool } = require('pg');

console.log("Iniciando teste de conexão com o banco de dados...");

// --- COLOQUE AQUI AS MESMAS CREDENCIAIS DO SEU server.js ---
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'Bioquimica@1',
  port: 5432,
});

// Função assíncrona para realizar o teste
const testConnection = async () => {
  let client;
  try {
    // Tenta pegar um cliente (uma conexão) do pool
    client = await pool.connect();
    console.log("Conexão com o banco de dados PostgreSQL estabelecida com SUCESSO!");

    // Vamos fazer uma consulta simples para ter 100% de certeza
    const res = await client.query('SELECT NOW()'); // Pega a data e hora atual do servidor do banco
    console.log("Consulta de teste bem-sucedida. Hora do banco:", res.rows[0].now);

  } catch (error) {
    // Se qualquer parte do 'try' falhar, o erro será capturado aqui
    console.error("\n--- FALHA NA CONEXÃO ---");
    console.error("Ocorreu um erro ao tentar conectar ou consultar o banco de dados.");
    console.error("Verifique os detalhes abaixo:\n");
    
    // Analisa o erro para dar uma dica mais precisa
    if (error.code === '28P01') {
        console.error("Dica: O erro '28P01' significa 'password authentication failed'. A SENHA provavelmente está incorreta.");
    } else if (error.code === '3D000') {
        console.error(`Dica: O erro '3D000' significa que o banco de dados '${pool.options.database}' não foi encontrado. Verifique o nome do banco.`);
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        console.error(`Dica: O erro '${error.code}' indica que o servidor no host '${pool.options.host}' não foi encontrado ou recusou a conexão. O servidor PostgreSQL está rodando? O host e a porta estão corretos?`);
    } else {
        console.error("Erro detalhado:", error.message);
    }
    console.error("\n------------------------");

  } finally {
    // Garante que a conexão seja liberada de volta para o pool
    if (client) {
      client.release();
      console.log("\nConexão liberada. Teste finalizado.");
    }
    // Fecha o pool para que o script possa terminar
    await pool.end();
  }
};

// Executa a função de teste
testConnection();
