# streamlit.Dockerfile
# Imagem base com Python
FROM python:3.11-slim

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia o arquivo de dependências e instala
COPY data_analysis/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código da aplicação Streamlit
COPY data_analysis/app.py .

# Expõe a porta padrão do Streamlit
EXPOSE 8501

# Comando para rodar o Streamlit
CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
