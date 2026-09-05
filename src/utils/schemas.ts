import { z } from 'zod';

// Pipeline para Strings Não-Vazias com Trim Automático
const NonEmptyString = (errorMsg: string) =>
  z
    .string()
    .transform((v) => v.trim())
    .pipe(z.string().min(1, errorMsg));

// Pipeline de E-mail: trim, lowercase e validação formal de formato
const EmailPipeline = z
  .string()
  .transform((v) => v.trim().toLowerCase())
  .pipe(z.email('O formato do e-mail é inválido.').min(1, 'O e-mail é obrigatório.'));

// Pipeline de DDD: extrai apenas dígitos numéricos e valida 2 dígitos
const DddPipeline = z
  .string()
  .transform((v) => v.replace(/\D/g, '').trim())
  .pipe(z.string().regex(/^\d{2}$/, 'O DDD deve conter exatamente 2 dígitos.'));

// Pipeline de Telefone Celular: extrai apenas dígitos numéricos e valida 9 dígitos
const TelefonePipeline = z
  .string()
  .transform((v) => v.replace(/\D/g, '').trim())
  .pipe(z.string().regex(/^\d{9}$/, 'O telefone celular deve ter exatamente 9 dígitos.'));

// Pipeline de CEP: extrai apenas dígitos numéricos e valida 8 dígitos
const CepPipeline = z
  .string()
  .transform((v) => v.replace(/\D/g, '').trim())
  .pipe(z.string().regex(/^\d{8}$/, 'O CEP deve conter exatamente 8 dígitos numéricos.'));

// Schema de Login
export const LoginSchema = z.object({
  email: EmailPipeline,
  senha: z.string().min(1, 'Informe sua senha.'),
});

// Schema de Cadastro de Tutor (com transform pipelines automáticos)
export const RegisterSchema = z
  .object({
    nome: NonEmptyString('O nome completo é obrigatório.'),
    email: EmailPipeline,
    ddd: DddPipeline,
    numeroTelefone: TelefonePipeline,
    role: z.enum(['COMUM', 'PREMIUM']).default('PREMIUM'),
    cep: CepPipeline,
    numero: NonEmptyString('O número do endereço é obrigatório.'),
    senha: z.string().min(6, 'A senha deve conter no mínimo 6 caracteres.'),
    confirmarSenha: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: 'As senhas digitadas não coincidem.',
    path: ['confirmarSenha'],
  });

// Schema de Edição de Perfil
export const ProfileEditSchema = z.object({
  nome: NonEmptyString('O nome completo é obrigatório.'),
  email: EmailPipeline,
  ddd: DddPipeline,
  numeroTelefone: TelefonePipeline,
  role: z.enum(['COMUM', 'PREMIUM']).default('PREMIUM'),
  cep: CepPipeline,
  numero: NonEmptyString('O número do endereço é obrigatório.'),
  senha: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: 'A nova senha deve conter no mínimo 6 caracteres.',
    }),
});

// Validador de data real no formato DD/MM/AAAA ou YYYY-MM-DD
const isValidDateBrOrIso = (val: string): boolean => {
  if (!val || typeof val !== 'string') return false;
  const limpo = val.trim();
  let d: number;
  let m: number;
  let y: number;

  if (limpo.includes('/')) {
    const parts = limpo.split('/');
    if (parts.length !== 3) return false;
    d = parseInt(parts[0], 10);
    m = parseInt(parts[1], 10);
    y = parseInt(parts[2], 10);
  } else if (limpo.includes('-')) {
    const parts = limpo.split('-');
    if (parts.length !== 3) return false;
    y = parseInt(parts[0], 10);
    m = parseInt(parts[1], 10);
    d = parseInt(parts[2], 10);
  } else {
    return false;
  }

  if (isNaN(d) || isNaN(m) || isNaN(y)) return false;
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) return false;

  const dateObj = new Date(y, m - 1, d);
  if (dateObj.getFullYear() !== y || dateObj.getMonth() !== m - 1 || dateObj.getDate() !== d) {
    return false;
  }

  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);
  return dateObj <= hoje;
};

// Schema de Pet
export const PetSchema = z.object({
  nome: NonEmptyString('O nome do pet é obrigatório.'),
  raca: NonEmptyString('A raça do pet é obrigatória.'),
  dataNasc: z
    .string()
    .trim()
    .min(1, 'A data de nascimento do pet é obrigatória.')
    .refine(isValidDateBrOrIso, {
      message: 'Data de nascimento inválida. Informe uma data real (DD/MM/AAAA) que não esteja no futuro.',
    }),
  porte: z.enum(['PEQUENO', 'MEDIO', 'GRANDE'], {
    error: 'Porte inválido. Escolha PEQUENO, MEDIO ou GRANDE.',
  }),
  sexo: z.string().min(1, 'O sexo do pet é obrigatório.'),
  castrado: z.boolean().default(false),
});

// Schema de Tarefa
export const TaskSchema = z.object({
  petId: z.number().int().positive('Selecione para qual pet a tarefa será criada.'),
  titulo: NonEmptyString('O título da tarefa é obrigatório.'),
  descricao: NonEmptyString('A descrição da tarefa é obrigatória.'),
  pontos: z.coerce.number().int().positive('A pontuação deve ser um número maior que zero.'),
});

// Schema de Convite de Cuidador
export const InviteCaregiverSchema = z.object({
  email: EmailPipeline,
  petId: z.number().int().positive('Selecione qual pet será compartilhado.'),
});

// Schema de Registro de Histórico Clínico / Saúde do Pet
export const HistoricoSchema = z.object({
  tipoHist: NonEmptyString('Informe o tipo de evento, atendimento ou vacina.'),
  dataHist: NonEmptyString('A data do evento é obrigatória.'),
  petId: z.number().int().positive('O pet é obrigatório.'),
});

// Schema de Mensagem para o Assistente IA
export const AiMessageInputSchema = z
  .string()
  .transform((v) => v.trim())
  .pipe(z.string().min(1, 'A mensagem não pode ser vazia.'));

// Helper centralizado para extrair mensagens amigáveis do Zod
export function formatZodError(error: z.ZodError): string {
  if (!error.issues || error.issues.length === 0) {
    return 'Dados inválidos no formulário.';
  }
  return error.issues[0].message;
}

export type LoginFormData = z.infer<typeof LoginSchema>;
export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type ProfileEditFormData = z.infer<typeof ProfileEditSchema>;
export type PetSchemaData = z.infer<typeof PetSchema>;
export type TaskFormData = z.infer<typeof TaskSchema>;
export type InviteCaregiverFormData = z.infer<typeof InviteCaregiverSchema>;
export type HistoricoFormData = z.infer<typeof HistoricoSchema>;