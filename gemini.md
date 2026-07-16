# **Memória do Projeto: Plano de Estudos Petrobras**

Este documento serve como um resumo técnico e funcional do projeto, detalhando sua arquitetura, funcionalidades e estrutura de dados. É de leitura obrigatória a cada nova interação para garantir o contexto.

## 1. Visão Geral e Arquitetura

O projeto é uma **SPA (Single Page Application)** para gerenciamento de um plano de estudos, construída com uma arquitetura moderna baseada em Vue.js e Vite.

-   **Frontend:** **Vue.js 3** com **Vite** como ferramenta de build e servidor de desenvolvimento.
-   **Estrutura:** **Componentes de Arquivo Único (.vue)**. O `App.vue` serve como layout principal e "roteador" de views, enquanto cada funcionalidade reside em seu próprio componente na pasta `/views`.
-   **Modularidade:** A lógica de negócio está completamente isolada em **Composables** (padrão `useFeature`). Cada componente de *view* (`/views/*.vue`) importa os *composables* de que precisa, tornando-os autossuficientes e eliminando "prop drilling".
-   **Persistência de Dados:** O estado é salvo no **`localStorage`** através de um módulo `armazenamento.js` reativo, que utiliza *debouncing* para otimizar escritas e exporta um `saveStatus` reativo.
-   **Estilo:** CSS puro com o uso de Variáveis CSS (`var(--cor)`) para permitir a troca de temas (claro/escuro).
-   **Backend (Simples):** Um servidor **Express.js** (`server.js`) é usado para servir os arquivos estáticos (`site/`) e uma pequena API (`/api/...`) para buscar os planos de estudo em formato Markdown.

## 2. Detalhamento das Funcionalidades (por Módulo/View)

Cada funcionalidade principal é encapsulada em seu próprio Composable (`/composables/*.js`) e componente de View (`/views/*.vue`).

---

### 🔹 **Dashboard (`Dashboard.vue`)**

-   **Propósito:** Ponto de entrada da aplicação, oferecendo uma visão geral e consolidada do progresso.
-   **Métricas Exibidas:**
    -   `progressoGeral`: Percentual total de conteúdos estudados.
    -   `horasSemanaAtual`: Horas de estudo registradas na semana corrente.
    -   `metaSemanaCss`: Comparativo visual (cor) das horas atuais com a meta semanal.
    -   `simuladoStatus`: Nota do último simulado registrado.
    -   `totalErros`: Quantidade de itens no Caderno de Erros.
    -   `cicloCompleto`: Percentual de conclusão do ciclo de estudos atual.
    -   `revisoesHoje`: Número de revisões espaçadas agendadas para o dia.
-   **Visualização:** Apresenta o progresso por matéria através de barras de progresso.

---

### ✅ **Checklist de Conteúdos (`Checklist.vue` + `useChecklist.js`)**

-   **Propósito:** Permitir que o usuário marque os tópicos do edital que já foram estudados.
-   **Funcionalidades:**
    -   Lista todos os conteúdos, agrupados por matéria e subgrupo (ex: Química -> Química Orgânica).
    -   Permite marcar/desmarcar cada tópico individualmente.
    -   Calcula e exibe o progresso por matéria e o progresso geral.
    -   **Interatividade:** Botões para expandir/recolher todos os grupos e um campo de busca para filtrar tópicos.

---

### 🔄 **Ciclo de Estudos (`Ciclo.vue` + `useCiclo.js`)**

-   **Propósito:** Implementar um sistema de estudo rotativo para alternar entre as matérias.
-   **Funcionalidades:**
    -   Exibe a matéria atual a ser estudada (`materiaAtual`) e o tempo sugerido.
    -   Botão para "Avançar", que marca a matéria atual como concluída no ciclo e passa para a próxima.
    -   Visualização do ciclo completo, destacando a matéria atual, as já concluídas e as futuras.
    -   Opção para "Reiniciar" o ciclo.

---

### ⏱ **Quadro de Horas (`Horas.vue` + `useHoras.js`)**

-   **Propósito:** Registrar e visualizar as horas de estudo.
-   **Funcionalidades:**
    -   Tabela para inserir horas de estudo por dia da semana e por matéria.
    -   Navegação entre as semanas do plano.
    -   Cálculos automáticos de totais: por dia, por matéria na semana, e total da semana.
    -   Tabela de resumo com o total de horas acumulado por matéria e geral.

---

### 📋 **Simulados (`Simulados.vue` + `useSimulados.js`)**

-   **Propósito:** Acompanhar o desempenho em simulados.
-   **Funcionalidades:**
    -   Formulário para registrar o número de acertos por matéria (Português, Matemática, Química).
    -   Cálculo automático do total de acertos e da porcentagem.
    -   Tabela com o histórico de todos os simulados, permitindo a remoção de registros.
    -   Cards de status que mostram o desempenho de cada simulado.

---

### 📕 **Caderno de Erros (`Erros.vue` + `useErros.js`)**

-   **Propósito:** Registrar e revisar erros cometidos em questões, transformando-os em aprendizado.
-   **Funcionalidades:**
    -   **Lazy-loaded:** Os dados só são carregados quando o usuário acessa esta view, otimizando o carregamento inicial.
    -   Formulário completo para registrar um erro, incluindo:
        -   Matéria e Tópico.
        -   `pensamento`: O raciocínio errado que o usuário teve.
        -   `respostaCorreta`: A lógica/resposta correta.
        -   `lacuna`: O conhecimento específico que faltou.
        -   `tipo`: Categoria do erro (Desconhecimento, Confusão, Atenção).
    -   Listagem de todos os erros, agrupados por matéria.
    -   Permite editar e remover erros.
    -   **Integração com Revisão Espaçada:** Cada erro possui um botão (📅) para `agendarRevisao`, criando automaticamente entradas no sistema de revisão.

---

### 📌 **Diário de Estudos (`Diario.vue` + `useDiario.js`)**

-   **Propósito:** Um checklist de hábitos e tarefas diárias para garantir uma rotina de estudos consistente.
-   **Funcionalidades:**
    -   Lista de tarefas fixas (ex: "Resolvi questões", "Revisei flashcards").
    -   Permite marcar/desmarcar itens para a data selecionada.
    -   Possibilidade de navegar entre datas para visualizar ou registrar checklists passados.
    -   Exibe as revisões agendadas para o dia e gerencia o sistema de revisão espaçada.

---

### 📖 **Plano de Estudos (`Plano.vue` + `usePlano.js`)**

-   **Propósito:** Exibir documentos de apoio, como o cronograma e o conteúdo programático.
-   **Funcionalidades:**
    -   Busca uma lista de documentos disponíveis na API (`/api/planos`).
    -   Permite ao usuário selecionar um documento em um `<select>`.
    -   Busca o conteúdo do documento (em Markdown) da API (`/api/plano/:id`).
    -   Renderiza o Markdown como HTML usando a biblioteca `marked` importada via NPM.