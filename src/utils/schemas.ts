import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('O e-mail está com formato errado!').min(1, 'O e-mail é obrigatório!'),
  senha: z.string().min(1, 'A senha é obrigatória!'),
});

export const RegisterSchema = z.object({
  nome: z.string().min(1, 'O nome é obrigatório!'),
  email: z.string().email('O e-mail está com formato errado!').min(1, 'O e-mail é obrigatório!'),
  senha: z.string().min(8, 'A senha deve ter no mínimo 8 dígitos!'),
  confirmarSenha: z.string().min(1, 'Confirme a senha!'),
  telefone: z.string()
    .min(1, 'O telefone é obrigatório!')
    .refine((v) => /^\d{10,11}$/.test(v.replace(/\D/g, '')), {
      message: 'Informe um telefone válido com DDD (10 ou 11 dígitos)!',
    }),
  cep: z.string()
    .min(1, 'O CEP é obrigatório!')
    .refine((v) => /^\d{8}$/.test(v.replace(/\D/g, '')), {
      message: 'Informe um CEP válido com 8 dígitos!',
    }),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem!',
  path: ['confirmarSenha'],
});

// Função utilitária para converter strings DD/MM/YYYY ou YYYY-MM-DD em objeto Date
const parseDate = (dateStr?: string | null): Date | null => {
  if (!dateStr || dateStr.trim() === '') return null;
  const limpo = dateStr.trim();
  
  if (limpo.includes('/')) {
    const partes = limpo.split('/');
    if (partes.length === 3) {
      const [dia, mes, ano] = partes.map(Number);
      if (!isNaN(dia) && !isNaN(mes) && !isNaN(ano)) {
        return new Date(ano, mes - 1, dia);
      }
    }
  } else if (limpo.includes('-')) {
    const partes = limpo.split('-');
    if (partes.length === 3) {
      const [ano, mes, dia] = partes.map(Number);
      if (!isNaN(dia) && !isNaN(mes) && !isNaN(ano)) {
        return new Date(ano, mes - 1, dia);
      }
    }
  }
  return null;
};

export const PetSchema = z.object({
  avatarId: z.string().optional(),
  nome: z.string().min(1, 'O nome do pet é obrigatório!'),
  raca: z.string().min(1, 'A raça é obrigatória!'),
  idade: z.string().min(1, 'A idade é obrigatória!'),
  peso: z.string().optional(),
  sexo: z.string().min(1, 'Informe o sexo do pet!'),
  castrado: z.string().min(1, 'Informe se o pet é castrado!'),
  ultimaVacina: z.string().optional(),
  ultimaConsulta: z.string().optional(),
  veterinario: z.string().optional(),
  alergias: z.string().optional(),
  medicamentos: z.string().optional(),
})
.refine((data) => {
  const dataConsulta = parseDate(data.ultimaConsulta);
  if (!dataConsulta) return true;
  return dataConsulta <= new Date();
}, {
  message: 'A data da consulta não pode ser no futuro!',
  path: ['ultimaConsulta'],
})
.refine((data) => {
  const dataConsulta = parseDate(data.ultimaConsulta);
  if (!dataConsulta) return true;

  const anos = parseInt(data.idade.replace(/\D/g, ''), 10);
  if (isNaN(anos)) return true;

  const anoNascimentoEstimado = new Date().getFullYear() - anos;
  return dataConsulta.getFullYear() >= anoNascimentoEstimado;
}, {
  message: 'A data da consulta não pode ser anterior ao nascimento do pet!',
  path: ['ultimaConsulta'],
})
.refine((data) => {
  const dataVacina = parseDate(data.ultimaVacina);
  if (!dataVacina) return true;
  return dataVacina <= new Date();
}, {
  message: 'A data da vacina não pode ser no futuro!',
  path: ['ultimaVacina'],
})
.refine((data) => {
  const dataVacina = parseDate(data.ultimaVacina);
  if (!dataVacina) return true;

  const anos = parseInt(data.idade.replace(/\D/g, ''), 10);
  if (isNaN(anos)) return true;

  const anoNascimentoEstimado = new Date().getFullYear() - anos;
  return dataVacina.getFullYear() >= anoNascimentoEstimado;
}, {
  message: 'A data da vacina não pode ser anterior ao nascimento do pet!',
  path: ['ultimaVacina'],
});

export const ProfileEditSchema = z.object({
  nome: z.string().min(1, 'O nome é obrigatório!'),
  email: z.string().email('O e-mail está com formato errado!').min(1, 'O e-mail é obrigatório!'),
  senha: z.string().optional(),
  confirmarSenha: z.string().optional(),
}).refine((data) => {
  if (!data.senha) return true;
  return data.senha.length >= 8;
}, {
  message: 'A senha deve ter no mínimo 8 dígitos!',
  path: ['senha'],
}).refine((data) => {
  if (!data.senha && !data.confirmarSenha) return true;
  return data.senha === data.confirmarSenha;
}, {
  message: 'As senhas não coincidem!',
  path: ['confirmarSenha'],
});