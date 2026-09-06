/**
 * Utilitários para manipulação de datas e cálculo de idade do Pet.
 * A idade do pet é calculada e exibida SOMENTE de forma estética/informativa.
 * O cadastro e a edição utilizam exclusivamente a DATA DE NASCIMENTO (DD/MM/AAAA ou ISO YYYY-MM-DD).
 */

/**
 * Converte data no formato 'DD/MM/AAAA' ou 'YYYY-MM-DD' para uma string ISO 'YYYY-MM-DD' aceita pela API Java.
 */
export function normalizarDataNascParaIso(input: string): string {
  const limpo = input.trim();
  if (!limpo) {
    const umAnoAtras = new Date().getFullYear() - 1;
    return `${umAnoAtras}-01-01`;
  }

  // Se já estiver no formato YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(limpo)) {
    return limpo;
  }

  // Se for DD/MM/AAAA ou D/M/AAAA
  if (limpo.includes('/')) {
    const partes = limpo.split('/');
    if (partes.length === 3) {
      const [dia, mes, ano] = partes;
      const anoFormatado = ano.length === 2 ? `20${ano}` : ano;
      return `${anoFormatado}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
  }

  // Fallback seguro se não reconhecer
  return limpo;
}

/**
 * Converte data ISO 'YYYY-MM-DD' ou 'YYYY-MM-DDTHH:mm:ss' para formato brasileiro 'DD/MM/AAAA' (ou 'DD/MM/AAAA HH:mm').
 */
export function formatarIsoParaBr(isoDate?: string, incluirHora = false): string {
  if (!isoDate) return '';
  const limpo = isoDate.trim();
  if (limpo.includes('/') && !limpo.includes('T')) return limpo;

  if (limpo.includes('T')) {
    const [dataPart, horaPart] = limpo.split('T');
    const [ano, mes, dia] = dataPart.split('-');
    if (incluirHora && horaPart) {
      const [h, m] = horaPart.split(':');
      return `${dia}/${mes}/${ano} ${h}:${m}`;
    }
    return `${dia}/${mes}/${ano}`;
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(limpo)) {
    const [ano, mes, dia] = limpo.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  return limpo;
}

/**
 * Calcula dinamicamente a idade do pet em anos a partir da data de nascimento (ISO ou DD/MM/AAAA).
 * Utilizado exclusivamente para fins informativos e estéticos na interface.
 */
export function calcularIdadePet(dataNasc?: string, fallbackIdade = 1): number {
  if (!dataNasc) return fallbackIdade;

  let dataObj: Date;
  if (dataNasc.includes('/')) {
    const [dia, mes, ano] = dataNasc.split('/');
    dataObj = new Date(Number(ano), Number(mes) - 1, Number(dia));
  } else {
    dataObj = new Date(dataNasc);
  }

  if (isNaN(dataObj.getTime())) return fallbackIdade;

  const hoje = new Date();
  let anos = hoje.getFullYear() - dataObj.getFullYear();
  const mesAtual = hoje.getMonth();
  const mesNasc = dataObj.getMonth();

  if (mesAtual < mesNasc || (mesAtual === mesNasc && hoje.getDate() < dataObj.getDate())) {
    anos--;
  }

  return Math.max(0, anos);
}

/**
 * Retorna o texto formatado da idade para exibição estética em cards e badges (ex: "2 anos", "1 ano", "Menos de 1 ano").
 */
export function formatarIdadePet(dataNasc?: string, fallbackIdade?: number): string {
  const anos = calcularIdadePet(dataNasc, fallbackIdade);
  if (anos === 0) return 'Menos de 1 ano';
  if (anos === 1) return '1 ano';
  return `${anos} anos`;
}

/**
 * Retorna a data de hoje no formato brasileiro 'DD/MM/AAAA'.
 */
export function formatarDataHojeBr(): string {
  const agora = new Date();
  const dia = String(agora.getDate()).padStart(2, '0');
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const ano = agora.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

/**
 * Retorna data e hora atual/padrão no formato brasileiro 'DD/MM/AAAA HH:mm'.
 */
function formatarDataHoraHojeBr(horaPadrao = '23:59'): string {
  const data = formatarDataHojeBr();
  return `${data} ${horaPadrao}`;
}

/**
 * Retorna um prazo padrão garantidamente futuro no formato 'DD/MM/AAAA HH:mm'.
 * Se ainda faltar tempo razoável hoje (antes das 22h), sugere hoje às 23:59.
 * Caso contrário, sugere amanhã às 12:00.
 */
export function obterPrazoFuturoPadraoBr(): string {
  const agora = new Date();
  if (agora.getHours() < 22) {
    return formatarDataHoraHojeBr('23:59');
  }
  const amanha = new Date(agora);
  amanha.setDate(amanha.getDate() + 1);
  const dia = String(amanha.getDate()).padStart(2, '0');
  const mes = String(amanha.getMonth() + 1).padStart(2, '0');
  const ano = amanha.getFullYear();
  return `${dia}/${mes}/${ano} 12:00`;
}

/**
 * Converte data de prazo (DD/MM/AAAA ou DD/MM/AAAA HH:mm ou ISO) para LocalDateTime ISO 'YYYY-MM-DDTHH:mm:ss'.
 */
export function normalizarPrazoParaIso(input?: string, horaPadrao = '23:59:00'): string {
  if (!input) {
    const hoje = new Date().toISOString().slice(0, 10);
    return `${hoje}T${horaPadrao}`;
  }

  const limpo = input.trim();
  if (!limpo) {
    const hoje = new Date().toISOString().slice(0, 10);
    return `${hoje}T${horaPadrao}`;
  }

  if (limpo.includes('T')) {
    return limpo.slice(0, 19);
  }

  if (limpo.includes('/')) {
    const [dataParte, horaParte] = limpo.split(' ');
    const partes = dataParte.split('/');
    if (partes.length === 3) {
      const [dia, mes, ano] = partes;
      const anoFormatado = ano.length === 2 ? `20${ano}` : ano;
      let horaFinal = horaPadrao;
      if (horaParte) {
        const partesHora = horaParte.split(':');
        const h = (partesHora[0] || '00').padStart(2, '0');
        const m = (partesHora[1] || '00').padStart(2, '0');
        const s = (partesHora[2] || '00').padStart(2, '0');
        horaFinal = `${h}:${m}:${s}`;
      }
      return `${anoFormatado}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T${horaFinal}`;
    }
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(limpo)) {
    return `${limpo}T${horaPadrao}`;
  }

  const hoje = new Date().toISOString().slice(0, 10);
  return `${hoje}T${horaPadrao}`;
}

/**
 * Formata prazo ISO para texto amigável em cards (ex: 'Hoje às 18:00', 'Amanhã às 08:00', '15/09 às 14:00').
 */
export function formatarPrazoAmigavel(isoDate?: string): string {
  if (!isoDate) return '';
  const limpo = isoDate.trim();
  if (!limpo.includes('T')) return limpo;

  const [dataPart, horaPart] = limpo.split('T');
  const [, mes, dia] = dataPart.split('-');
  const [h, m] = horaPart.split(':');
  const horaMin = `${h}:${m}`;

  const hojeIso = new Date().toISOString().slice(0, 10);
  if (dataPart === hojeIso) {
    return `Hoje às ${horaMin}`;
  }

  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  const amanhaIso = amanha.toISOString().slice(0, 10);
  if (dataPart === amanhaIso) {
    return `Amanhã às ${horaMin}`;
  }

  return `${dia}/${mes} às ${horaMin}`;
}

