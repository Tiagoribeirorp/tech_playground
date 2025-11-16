# Tech Playground: Dashboard Full-Stack de Análise de RH

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB )
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white )
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white )
![Streamlit](https://img.shields.io/badge/Streamlit-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white )
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white )
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white )
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white )

Este repositório documenta a jornada de construção de uma solução completa de análise de dados, desde a criação de um banco de dados e uma API até o desenvolvimento de dois dashboards interativos (um operacional e um analítico), com testes automatizados e orquestração via Docker.

---

## 🌟 Visão Geral do Projeto

O projeto foi dividido em três grandes fases, cobrindo um ciclo de desenvolvimento completo:

1.  **Desenvolvimento Full-Stack:** Criação de um dashboard operacional em **React** que consome dados de uma API **Node.js** (Express) conectada a um banco de dados **PostgreSQL**.
2.  **Testes e DevOps:** Implementação de uma suíte de testes unitários e de integração para o backend (**Jest** e Supertest) e frontend (**React Testing Library**). Toda a aplicação foi "containerizada" com **Docker** e orquestrada com **Docker Compose** para garantir portabilidade e facilidade de deploy.
3.  **Análise e Ciência de Dados:** Desenvolvimento de uma aplicação web analítica com **Streamlit** e **Python** (Pandas, Plotly) para explorar os dados, realizar **análise de sentimento** com um modelo de IA da Hugging Face e gerar insights profundos sobre a pesquisa de satisfação.

---

## 🖼️ Screenshots

<img width="1824" height="803" alt="image" src="https://github.com/user-attachments/assets/0689dc94-fbe8-458b-866f-e1072f707953" />
`

---

## 🛠️ Estrutura de Pastas

```
TECH_PLAYGROUND/
├── __tests__/                  # Testes do Backend (Jest)
├── data_analysis/              # Aplicação de Análise de Dados (Python/Streamlit)
├── dashboard_pesquisa/         # Aplicação Frontend (React)
├── data/                       # Dados brutos e scripts SQL
├── backend.Dockerfile          # Instruções para construir a imagem Docker do Backend
├── frontend.Dockerfile         # Instruções para construir a imagem Docker do Frontend
├── docker-compose.yml          # Orquestrador de todos os serviços Docker
├── jest.config.js              # Configuração do Jest para o Backend
├── package.json                # Dependências e scripts do Backend
└── server.js                   # API do Backend (Node.js/Express)
```

---

## 🚀 Como Rodar o Projeto Completo com Docker

Este método inicia toda a aplicação (Backend, Frontend React, Banco de Dados e Streamlit) com poucos comandos.

**Pré-requisitos:**
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/ ) instalado e rodando.

**Passos:**

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/seu-repositorio.git
    cd seu-repositorio
    ```

2.  **Construa e inicie todos os serviços em segundo plano:**
    ```bash
    docker-compose up --build -d
    ```
    Aguarde cerca de 20 segundos para que o banco de dados inicie completamente.

3.  **Popule o banco de dados:** Execute o comando abaixo no seu terminal (use a versão correta para seu sistema operacional ) para copiar os dados para dentro do banco de dados no container.

    *   **Se estiver usando PowerShell (Windows):**
        ```powershell
        $script = "SET datestyle TO 'DMY'; `n\copy bronze.pesquisa_satisfacao FROM '/docker-entrypoint-initdb.d/data1.csv' WITH (FORMAT csv, HEADER true, DELIMITER ';');"
        $script | docker exec -i tech_playground-db-1 psql -U postgres -d postgres
        ```
        *(Nota: Use `docker-compose ps` para ver o nome exato do container do banco e substitua `tech_playground-db-1` se necessário)*.

    *   **Se estiver usando Git Bash, Linux ou macOS:**
        ```bash
        docker exec -i tech_playground-db-1 psql -U postgres -d postgres <<EOF
        SET datestyle TO 'DMY';
        \copy bronze.pesquisa_satisfacao FROM '/docker-entrypoint-initdb.d/data1.csv' WITH (FORMAT csv, HEADER true, DELIMITER ';');
        EOF
        ```

4.  **Acesse as aplicações no seu navegador:**
    *   **Dashboard Analítico (Streamlit):** [http://localhost:8501](http://localhost:8501 )
    *   **Dashboard Operacional (React):** [http://localhost:8080](http://localhost:8080 )
    *   **API Endpoints (Node.js):** [http://localhost:3001/api/kpis/enps](http://localhost:3001/api/kpis/enps )

5.  **Para parar tudo:**
    ```bash
    docker-compose down
    ```

---

## 🧪 Como Rodar os Testes

O projeto possui duas suítes de testes independentes.

### Testes do Backend (Jest)
1.  Na pasta raiz (`TECH_PLAYGROUND`), rode `npm install` e depois `npm test`.

### Testes do Frontend (React Testing Library)
1.  Navegue até `dashboard_pesquisa/frontend`.
2.  Rode `npm install` e depois `npm test`.

---

## 🤝 Como Contribuir

Este é um projeto de portfólio pessoal, mas sugestões e melhorias são sempre bem-vindas! Sinta-se à vontade para abrir uma *Issue* para discutir uma mudança ou um *Pull Request* com uma implementação.

1.  Faça um *Fork* do projeto.
2.  Crie uma nova *Branch* (`git checkout -b feature/minha-feature`).
3.  Faça o *Commit* das suas mudanças (`git commit -m 'Adiciona minha-feature'`).
4.  Faça o *Push* para a *Branch* (`git push origin feature/minha-feature`).
5.  Abra um *Pull Request*.

---

Foi uma jornada incrível construir este projeto. Obrigado por visitar!
