# data_analysis/app.py --- VERSÃO FINAL E CORRIGIDA
import streamlit as st
import pandas as pd
import psycopg2
import plotly.express as px
import plotly.graph_objects as go
from transformers import pipeline
import time

# --- Configuração da Página ---
st.set_page_config(page_title="Dashboard de Análise", layout="wide")

# --- Funções de Cache ---
@st.cache_resource
def load_sentiment_model():
    """Carrega o modelo de análise de sentimento da Hugging Face."""
    with st.spinner("Carregando modelo de IA..."):
        try:
            return pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")
        except Exception as e:
            st.error(f"Erro ao carregar modelo de IA: {e}")
            return None

@st.cache_resource
def init_connection():
    """Inicializa a conexão com o banco de dados PostgreSQL."""
    try:
        # CORREÇÃO CRÍTICA: Usando as credenciais do docker-compose.yml
        return psycopg2.connect(
            host="dashboard_db", 
            port="5432", 
            database="postgres", 
            user="postgres", # Usuário do docker-compose.yml
            password="Bioquimica@1" # Senha do docker-compose.yml
        )
    except psycopg2.OperationalError as e:
        st.error(f"Erro de conexão: {e}")
        st.info("Dica: Se estiver rodando localmente, o host deve ser 'localhost'. Se estiver no Docker, deve ser 'dashboard_db'.")
        return None

@st.cache_data
def load_data():
    """Carrega os dados da tabela do banco de dados."""
    conn = init_connection()
    if conn is None: return pd.DataFrame()
    try:
        df = pd.read_sql("SELECT * FROM bronze.pesquisa_satisfacao;", conn)
        df['id_anonimo'] = df['email'].str.split('@').str[0]
        return df
    except Exception as e:
        st.error(f"Erro ao carregar dados: {e}")
        return pd.DataFrame()
    finally:
        if conn:
            conn.close()

# --- Funções de Cálculo ---
def calcular_enps(df):
    if df.empty: return 0
    total = len(df)
    promotores = len(df[df['enps'] >= 9])
    detratores = len(df[df['enps'] <= 6])
    return ((promotores / total) * 100) - ((detratores / total) * 100)

def analyze_sentiment(text):
    if not text or not isinstance(text, str): return "Neutro"
    sentiment_analyzer = load_sentiment_model()
    if sentiment_analyzer is None: return "Neutro"
    try:
        result = sentiment_analyzer(text)[0]
        score = int(result['label'].split(' ')[0])
        return "Positivo" if score >= 4 else "Negativo" if score <= 2 else "Neutro"
    except Exception:
        return "Erro na Análise"

# --- Início da Aplicação ---
st.title("Dashboard de Análise de Pesquisa de Satisfação")

df_original = load_data()

if not df_original.empty:
    colunas_feedback = ['interesse_no_cargo', 'contribuicao', 'aprendizado_e_desenvolvimento', 'feedback', 'interacao_com_gestor', 'clareza_sobre_possibilidades_de_carreira', 'expectativa_de_permanencia']
    colunas_todas_numericas = colunas_feedback + ['enps']
    
    # Ordem das abas para manter a coerência
    tab_list = ["Task 12: Favorabilidade", "Task 10: Sentimento", "Task 5: EDA", "Task 6: Empresa", "Task 7: Departamentos", "Task 8: Colaborador"]
    tabs = st.tabs(tab_list)

    # ==============================================================================
    # TAREFA 12: ANÁLISE DE FAVORABILIDADE
    # ==============================================================================
    with tabs[0]:
        st.header("Task 12: Análise de Favorabilidade")
        
        def get_favorability(score):
            if score >= 8: return "Favorável"
            if score == 7: return "Neutro"
            return "Desfavorável"

        df_favorability = df_original[colunas_feedback].copy()
        for col in colunas_feedback:
            df_favorability[col] = df_favorability[col].apply(get_favorability)

        favorability_summary = []
        for col in colunas_feedback:
            counts = df_favorability[col].value_counts(normalize=True) * 100
            favorability_summary.append({
                'Categoria': col.replace('_', ' ').title(),
                'Favorável': counts.get('Favorável', 0),
                'Neutro': counts.get('Neutro', 0),
                'Desfavorável': counts.get('Desfavorável', 0)
            })
        
        df_summary = pd.DataFrame(favorability_summary)

        fig_favorability = go.Figure()
        fig_favorability.add_trace(go.Bar(y=df_summary['Categoria'], x=df_summary['Favorável'], name='Favorável', orientation='h', marker=dict(color='green')))
        fig_favorability.add_trace(go.Bar(y=df_summary['Categoria'], x=df_summary['Neutro'], name='Neutro', orientation='h', marker=dict(color='grey')))
        fig_favorability.add_trace(go.Bar(y=df_summary['Categoria'], x=df_summary['Desfavorável'], name='Desfavorável', orientation='h', marker=dict(color='red')))

        fig_favorability.update_layout(
            barmode='stack',
            title_text='Composição das Respostas: Favorável, Neutro e Desfavorável (%)',
            yaxis_title="Categorias de Feedback",
            xaxis_title="Percentual de Respostas (%)"
        )
        st.plotly_chart(fig_favorability, use_container_width=True)

        with st.expander("📖 O que este gráfico revela?"):
            st.markdown("""
            Inspirado pela documentação da pesquisa, este gráfico vai além das médias para mostrar a **composição** das respostas.
            
            - **Barra Verde (Favorável):** Percentual de funcionários que deram notas altas (8, 9 ou 10). Estes são seus verdadeiros promotores em cada categoria.
            - **Barra Cinza (Neutro):** Percentual de funcionários que deram nota 7. Eles não estão insatisfeitos, mas também não estão engajados.
            - **Barra Vermelha (Desfavorável):** Percentual de funcionários que deram notas de 1 a 6. Estes são os pontos críticos que precisam de atenção.
            
            **Como usar:** Uma categoria pode ter uma média "OK", mas este gráfico pode revelar que ela é composta por muitos funcionários desfavoráveis e poucos favoráveis, com quase nenhum neutro. Isso indica uma **polarização** que a média esconde.
            """)

    # ==============================================================================
    # TAREFA 10: ANÁLISE DE SENTIMENTO
    # ==============================================================================
    with tabs[1]:
        st.header("Task 10: Análise de Sentimento dos Comentários")
        comentarios = df_original['aberta_enps'].dropna().astype(str)
        
        @st.cache_data
        def run_sentiment_analysis(comments_series):
            return comments_series.apply(analyze_sentiment)
        
        sentimentos = run_sentiment_analysis(comentarios)
        
        col1, col2 = st.columns(2)
        with col1:
            st.subheader("Distribuição Geral dos Sentimentos")
            sentiment_counts = sentimentos.value_counts()
            fig_pie = px.pie(values=sentiment_counts.values, names=sentiment_counts.index, title="Proporção de Sentimentos", color=sentiment_counts.index, color_discrete_map={'Positivo':'green', 'Negativo':'red', 'Neutro':'grey'})
            st.plotly_chart(fig_pie, use_container_width=True)
        with col2:
            st.subheader("Exemplos de Comentários")
            df_comentarios = pd.DataFrame({'comentario': comentarios, 'sentimento': sentimentos})
            st.markdown("#### Comentários Positivos")
            st.dataframe(df_comentarios[df_comentarios['sentimento'] == 'Positivo'].head(), height=150)
            st.markdown("#### Comentários Negativos")
            st.dataframe(df_comentarios[df_comentarios['sentimento'] == 'Negativo'].head(), height=150)
        
        with st.expander("📖 O que este gráfico revela?"):
            st.markdown("""
            Esta aba utiliza um modelo de **Inteligência Artificial (IA)** da Hugging Face para "ler" e "interpretar" o sentimento por trás de cada comentário de texto.
            - **Modelo:** `nlptown/bert-base-multilingual-uncased-sentiment`. É um modelo pré-treinado em milhões de textos em várias línguas (incluindo português) para classificar um texto em uma escala de 1 a 5 estrelas.
            - **Insights:** Permite quantificar dados qualitativos. Você pode rapidamente ver se o tom geral dos comentários é positivo ou negativo, e filtrar para ler os comentários mais críticos ou os mais elogiosos, descobrindo o **"porquê"** por trás dos números de satisfação.
            """)

    # ==============================================================================
    # TAREFA 5: EDA
    # ==============================================================================
    with tabs[2]:
        st.header("Task 5: Análise Exploratória de Dados (EDA)")
        st.subheader("5.1 - Estatísticas Descritivas")
        st.dataframe(df_original[colunas_todas_numericas].describe())
        
        with st.expander("📖 O que esta tabela revela?"):
            st.markdown("""
            Esta tabela fornece um resumo estatístico rápido de todas as colunas numéricas da pesquisa.
            - **Count:** Número de respostas válidas.
            - **Mean:** A média de satisfação para cada fator.
            - **Std:** Desvio padrão, que mede a dispersão das respostas (quanto maior, mais as opiniões divergem).
            - **Min/Max:** O menor e o maior valor de resposta.
            - **Percentis:** Mostram a distribuição das respostas (ex: 50% dos funcionários deram nota igual ou menor que o valor do 50% - Mediana).
            """)
        
        st.subheader("5.2 - Distribuição de Funcionários")
        col1, col2 = st.columns(2)
        with col1:
            dist_area = df_original['area'].value_counts().reset_index(name='count')
            fig_area = px.bar(dist_area, x='area', y='count', title="Por Departamento (Área)")
            st.plotly_chart(fig_area, use_container_width=True)
        with col2:
            dist_cargo = df_original['cargo'].value_counts().reset_index(name='count')
            fig_cargo = px.bar(dist_cargo, x='cargo', y='count', title="Por Cargo")
            st.plotly_chart(fig_cargo, use_container_width=True)
        
        with st.expander("📖 O que estes gráficos revelam?"):
            st.markdown("""
            Estes gráficos de barras mostram a distribuição da amostra da pesquisa.
            - **Insights:** Permitem verificar se a amostra é representativa. Se um departamento tem uma contagem muito baixa, a média dele pode ser menos confiável. Se um cargo tem uma contagem muito alta, ele pode estar "puxando" a média geral da empresa.
            """)

    # ==============================================================================
    # TAREFA 6: VISÃO EMPRESA
    # ==============================================================================
    with tabs[3]:
        st.header("Task 6: Visão Geral da Companhia")
        col1_task6, col2_task6 = st.columns(2)
        
        with col1_task6:
            st.subheader("6.1 - Score Geral de Satisfação")
            avg_scores = df_original[colunas_feedback].mean().sort_values(ascending=True)
            fig_avg_scores = px.bar(x=avg_scores.values, y=avg_scores.index, orientation='h', title='Média de Pontuação por Categoria')
            fig_avg_scores.update_layout(xaxis_range=[0, 10])
            st.plotly_chart(fig_avg_scores, use_container_width=True)
        
        with col2_task6:
            st.subheader("6.2 - Employee Net Promoter Score (eNPS)")
            enps_score = calcular_enps(df_original)
            fig_enps = go.Figure(go.Indicator(mode="gauge+number", value=enps_score, title={'text': "Score eNPS da Companhia"}, gauge={'axis': {'range': [-100, 100]}, 'bar': {'color': "royalblue"}}))
            st.plotly_chart(fig_enps, use_container_width=True)
            st.metric("Score eNPS Final", f"{enps_score:.1f}")
        
        with st.expander("📖 O que estes gráficos revelam?"):
            st.markdown("""
            - **Score Geral de Satisfação:** Mostra a média de satisfação para cada fator. É um termômetro rápido para identificar os pontos fortes (barras mais longas) e fracos (barras mais curtas) da empresa como um todo.
            - **eNPS:** Mede a lealdade e a probabilidade de um funcionário recomendar a empresa. É um indicador-chave de saúde cultural. Valores acima de 50 são considerados excelentes.
            """)

    # ==============================================================================
    # TAREFA 7: VISÃO DEPARTAMENTOS
    # ==============================================================================
    with tabs[4]:
        st.header("Task 7: Visão Departamentos")
        lista_areas = sorted(df_original['area'].unique())
        area_selecionada = st.selectbox('Selecione um departamento para análise detalhada:', options=lista_areas, key="selectbox_task7")
        
        df_area_unica = df_original[df_original['area'] == area_selecionada]
        media_area = df_area_unica[colunas_feedback].mean()
        media_empresa = df_original[colunas_feedback].mean()
        
        fig_radar = go.Figure()
        fig_radar.add_trace(go.Scatterpolar(r=media_empresa.values, theta=media_empresa.index, fill='toself', name='Média Empresa', line=dict(color='lightgrey')))
        fig_radar.add_trace(go.Scatterpolar(r=media_area.values, theta=media_area.index, fill='toself', name=f'Média {area_selecionada}', line=dict(color='royalblue')))
        
        fig_radar.update_layout(polar=dict(radialaxis=dict(visible=True, range=[0, 10])), title=f"Comparativo: {area_selecionada} vs. Média da Empresa")
        st.plotly_chart(fig_radar, use_container_width=True)
        
        with st.expander("📖 O que este gráfico revela?"):
            st.markdown("""
            O gráfico de radar compara o desempenho de um departamento específico com a média geral da empresa.
            - **Insights:** Permite identificar onde o departamento está acima ou abaixo da média. Por exemplo, se a linha azul (departamento) está muito mais próxima do centro em 'interacao_com_gestor' do que a linha cinza (empresa), isso sinaliza um problema de gestão específico daquela área.
            """)

    # ==============================================================================
    # TAREFA 8: VISÃO COLABORADOR (COM CORREÇÃO DE INFORMAÇÕES)
    # ==============================================================================
    with tabs[5]:
        st.header("Task 8: Visão Colaborador")
        lista_funcionarios = sorted(df_original['id_anonimo'].unique())
        funcionario_selecionado_id = st.selectbox('Selecione um Colaborador (ID Anônimo):', options=lista_funcionarios, key="selectbox_task8")
        
        df_funcionario = df_original[df_original['id_anonimo'] == funcionario_selecionado_id].iloc[0]
        area_funcionario = df_funcionario['area']
        
        # CORREÇÃO: EXIBIÇÃO DAS INFORMAÇÕES DO COLABORADOR
        st.subheader(f"Perfil de {df_funcionario['nome']}")
        col1, col2, col3 = st.columns(3)
        col1.metric("ID Anônimo", df_funcionario['id_anonimo'])
        col2.metric("Cargo", df_funcionario['cargo'])
        col3.metric("Departamento", df_funcionario['area'])
        st.divider()
        
        df_area = df_original[df_original['area'] == area_funcionario]
        media_funcionario = df_funcionario[colunas_feedback]
        media_area = df_area[colunas_feedback].mean()
        media_empresa = df_original[colunas_feedback].mean()
        
        fig_radar_individual = go.Figure()
        fig_radar_individual.add_trace(go.Scatterpolar(r=media_empresa.values, theta=media_empresa.index, fill='toself', name='Média Empresa', line=dict(color='lightgrey')))
        fig_radar_individual.add_trace(go.Scatterpolar(r=media_area.values, theta=media_area.index, fill='toself', name=f'Média Depto.', line=dict(color='rgba(173, 216, 230, 0.5)')))
        fig_radar_individual.add_trace(go.Scatterpolar(r=media_funcionario.values, theta=media_funcionario.index, fill='toself', name=f'Notas Individuais', line=dict(color='royalblue')))
        
        fig_radar_individual.update_layout(polar=dict(radialaxis=dict(visible=True, range=[0, 10])), title=f"Feedback de {funcionario_selecionado_id} vs. Médias")
        st.plotly_chart(fig_radar_individual, use_container_width=True)
        
        with st.expander("📖 O que este gráfico revela?"):
            st.markdown("""
            Esta é a visão mais granular, comparando a percepção de **um único colaborador** com as médias do seu departamento e da empresa.
            - **Insights:** Permite identificar se a insatisfação é um problema individual (a linha azul está muito abaixo das médias) ou se é um problema sistêmico do departamento (a linha azul acompanha a linha do departamento, que está baixa).
            """)

else:
    st.warning("Não foi possível carregar os dados. Verifique a conexão com o banco de dados.")