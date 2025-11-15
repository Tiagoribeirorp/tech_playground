// TECH_PLAYGROUND/jest.config.js

module.exports = {
  // O ambiente de teste para o backend é 'node'
  testEnvironment: "node",

  // Limpa mocks entre os testes
  clearMocks: true,

  // IGNORA A PASTA DO FRONTEND DURANTE OS TESTES DO BACKEND
  // O caminho agora aponta para a subpasta correta.
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/dashboard_pesquisa/frontend/"
  ],
};
