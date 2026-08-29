export const queryKeys = {
  // Autenticação e Usuário
  auth: {
    me: ['auth', 'me'] as const,
    session: ['auth', 'session'] as const,
  },
  users: {
    all: ['users'] as const,
    detail: (id: number) => ['users', 'detail', id] as const,
    byEmail: (email: string) => ['users', 'email', email] as const,
    redeCuidado: (id: number) => ['users', 'redeCuidado', id] as const,
  },

  // Pets
  pets: {
    all: ['pets'] as const,
    list: (page = 0, size = 20) => ['pets', 'list', { page, size }] as const,
    detail: (id: number) => ['pets', 'detail', id] as const,
    history: (id: number) => ['pets', 'history', id] as const,
    pontos: (id: number) => ['pets', 'pontos', id] as const,
  },

  // Tarefas
  tasks: {
    all: ['tasks'] as const,
    list: (page = 0, size = 50) => ['tasks', 'list', { page, size }] as const,
    byUser: (userId: number) => ['tasks', 'byUser', userId] as const,
    detail: (id: number) => ['tasks', 'detail', id] as const,
    userPoints: (userId: number) => ['tasks', 'userPoints', userId] as const,
  },

  // Clínicas
  clinics: {
    all: ['clinics'] as const,
    search: (termo?: string, apenas24h?: boolean) => ['clinics', 'search', { termo, apenas24h }] as const,
    detail: (id: number) => ['clinics', 'detail', id] as const,
  },

  // Treinamentos
  training: {
    tracks: ['training', 'tracks'] as const,
    trackDetail: (id: string) => ['training', 'tracks', id] as const,
  },

  // Assistente de IA
  ai: {
    insights: (petId: number) => ['ai', 'insights', petId] as const,
    messages: (petId: number) => ['ai', 'messages', petId] as const,
  },
};
