-- db_init/init.sql

-- Cria o schema para organizar a tabela
CREATE SCHEMA IF NOT EXISTS bronze;

-- Cria a tabela com os nomes de coluna corretos
CREATE TABLE IF NOT EXISTS bronze.pesquisa_satisfacao (
    nome VARCHAR(255),
    email VARCHAR(255),
    email_corporativo VARCHAR(255),
    area VARCHAR(255),
    cargo VARCHAR(255),
    funcao VARCHAR(255),
    localidade VARCHAR(255),
    tempo_de_empresa VARCHAR(50),
    genero VARCHAR(50),
    geracao VARCHAR(50),
    n0_empresa VARCHAR(255),
    n1_diretoria VARCHAR(255),
    n2_gerencia VARCHAR(255),
    n3_coordenacao VARCHAR(255),
    n4_area VARCHAR(255),
    data_da_resposta VARCHAR(50),
    interesse_no_cargo INTEGER,
    comentarios_interesse_cargo TEXT,
    contribuicao INTEGER,
    comentarios_contribuicao TEXT,
    aprendizado_e_desenvolvimento INTEGER,
    comentarios_aprendizado_desenvolvimento TEXT,
    feedback INTEGER,
    comentarios_feedback TEXT,
    interacao_com_gestor INTEGER,
    comentarios_interacao_com_gestor TEXT,
    clareza_sobre_possibilidades_de_carreira INTEGER,
    comentarios_clareza_carreira TEXT,
    expectativa_de_permanencia INTEGER,
    comentarios_expectativa_permanencia TEXT,
    enps INTEGER,
    aberta_enps TEXT
);
-- ⭐⭐ ADICIONE ESTA LINHA ⭐⭐
-- Insere os dados do CSV (APENAS UMA VEZ)
-- ⭐⭐ Tente com \copy (funciona melhor no Docker) ⭐⭐
\copy bronze.pesquisa_satisfacao FROM '/docker-entrypoint-initdb.d/data1.csv' DELIMITER ';' CSV HEADER;