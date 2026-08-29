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
 * Converte data ISO 'YYYY-MM-DD' para o formato brasileiro 'DD/MM/AAAA' para exibição nos inputs de edição.
 */
export function formatarIsoParaBr(isoDate?: string): string {
  if (!isoDate) return '';
  const limpo = isoDate.trim();
  if (limpo.includes('/')) return limpo;

  if (/^\d{4}-\d{2}-\d{2}/.test(limpo)) {
    const [ano, mes, dia] = limpo.split('T')[0].split('-');
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
