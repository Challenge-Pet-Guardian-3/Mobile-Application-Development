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
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem!',
  path: ['confirmarSenha'],
});

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