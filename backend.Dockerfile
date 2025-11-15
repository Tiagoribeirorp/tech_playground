# Estágio 1: Define a base da nossa imagem
# Usaremos uma imagem oficial do Node.js na versão 18
FROM node:18-alpine

# Define o diretório de trabalho dentro do container
# Todos os comandos a seguir serão executados a partir daqui
WORKDIR /app

# Copia o package.json e o package-lock.json para o container
# Fazemos isso separadamente para aproveitar o cache do Docker.
# Se esses arquivos não mudarem, o Docker não reinstalará as dependências.
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o resto dos arquivos do nosso backend (server.js, etc.) para o container
COPY . .

# Expõe a porta 3001, que é a porta que nosso servidor usa
EXPOSE 3001

# O comando final para iniciar o servidor quando o container for executado
CMD [ "node", "server.js" ]
