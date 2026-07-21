// `new Date().toISOString().slice(0,10)` usa UTC, não o fuso do usuário.
// No Brasil (UTC-3), entre ~21h e meia-noite locais isso já retorna a data
// de amanhã, fazendo registros do fim do dia caírem silenciosamente no dia
// seguinte. Use sempre esta função para obter/formatar "hoje" ou qualquer
// data local no formato YYYY-MM-DD.
export function hojeLocalISO() {
  return dataLocalISO(new Date());
}

export function dataLocalISO(data) {
  const d = new Date(data);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

// Para uso no servidor: a VM roda em UTC (não no fuso do visitante), mas o
// público do produto é 100% Brasil -- "hoje" pro admin (ex: contagem de
// visitas do dia) deve ser sempre horário de Brasília, fixo, independente
// do fuso do processo Node.
export function hojeBrasiliaISO() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}
