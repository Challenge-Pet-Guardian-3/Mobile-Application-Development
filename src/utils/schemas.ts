import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.email('O e-mail está com formato errado!').min(1, 'Por favor, insira o seu e-mail.'),
  senha: z.string().min(1, 'Por favor, insira a sua senha.'),
});

export const RegisterSchema = z
  .object({
    nome: z.string().min(1, 'O nome é obrigatório!'),
    email: z.email('O e-mail está com formato errado!').min(1, 'O e-mail é obrigatório!'),
    senha: z.string().min(6, 'A senha deve ter no mínimo 6 dígitos!'),
    confirmarSenha: z.string().min(1, 'Confirme sua senha!'),
    ddd: z.string().min(2, 'DDD é obrigatório (2 dígitos)').max(2, 'DDD deve ter 2 dígitos'),
    numeroTelefone: z.string().min(8, 'Telefone deve ter no mínimo 8 dígitos'),
    role: z.enum(['COMUM', 'PREMIUM']).default('PREMIUM'),
    cep: z.string().min(8, 'CEP deve ter 8 dígitos'),
    numero: z.string().min(1, 'O número do endereço é obrigatório!'),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: 'As senhas não coincidem!',
    path: ['confirmarSenha'],
  });

export const ProfileEditSchema = z
  .object({
    nome: z.string().min(1, 'O nome é obrigatório!'),
    email: z.email('O e-mail está com formato errado!').min(1, 'O e-mail é obrigatório!'),
    senha: z.string().min(6, 'A senha deve ter no mínimo 6 dígitos!'),
    confirmarSenha: z.string().min(1, 'Confirme sua senha!'),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: 'As senhas não coincidem!',
    path: ['confirmarSenha'],
  });

// Schema de validação do Pet com Zod para a API Java
export const PetSchema = z.object({
  nome: z.string().trim().min(1, 'O nome do pet é obrigatório!'),
  raca: z.string().trim().min(1, 'A raça do pet é obrigatória!'),
  dataNasc: z.string().optional(),
  porte: z.enum(['PEQUENO', 'MEDIO', 'GRANDE'], {
    error: 'Porte inválido. Escolha PEQUENO, MEDIO ou GRANDE.',
  }),
  sexo: z.string().min(1, 'Sexo é obrigatório!'),
  castrado: z.boolean().default(false),
  avatarId: z.string().optional(),
});

export type LoginFormData = z.infer<typeof LoginSchema>;
export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type ProfileEditFormData = z.infer<typeof ProfileEditSchema>;
export type PetSchemaData = z.infer<typeof PetSchema>;