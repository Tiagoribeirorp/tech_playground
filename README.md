# Tech Playground: Dashboard de Pesquisa de Satisfação (Full-Stack & Data Science)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB )
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white )
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white )
![Streamlit](https://img.shields.io/badge/Streamlit-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white )
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white )
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white )
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white )

Este repositório contém um projeto completo que abrange o desenvolvimento de ponta a ponta: desde a criação de um banco de dados e uma API, passando por um dashboard operacional em React, até uma aplicação de análise de dados com Python e Streamlit, tudo orquestrado com Docker.

## 🚀 Visão Geral do Projeto

<img width="1824" height="803" alt="image" src="https://github.com/user-attachments/assets/0689dc94-fbe8-458b-866f-e1072f707953" />

O projeto foi dividido em três grandes fases:

1.  **Desenvolvimento Full-Stack (Tasks 1-4):** Criação de um dashboard operacional em React que consome dados de uma API Node.js conectada a um banco de dados PostgreSQL.
2.  **Testes e DevOps (Tasks 3-4):** Implementação de uma suíte de testes para o backend e frontend, e a "containerização" de toda a aplicação usando Docker e Docker Compose para portabilidade e facilidade de deploy.
3.  **Análise de Dados e Ciência de Dados (Tasks 5-12):** Desenvolvimento de uma aplicação web analítica com Streamlit e Python para explorar os dados, realizar análise de sentimento com modelos de IA e gerar insights profundos.

---

## 🛠️ Estrutura de Pastas

```
tech_playground/ (RAIZ)
├── 📄 backend.Dockerfile
├── 📄 frontend.Dockerfile  
├── 📄 streamlit.Dockerfile
├── 📄 docker-compose.yml
├── 📄 server.js (BACKEND - Express API)
├── 📄 package.json
├── 📄 package-lock.json
├── 📄 jest.config.js
├── 📄 README.md
├── 📄 data.csv
├── 📄 data1.csv
│
├── 📁 backend/ 
├── 📁 frontend/ (APP REACT)
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   │   ├── Filtros.js
│   │   │   ├── FuncionariosPorAreaChart.js
│   │   │   ├── MediaFeedbackChart.js
│   │   │   └── EnpsDistribuicaoChart.js
│   │   └── ...
│   └── package.json
│
├── 📁 data_analysis/ (STREAMLIT APP)
│   ├── app.py
│   └── ...
│
├── 📁 db_init/ (INICIALIZAÇÃO DO BANCO)
│   ├── init.sql
│   └── data1.csv
│
├── 📁 __tests__/ (TESTES)
└── 📁 .git/ (GIT)
```

---

## ⚙️ Como Rodar o Projeto Completo com Docker (Método Recomendado)

Este método inicia toda a aplicação (Backend, Frontend React, Banco de Dados e Streamlit) com poucos comandos.

**Pré-requisitos:**
*   [Docker](https://www.docker.com/products/docker-desktop/ ) instalado e rodando.

**Passos:**

1.  **Abra um terminal** na pasta raiz do projeto (`TECH_PLAYGROUND`).

2.  **Construa e inicie todos os serviços em segundo plano:**
    ```bash
    docker-compose up --build -d
    ```
    *   `--build`: Força a reconstrução das imagens a partir do código mais recente.
    *   `-d`: Roda os containers em modo "detached" (em segundo plano).

3.  **Aguarde ~20 segundos** para que o container do banco de dados (`db`) inicie completamente.

4.  **Popule o banco de dados:** Execute o comando abaixo no seu terminal (use a versão correta para seu sistema operacional) para copiar os dados do arquivo `.csv` para dentro do banco de dados no container.

    *   **Se estiver usando PowerShell (Windows):**
        ```powershell
        $script = "SET datestyle TO 'DMY'; `n\copy bronze.pesquisa_satisfacao FROM '/docker-entrypoint-initdb.d/data1.csv' WITH (FORMAT csv, HEADER true, DELIMITER ';');"
        $script | docker exec -i tech_playground-db-1 psql -U postgres -d postgres
        ```
        *(Nota: Se o comando acima der erro de "container not found", use `docker-compose ps` para ver o nome exato do container do banco e substitua `tech_playground-db-1` pelo nome correto, que pode ser `dashboard_db`)*.

    *   **Se estiver usando Git Bash, Linux ou macOS:**
        ```bash
        docker exec -i tech_playground-db-1 psql -U postgres -d postgres <<EOF
        SET datestyle TO 'DMY';
        \copy bronze.pesquisa_satisfacao FROM '/docker-entrypoint-initdb.d/data1.csv' WITH (FORMAT csv, HEADER true, DELIMITER ';');
        EOF
        ```

5.  **Acesse as aplicações no seu navegador:**
    *   **Dashboard Analítico (Streamlit):** [http://localhost:8501](http://localhost:8501 )
    *   **Dashboard Operacional (React):** [http://localhost:8080](http://localhost:8080 )
        *(Nota: É esperado que este dashboard mostre um erro, pois a API para a qual ele foi construído foi refatorada na Task 9).*
    *   **API Endpoints (Node.js):**
        *   [http://localhost:3001/api/kpis/enps](http://localhost:3001/api/kpis/enps )
        *   [http://localhost:3001/api/employees/by-area](http://localhost:3001/api/employees/by-area )

6.  **Para parar tudo:**
    ```bash
    docker-compose down
    ```

---

## 🧪 Como Rodar os Testes

O projeto possui duas suítes de testes independentes.

### Testes do Backend (Jest)

1.  **Abra um terminal** na pasta raiz (`TECH_PLAYGROUND`).
2.  **Instale as dependências** (só precisa fazer uma vez):
    ```bash
    npm install
    ```
3.  **Execute os testes:**
    ```bash
    npm test
    ```

### Testes do Frontend (React Testing Library)

1.  **Navegue até a pasta do frontend:**
    ```bash
    cd dashboard_pesquisa/frontend
    ```
2.  **Instale as dependências** (só precisa fazer uma vez):
    ```bash
    npm install
    ```
3.  **Execute os testes:**
    ```bash
    npm test
    ```

---

## 📜 Resumo das Tasks Realizadas

*   **Task 1-2 (Setup):** Configuração do banco de dados PostgreSQL e importação dos dados via DBeaver.
*   **Task 3 (Testes):** Criação de suítes de testes robustas para o backend (com Jest e Supertest, mockando o banco de dados) e para o frontend (com React Testing Library, mockando a API e os componentes de gráfico).
*   **Task 4 (Docker):** Criação de `Dockerfile`s otimizados (multi-stage build para o frontend) e um `docker-compose.yml` para orquestrar toda a aplicação, incluindo o banco de dados.
*   **Task 5 (EDA):** Implementação de análise exploratória de dados em um dashboard Streamlit, com estatísticas descritivas e gráficos de distribuição.
*   **Task 6 (Visão Empresa):** Criação de visualizações de alto nível, como o score geral de satisfação e o medidor de eNPS.
*   **Task 7 (Visão Departamentos):** Desenvolvimento de um gráfico de radar comparativo e interativo para analisar a performance de cada departamento contra a média da empresa.
*   **Task 8 (Visão Colaborador):** Criação de um perfil individual que contextualiza as notas de um funcionário em relação ao seu time e à empresa.
*   **Task 9 (API):** Refatoração da API Node.js para seguir melhores práticas, com endpoints específicos, documentados e reutilizáveis.
*   **Task 10 (Análise de Sentimento):** Utilização de um modelo de IA da Hugging Face (`transformers`) para realizar análise de sentimento nos comentários abertos e visualizar os resultados.
*   **Task 11 (Geração de Relatório):** Experimento com a criação de um modo "relatório" no Streamlit para exportação. (deixei de standby)
*   **Task 12 (Exploração Criativa):** Análise de "Favorabilidade" inspirada na documentação da pesquisa, criando um gráfico de barras empilhadas para entender a composição das respostas além das médias.

---


