# Memorias do Projeto - Estudo Petrobras

## Visao Geral
App Vue 3 (Vite) para plano de estudos do concurso Petrobras - Tecnico em Quimica.
Roteamento hash manual (sem Vue Router). Singleton pattern nos composables.
Armazenamento localStorage com prefixo `petrobras_quimica_`.

## Comandos
- `npm run dev` - Inicia servidor Vite (porta 5173)
- `npm run build` - Build de producao
- `npm start` - Inicia backend Express (porta 3000)
- `start.ps1` - Inicia backend + frontend juntos

## Estrutura
- `App.vue` - Raiz com sidebar e roteamento hash
- `estilo.css` - CSS global com variaveis, tema escuro, responsivo
- `dados.js` - CONTEUDOS, CICLO_ESTUDOS, metas, checklist
- `armazenamento.js` - localStorage com debounce

## Telas
| Rota | Arquivo | Proposito |
|------|---------|-----------|
| `#dashboard` | Dashboard.vue | Visao geral |
| `#checklist` | Checklist.vue | Topicos do edital |
| `#ciclo` | Ciclo.vue | Ciclo de estudos |
| `#horas` | Horas.vue | Grade de horas |
| `#simulados` | Simulados.vue | Desempenho |
| `#erros` | Erros.vue | Caderno de erros |
| `#diario` | Diario.vue | **Registro do Dia + Revisoes** |
| `#relatorio` | Relatorio.vue | **Analise de produtividade** |
| `#plano` | Plano.vue | Documentos |

## Diario.vue - Registro do Dia
- **Total diario** com barra de progresso (meta: 6h/dia - `META_HORAS_DIA`)
- **Log do dia**: materias estudadas com botoes +/- e remover
- **Grade de materias**: clica na materia, seleciona tempo, adiciona
- **Sugestao do ciclo**: botoes +1h ou tempo sugerido
- Ciclo mapeado via `CICLO_MAP` (corrigido para acentos)
- Funcoes: `adicionarHoras(data, materiaId, incremento)`, `removerMateria(data, materiaId)`

## Relatorio.vue - Analise
- `useRelatorio.js` consolida dados de horas, checklist, ciclo, revisoes, erros, simulados
- Recomendacoes inteligentes com tipo (alerta/info/sucesso)
- Ultimos 7 dias com grafico de barras
- Consistencia semanal semana a semana
- Horas por materia com progresso do checklist

## Padroes
- `use[Nome].js` - Composables singleton
- `<style scoped>` em cada componente
- Variaveis CSS: `--primaria`, `--bg`, `--card`, `--texto`, `--borda`, `--sucesso`, `--erro`, `--aviso`
- 3 breakpoints: 1024px, 768px, 600px
- `color-mix()` para backgrounds com opacidade (fallback implicito)
