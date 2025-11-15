// __tests__/api.test.js

const request = require('supertest');
const app = require('../server');
// A LINHA QUE FALTAVA: Importamos o Pool para poder usá-lo no mock e no beforeEach
const { Pool } = require('pg');

// Mock do módulo 'pg'
jest.mock('pg', () => {
  const mockQuery = jest.fn();
  const mockPool = {
    query: mockQuery,
    connect: jest.fn().mockResolvedValue({ query: mockQuery, release: jest.fn() }),
  };
  return { Pool: jest.fn(() => mockPool) };
});

describe('GET /api/dashboard-data', () => {
  let mockPool;

  // Agora 'new Pool()' vai funcionar porque o Pool foi importado
  beforeEach(() => {
    mockPool = new Pool();
    mockPool.query.mockClear();
  });

  it('deve retornar os dados processados do dashboard com sucesso', async () => {
    // 1. PREPARAÇÃO: Mock para as 5 consultas do Promise.all
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ area: 'Tecnologia', count: '2' }] }) // 1. Consulta de funcionários
      .mockResolvedValueOnce({ rows: [{ interesse: 8.5 }] })                // 2. Consulta de feedback
      .mockResolvedValueOnce({ rows: [{ promotores: '2', detratores: '1' }] }) // 3. Consulta de eNPS
      .mockResolvedValueOnce({ rows: [{ area: 'Tecnologia' }] })             // 4. Consulta de áreas
      .mockResolvedValueOnce({ rows: [{ cargo: 'Analista' }] });              // 5. Consulta de cargos

    // 2. AÇÃO
    const response = await request(app).get('/api/dashboard-data');

    // 3. VERIFICAÇÃO
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('distribuicaoEnps');
    expect(response.body.distribuicaoEnps.promotores).toBe('2');
  });

  it('deve retornar um erro 500 se a primeira consulta ao banco de dados falhar', async () => {
    // 1. PREPARAÇÃO
    const errorMessage = 'Erro de teste no banco de dados';
    // Como agora usamos Promise.all, o erro em qualquer uma das promises rejeitará o conjunto
    mockPool.query.mockRejectedValueOnce(new Error(errorMessage));

    // 2. AÇÃO
    const response = await request(app).get('/api/dashboard-data');

    // 3. VERIFICAÇÃO
    expect(response.statusCode).toBe(500);
    expect(response.text).toContain('Erro no servidor');
  });
});
