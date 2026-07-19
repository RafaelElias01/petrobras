const CRC_TABLE = (() => {
  const table = new Uint16Array(256);
  for (let i = 0; i < 256; i++) {
    let crc = i << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
    }
    table[i] = crc & 0xFFFF;
  }
  return table;
})();

function calcularCRC16(payload) {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc = ((crc << 8) ^ CRC_TABLE[((crc >> 8) ^ payload.charCodeAt(i)) & 0xFF]) & 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function addField(id, value) {
  const len = String(value.length).padStart(2, '0');
  return `${id}${len}${value}`;
}

export function gerarPayloadPix({ chave, nome, cidade, valor, txid = '***' }) {
  const gui = addField('00', 'br.gov.bcb.pix');
  const chaveField = addField('01', chave);
  const merchantAccount = addField('26', gui + chaveField);
  const mcc = addField('52', '0000');
  const currency = addField('53', '986');
  const amount = addField('54', valor.toFixed(2));
  const country = addField('58', 'BR');
  const merchantName = addField('59', nome.substring(0, 25));
  const merchantCity = addField('60', cidade.substring(0, 15));
  const txidField = addField('05', addField('03', txid));
  const additionalData = addField('62', txidField);
  const payloadSemCRC =
    addField('00', '01') +
    merchantAccount +
    mcc +
    currency +
    amount +
    country +
    merchantName +
    merchantCity +
    additionalData +
    '6304';
  const crc = calcularCRC16(payloadSemCRC);
  return payloadSemCRC + crc;
}
