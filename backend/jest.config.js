// backend/jest.config.js
module.exports = {
  // Limpa os mocks (simulações) entre cada teste para evitar que um teste interfira no outro
  clearMocks: true,

  // O diretório onde os relatórios de cobertura de teste serão gerados
  coverageDirectory: "coverage",

  // O ambiente de teste que será usado. 'node' é o padrão para projetos de backend.
  testEnvironment: "node",
};
