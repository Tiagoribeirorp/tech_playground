# --- Estágio 1: O Ambiente de Build ---
# Usamos uma imagem Node.js completa para ter acesso ao npm
FROM node:18-alpine AS build

# Define o diretório de trabalho para o frontend
WORKDIR /app

# Copia os arquivos de dependência do frontend
# Nota: O caminho é relativo à raiz do projeto
COPY dashboard_pesquisa/frontend/package*.json ./

# Instala as dependências do frontend
RUN npm install

# Copia todo o código-fonte do frontend para o container
COPY dashboard_pesquisa/frontend/ ./

# Executa o comando de build do React
# Isso cria a pasta /app/build com os arquivos otimizados
RUN npm run build

# --- Estágio 2: O Ambiente de Produção (Servidor Web) ---
# Começamos com uma imagem super leve do Nginx
FROM nginx:stable-alpine

# Copia os arquivos estáticos gerados no Estágio 1 (a pasta 'build')
# para a pasta padrão que o Nginx usa para servir conteúdo HTML.
COPY --from=build /app/build /usr/share/nginx/html

# Expõe a porta 80, que é a porta padrão do Nginx
EXPOSE 80

# O comando padrão do Nginx para iniciar o servidor já está embutido na imagem,
# então não precisamos de um CMD.
