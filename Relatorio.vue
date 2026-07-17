<script setup>
import { useRelatorio } from './useRelatorio.js';

const {
  resumo, horasPorMateria, consistenciaSemanal,
  diasRecentes, cicloDetalhado, recomendacoes,
  ultimaSemanaComDados, mediaDiaria,
  META_HORAS_SEMANA, META_HORAS_DIA
} = useRelatorio();
</script>

<template>
  <div>

    <div class="grade-cartoes">
      <div class="cartao-stat verde">
        <div class="valor">{{ resumo.totalHoras }}h</div>
        <div class="rotulo">Total estudado</div>
      </div>
      <div class="cartao-stat" :class="resumo.horasSemana >= resumo.metaSemana ? 'verde' : 'laranja'">
        <div class="valor">{{ resumo.horasSemana }}h</div>
        <div class="rotulo">Esta semana</div>
      </div>
      <div class="cartao-stat" :class="resumo.conteudoProgresso >= 70 ? 'verde' : resumo.conteudoProgresso >= 30 ? 'laranja' : ''">
        <div class="valor">{{ resumo.conteudoProgresso }}%</div>
        <div class="rotulo">Conteúdo concluído</div>
      </div>
      <div class="cartao-stat" :class="resumo.revisoesPendentes === 0 ? 'verde' : 'vermelho'">
        <div class="valor">{{ resumo.revisoesPendentes }}</div>
        <div class="rotulo">Revisões pendentes</div>
      </div>
    </div>

    <div v-if="recomendacoes.length > 0" class="card">
      <div class="card-titulo">📋 Recomendações</div>
      <div v-for="(rec, i) in recomendacoes" :key="i" class="rec-item" :class="'rec-' + rec.tipo">
        <span class="rec-icon">{{ rec.icon }}</span>
        <span class="rec-texto">{{ rec.texto }}</span>
      </div>
    </div>

    <div class="card">
      <div class="card-titulo">📊 Horas por Matéria</div>
      <div v-for="m in horasPorMateria" :key="m.id" class="materia-row">
        <div class="materia-row-header">
          <span class="materia-row-icon">{{ m.icone }}</span>
          <span class="materia-row-nome">{{ m.nome }}</span>
          <span class="materia-row-horas">{{ m.horas }}h</span>
          <span v-if="m.totalItens > 0" class="materia-row-check">{{ m.itens }}/{{ m.totalItens }} tópicos</span>
        </div>
        <div class="barra-progresso">
          <div class="preenchimento" :style="{ width: Math.min(m.horas / Math.max(...horasPorMateria.map(x => x.horas), 1) * 100, 100) + '%', background: m.cor }"></div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-titulo">📅 Últimos 7 Dias</div>
      <div class="dias-grid">
        <div v-for="dia in diasRecentes" :key="dia.data" class="dia-card" :class="{ 'dia-bom': dia.atingiuMeta, 'dia-zero': dia.total === 0 }">
          <div class="dia-rotulo">{{ dia.rotulo }}</div>
          <div class="dia-horas">{{ dia.total.toFixed(1) }}h</div>
          <div class="dia-bar">
            <div class="dia-bar-preench" :style="{ height: Math.min(dia.total / META_HORAS_DIA * 100, 100) + '%' }"></div>
          </div>
          <div class="dia-materias" v-if="dia.materias.length > 0">
            <span v-for="m in dia.materias.slice(0, 2)" :key="m" class="dia-materia-tag">{{ m }}</span>
            <span v-if="dia.materias.length > 2" class="dia-materia-tag">+{{ dia.materias.length - 2 }}</span>
          </div>
          <div v-else class="dia-materias"><span class="dia-materia-tag vazia">—</span></div>
        </div>
      </div>
      <div v-if="mediaDiaria > 0" style="margin-top:12px;font-size:13px;color:var(--texto-sec);text-align:center;">
        Média de <strong style="color:var(--primaria)">{{ mediaDiaria }}h/dia</strong> nos dias com estudo
      </div>
    </div>

    <div v-if="consistenciaSemanal.length > 0" class="card">
      <div class="card-titulo">📈 Consistência Semanal</div>
      <table class="tabela-horas">
        <thead>
          <tr>
            <th>Semana</th>
            <th>Horas</th>
            <th>Meta</th>
            <th>%</th>
            <th>Barra</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in consistenciaSemanal" :key="s.semana">
            <td style="font-weight:600;">{{ s.semana }}</td>
            <td>{{ s.horas }}h</td>
            <td>{{ s.meta }}h</td>
            <td :style="{ color: s.pct >= 100 ? 'var(--sucesso)' : s.pct >= 70 ? 'var(--aviso)' : 'var(--erro)', fontWeight: 600 }">{{ s.pct }}%</td>
            <td style="min-width:120px;">
              <div class="barra-progresso" style="margin:0;height:8px;">
                <div class="preenchimento" :style="{ width: Math.min(s.pct, 100) + '%', background: s.pct >= 100 ? 'var(--sucesso)' : s.pct >= 70 ? 'var(--aviso)' : 'var(--primaria)' }"></div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <div class="card-titulo">🔄 Ciclo de Estudos</div>
      <div class="ciclo-grid">
        <div v-for="item in cicloDetalhado" :key="item.idx" class="ciclo-item-mini" :class="{ concluido: item.concluida }">
          <span class="ciclo-item-status">{{ item.concluida ? '✅' : '⏳' }}</span>
          <span class="ciclo-item-nome">{{ item.icone }} {{ item.materia }}</span>
          <span class="ciclo-item-tempo">{{ item.horasEstudadas }}h estudadas</span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-titulo">📌 Resumo Detalhado</div>
      <table class="tabela-horas">
        <tbody>
          <tr><td style="font-weight:600;width:200px;">Total de horas</td><td>{{ resumo.totalHoras }}h</td></tr>
          <tr><td style="font-weight:600;">Meta semanal</td><td>{{ resumo.metaSemana }}h/semana</td></tr>
          <tr><td style="font-weight:600;">Meta diária</td><td>{{ META_HORAS_DIA }}h/dia</td></tr>
          <tr><td style="font-weight:600;">Conteúdo concluído</td><td>{{ resumo.conteudoProgresso }}%</td></tr>
          <tr><td style="font-weight:600;">Ciclo concluído</td><td>{{ resumo.cicloProgresso }}%</td></tr>
          <tr><td style="font-weight:600;">Total de revisões criadas</td><td>{{ resumo.totalRevisoes }}</td></tr>
          <tr><td style="font-weight:600;">Revisões pendentes</td><td :style="{ color: resumo.revisoesPendentes > 0 ? 'var(--erro)' : 'var(--sucesso)', fontWeight: 600 }">{{ resumo.revisoesPendentes }}</td></tr>
          <tr><td style="font-weight:600;">Erros registrados</td><td>{{ resumo.totalErros }}</td></tr>
          <tr><td style="font-weight:600;">Simulados realizados</td><td>{{ resumo.totalSimulados }}</td></tr>
          <tr><td style="font-weight:600;">Último simulado</td><td>{{ resumo.ultimoSimulado }}</td></tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<style scoped>
.materia-row {
  margin-bottom: 14px;
}
.materia-row:last-child { margin-bottom: 0; }
.materia-row-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.materia-row-icon { font-size: 16px; }
.materia-row-nome { flex: 1; font-size: 14px; font-weight: 500; }
.materia-row-horas {
  font-size: 14px;
  font-weight: 700;
  color: var(--primaria);
}
.materia-row-check {
  font-size: 12px;
  color: var(--texto-sec);
}

.dias-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}
.dia-card {
  background: var(--bg);
  border-radius: 8px;
  padding: 10px 6px;
  text-align: center;
  border: 1px solid transparent;
  transition: all var(--transicao);
}
.dia-card.dia-bom {
  border-color: var(--sucesso);
  background: color-mix(in srgb, var(--sucesso) 8%, var(--bg));
}
.dia-card.dia-zero {
  opacity: 0.5;
}
.dia-rotulo {
  font-size: 11px;
  color: var(--texto-sec);
  margin-bottom: 4px;
  text-transform: uppercase;
}
.dia-horas {
  font-size: 16px;
  font-weight: 700;
  color: var(--texto);
  margin-bottom: 6px;
}
.dia-bar {
  height: 40px;
  background: var(--borda);
  border-radius: 4px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  margin-bottom: 6px;
}
.dia-bar-preench {
  width: 100%;
  background: var(--primaria);
  border-radius: 4px 4px 0 0;
  transition: height 0.5s ease;
  min-height: 2px;
}
.dia-bom .dia-bar-preench { background: var(--sucesso); }
.dia-materias {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dia-materia-tag {
  font-size: 9px;
  background: var(--card);
  padding: 1px 4px;
  border-radius: 3px;
  color: var(--texto-sec);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dia-materia-tag.vazia { opacity: 0.4; }

.ciclo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 6px;
}
.ciclo-item-mini {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--bg);
  border-radius: 6px;
  font-size: 13px;
}
.ciclo-item-mini.concluido { opacity: 0.5; }
.ciclo-item-status { flex-shrink: 0; }
.ciclo-item-nome { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ciclo-item-tempo { font-size: 11px; color: var(--texto-sec); }

.rec-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 6px;
  font-size: 14px;
  line-height: 1.4;
}
.rec-item:last-child { margin-bottom: 0; }
.rec-alerta {
  background: color-mix(in srgb, var(--erro) 8%, transparent);
  border-left: 3px solid var(--erro);
}
.rec-info {
  background: color-mix(in srgb, var(--primaria) 8%, transparent);
  border-left: 3px solid var(--primaria);
}
.rec-sucesso {
  background: color-mix(in srgb, var(--sucesso) 8%, transparent);
  border-left: 3px solid var(--sucesso);
}
.rec-icon { font-size: 18px; flex-shrink: 0; }
.rec-texto { flex: 1; color: var(--texto); }

@media (max-width: 768px) {
  .dias-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  .ciclo-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 600px) {
  .dias-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
