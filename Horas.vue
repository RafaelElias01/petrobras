<script setup>
import { useHoras } from './useHoras.js';

const {
  horasSemanaAtual, metaSemanaCss, META_HORAS_SEMANA: metaHoras,
  totalHorasAcumuladas, semanaAtual, SEMANAS_PLANO: semanasPlano,
  DIAS_SEMANA: diasSemana, horaValor, setHora, totalDia,
  totalMateriaSemana, horasSemana, totalAcumulado, totalMeta
} = useHoras();
</script>

<template>
  <div>
    <div class="grade-cartoes" style="margin-bottom:20px;">
      <div class="cartao-stat verde">
        <div class="valor">{{ horasSemanaAtual }}</div>
        <div class="rotulo">h nesta semana</div>
      </div>
      <div class="cartao-stat" :class="metaSemanaCss">
        <div class="valor">{{ horasSemanaAtual }}/{{ metaHoras }}</div>
        <div class="rotulo">Meta semanal (h)</div>
      </div>
      <div class="cartao-stat">
        <div class="valor">{{ totalHorasAcumuladas }}h</div>
        <div class="rotulo">Total acumulado ({{ Math.round(totalHorasAcumuladas/360*100) }}% da meta)</div>
      </div>
    </div>

    <div class="card">
      <div class="card-titulo">
        <div class="navegacao-semanas">
          <button @click="semanaAtual--" :disabled="semanaAtual <= 1">‹ Anterior</button>
          <strong>Semana {{ semanaAtual }}</strong>
          <button @click="semanaAtual++" :disabled="semanaAtual >= semanasPlano">Próxima ›</button>
        </div>
      </div>
      <table class="tabela-horas">
        <thead>
          <tr>
            <th>Dia</th>
            <th>Português</th>
            <th>Matemática</th>
            <th>Química</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="dia in diasSemana" :key="dia.valor">
            <td style="font-weight:600;">{{ dia.rotulo }}</td>
            <td><input type="number" min="0" max="6" step="0.5"
              :value="horaValor(semanaAtual, dia.valor, 'portugues')"
              @input="setHora(semanaAtual, dia.valor, 'portugues', $event.target.value)"></td>
            <td><input type="number" min="0" max="6" step="0.5"
              :value="horaValor(semanaAtual, dia.valor, 'matematica')"
              @input="setHora(semanaAtual, dia.valor, 'matematica', $event.target.value)"></td>
            <td><input type="number" min="0" max="6" step="0.5"
              :value="horaValor(semanaAtual, dia.valor, 'quimica')"
              @input="setHora(semanaAtual, dia.valor, 'quimica', $event.target.value)"></td>
            <td class="total-linha">{{ totalDia(semanaAtual, dia.valor) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td style="font-weight:700;">Total</td>
            <td class="total-coluna">{{ totalMateriaSemana(semanaAtual, 'portugues') }}</td>
            <td class="total-coluna">{{ totalMateriaSemana(semanaAtual, 'matematica') }}</td>
            <td class="total-coluna">{{ totalMateriaSemana(semanaAtual, 'quimica') }}</td>
            <td class="total-coluna" style="color:var(--primaria);font-weight:700;">{{ horasSemana(semanaAtual) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="card">
      <div class="card-titulo">Acumulado por Semana</div>
      <table class="tabela-horas">
        <thead>
          <tr>
            <th>Semana</th><th>P</th><th>M</th><th>Q</th><th>Total</th><th>Meta</th><th>%</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in semanasPlano" :key="s">
            <td style="font-weight:600;">{{ s }}</td>
            <td>{{ totalMateriaSemana(s, 'portugues') }}</td>
            <td>{{ totalMateriaSemana(s, 'matematica') }}</td>
            <td>{{ totalMateriaSemana(s, 'quimica') }}</td>
            <td class="total-linha">{{ horasSemana(s) }}</td>
            <td>{{ metaHoras }}</td>
            <td>{{ metaHoras > 0 ? Math.round(horasSemana(s)/metaHoras*100) : 0 }}%</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td style="font-weight:700;">Total</td>
            <td class="total-coluna">{{ totalAcumulado('portugues') }}</td>
            <td class="total-coluna">{{ totalAcumulado('matematica') }}</td>
            <td class="total-coluna">{{ totalAcumulado('quimica') }}</td>
            <td class="total-coluna" style="color:var(--primaria);font-weight:700;">{{ totalHorasAcumuladas }}</td>
            <td>{{ totalMeta }}</td>
            <td>{{ totalMeta > 0 ? Math.round(totalHorasAcumuladas/totalMeta*100) : 0 }}%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>
