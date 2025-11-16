# data_analysis/app.py --- VERSÃO FINAL COM EXPLICAÇÕES
import streamlit as st
import pandas as pd
import psycopg2
import plotly.express as px
import plotly.graph_objects as go

# --- Configuração da Página ---
st.set_page_config(page_title="Dashboard de Análise", layout="wide")

# --- Funções de Conexão e Carregamento de Dados ---
@st.cache_resource
def init_connection():
    try:
        return psycopg2.connect(
            host="localhost", port="5432", database="postgres",
            user="postgres", password="Bioquimica@1"
        )
    except psycopg2.OperationalError as e:
        st.error(f"Erro de conexão com o PostgreSQL: {e}")
        st.info("Verifique se os containers do Docker estão rodando (docker-compose up -d) e se as credenciais estão corretas.")
        return None

conn = init_connection()

@st.cache_data
def load_data():
    if conn is None: return pd.DataFrame()
    query = "SELECT * FROM bronze.pesquisa_satisfacao;"
    df = pd.read_sql(query, conn)
    df['id_anonimo'] = df['email'].str.split('@').str[0]
    return df

# --- Funções de Cálculo ---
def calcular_enps(df):
    if df.empty or len(df) == 0: return 0
    total_respostas = len(df)
    promotores = len(df[df['enps'] >= 9])
    detratores = len(df[df['enps'] <= 6])
    percent_promotores = (promotores / total_respostas) * 100
    percent_detratores = (detratores / total_respostas) * 100
    return percent_promotores - percent_detratores

# --- Início da Aplicação ---
st.title("Dashboard de Análise de Pesquisa de Satisfação")

if conn and not load_data().empty:
    df_original = load_data()
    colunas_numericas_feedback = [
        'interesse_no_cargo', 'contribuicao', 'aprendizado_e_desenvolvimento', 
        'feedback', 'interacao_com_gestor', 'clareza_sobre_possibilidades_de_carreira', 
        'expectativa_de_permanencia'
    ]
    colunas_numericas_todas = colunas_numericas_feedback + ['enps']

    tab5, tab6, tab7, tab8 = st.tabs([
        "Task 5: EDA", "Task 6: Visão Empresa", 
        "Task 7: Visão Departamentos", "Task 8: Visão Colaborador"
    ])

    with tab5:
        st.header("Task 5: Análise Exploratória de Dados (EDA)")
        st.subheader("5.1 - Estatísticas Descritivas")
        st.dataframe(df_original[colunas_numericas_todas].describe())
        with st.expander("📖 O que estamos vendo aqui?"):
            st.markdown("""
            *   **count:** O número de respostas para cada pergunta.
            *   **mean (média):** A pontuação média para cada categoria. Um bom indicador geral de sentimento.
            *   **std (desvio padrão):** Mostra o quão dispersas estão as respostas. Um valor alto significa que há muita variação nas opiniões.
            *   **min, 25%, 50% (mediana), 75%, max:** Mostram a distribuição das notas. A mediana (50%) é útil por não ser afetada por valores extremos.
            """)
        
        st.subheader("5.2 - Distribuição de Funcionários")
        col1, col2 = st.columns(2)
        with col1:
            st.markdown("#### Por Departamento (Área)")
            dist_area = df_original['area'].value_counts().reset_index()
            fig_area = px.bar(dist_area, x='area', y='count', title="Distribuição por Área")
            st.plotly_chart(fig_area, use_container_width=True)
        with col2:
            st.markdown("#### Por Cargo")
            dist_cargo = df_original['cargo'].value_counts().reset_index()
            fig_cargo = px.bar(dist_cargo, x='cargo', y='count', title="Distribuição por Cargo")
            st.plotly_chart(fig_cargo, use_container_width=True)

    with tab6:
        st.header("Task 6: Visão Geral da Companhia")
        col1_task6, col2_task6 = st.columns(2)
        with col1_task6:
            st.subheader("6.1 - Score Geral de Satisfação")
            avg_scores = df_original[colunas_numericas_feedback].mean().sort_values(ascending=True)
            fig_avg_scores = px.bar(x=avg_scores.values, y=avg_scores.index, orientation='h', title='Média de Pontuação por Categoria')
            fig_avg_scores.update_layout(xaxis_range=[0, 10])
            st.plotly_chart(fig_avg_scores, use_container_width=True)
            with st.expander("📖 O que este gráfico revela?"):
                st.markdown("""
                Este gráfico mostra os **pontos fortes e fracos** da empresa na perspectiva dos funcionários.
                *   **Barras mais longas** indicam áreas onde a satisfação é alta.
                *   **Barras mais curtas** apontam para áreas que precisam de atenção e possíveis melhorias.
                """)
        with col2_task6:
            st.subheader("6.2 - Employee Net Promoter Score (eNPS)")
            enps_score = calcular_enps(df_original)
            fig_enps = go.Figure(go.Indicator(
                mode="gauge+number", value=enps_score, title={'text': "Score eNPS da Companhia"},
                gauge={'axis': {'range': [-100, 100]}, 'bar': {'color': "royalblue"}}
            ))
            st.plotly_chart(fig_enps, use_container_width=True)
            st.metric("Score eNPS Final", f"{enps_score:.1f}")
            with st.expander("📖 O que é eNPS?"):
                st.markdown("""
                O eNPS mede a lealdade dos funcionários. É calculado por **(% de Promotores) - (% de Detratores)**.
                *   **Promotores (Nota 9-10):** Funcionários leais e entusiasmados.
                *   **Neutros (Nota 7-8):** Satisfeitos, mas não engajados.
                *   **Detratores (Nota 0-6):** Funcionários insatisfeitos.
                Scores acima de 0 são aceitáveis, e acima de 50 são excelentes.
                """)

    with tab7:
        st.header("Task 7: Análise por Departamento (Área)")
        lista_areas = ['Todos'] + sorted(df_original['area'].unique())
        areas_selecionadas = st.multiselect('Selecione Departamentos para comparar:', options=lista_areas, default=['Todos'])
        
        df_filtrado = df_original[df_original['area'].isin(areas_selecionadas)] if 'Todos' not in areas_selecionadas and areas_selecionadas else df_original.copy()

        col1_task7, col2_task7 = st.columns(2)
        with col1_task7:
            st.subheader("7.1 - Comparativo de eNPS")
            enps_por_area = df_filtrado.groupby('area').apply(calcular_enps).reset_index(name='eNPS Score').sort_values(by='eNPS Score', ascending=False)
            fig_enps_area = px.bar(enps_por_area, x='area', y='eNPS Score', title='eNPS Score por Departamento', color='eNPS Score', color_continuous_scale=px.colors.sequential.RdBu_r)
            st.plotly_chart(fig_enps_area, use_container_width=True)
            with st.expander("📖 O que este gráfico revela?"):
                st.markdown("Permite uma comparação direta da satisfação entre departamentos, destacando áreas de alta performance (azul) e pontos críticos (vermelho).")
        with col2_task7:
            st.subheader("7.2 - Análise de Feedback Detalhada")
            area_unica_selecionada = st.selectbox('Selecione um departamento para análise detalhada:', options=sorted(df_original['area'].unique()))
            df_area_unica = df_original[df_original['area'] == area_unica_selecionada]
            media_area = df_area_unica[colunas_numericas_feedback].mean()
            media_empresa = df_original[colunas_numericas_feedback].mean()
            fig_radar = go.Figure()
            fig_radar.add_trace(go.Scatterpolar(r=media_empresa.values, theta=media_empresa.index, fill='toself', name='Média Empresa', line=dict(color='lightgrey')))
            fig_radar.add_trace(go.Scatterpolar(r=media_area.values, theta=media_area.index, fill='toself', name=f'Média {area_unica_selecionada}', line=dict(color='royalblue')))
            fig_radar.update_layout(polar=dict(radialaxis=dict(visible=True, range=[0, 10])), title=f"Comparativo: {area_unica_selecionada} vs. Média da Empresa")
            st.plotly_chart(fig_radar, use_container_width=True)
            with st.expander("📖 Como interpretar este gráfico?"):
                st.markdown("Onde a área azul (departamento) ultrapassa a cinza (empresa), há um ponto forte. Onde ela fica para trás, há um ponto de atenção específico para aquela equipe.")

    with tab8:
        st.header("Task 8: Perfil Individual do Colaborador")
        lista_funcionarios = sorted(df_original['id_anonimo'].unique())
        funcionario_selecionado_id = st.selectbox('Selecione um Colaborador (ID Anônimo):', options=lista_funcionarios)
        df_funcionario = df_original[df_original['id_anonimo'] == funcionario_selecionado_id].iloc[0]
        
        col1_task8, col2_task8, col3_task8 = st.columns(3)
        with col1_task8: st.metric("Departamento", df_funcionario['area'])
        with col2_task8: st.metric("Cargo", df_funcionario['cargo'])
        with col3_task8: st.metric("Tempo de Empresa", df_funcionario['tempo_de_empresa'])
        
        st.subheader("Comparativo de Feedback Individual")
        area_funcionario = df_funcionario['area']
        df_area = df_original[df_original['area'] == area_funcionario]
        media_funcionario = df_funcionario[colunas_numericas_feedback]
        media_area = df_area[colunas_numericas_feedback].mean()
        media_empresa = df_original[colunas_numericas_feedback].mean()
        fig_radar_individual = go.Figure()
        fig_radar_individual.add_trace(go.Scatterpolar(r=media_empresa.values, theta=media_empresa.index, fill='toself', name='Média Empresa', line=dict(color='lightgrey')))
        fig_radar_individual.add_trace(go.Scatterpolar(r=media_area.values, theta=media_area.index, fill='toself', name=f'Média Depto.', line=dict(color='rgba(173, 216, 230, 0.5)')))
        fig_radar_individual.add_trace(go.Scatterpolar(r=media_funcionario.values, theta=media_funcionario.index, fill='toself', name=f'Notas Individuais', line=dict(color='royalblue')))
        fig_radar_individual.update_layout(polar=dict(radialaxis=dict(visible=True, range=[0, 10])), title=f"Feedback de {funcionario_selecionado_id} vs. Médias")
        st.plotly_chart(fig_radar_individual, use_container_width=True)
        with st.expander("📖 Como usar esta visualização?"):
            st.markdown("""
            Este gráfico é a principal ferramenta para uma conversa de desenvolvimento. Ele contextualiza as respostas do indivíduo (azul escuro) com a média de sua equipe (azul claro) e da empresa (cinza).
            *   **Pontos Fortes:** Onde a linha individual ultrapassa as outras.
            *   **Pontos de Atenção:** Onde a linha individual está abaixo das outras, especialmente da média de sua própria equipe.
            """)

else:
    st.warning("A análise de dados não pode ser exibida. Verifique a conexão com o banco de dados.")

