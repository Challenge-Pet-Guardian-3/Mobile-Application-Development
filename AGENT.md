# 🤖 AGENT.md — Guia Arquitetural & Especificação Técnica Completa (Mobile-Application-Development)

Este documento serve como referência definitiva e fonte única da verdade para agentes de IA e desenvolvedores sobre toda a arquitetura, telas, contratos de API, gerenciamento de estado, rotas, tipagens TypeScript e fluxos do aplicativo móvel **PetGuardian** (Ecossistema Clyvo).

---

## 🏛️ 1. Visão Geral da Arquitetura

O aplicativo foi construído com foco em **alta performance**, **experiência do usuário moderna (estilo Duolingo/iFood)**, **arquitetura limpa (Clean Code, DRY, SOLID - SRP)** e **sincronização reativa de dados** com a API Java Spring Boot (`Java-Advanced`) e o microsserviço de IA em Python (`FastAPI`).

### Stack Tecnológica
- **Framework Base**: React Native 0.83.6 com **Expo SDK 57** (`expo@~57.0.18`, `@expo/metro-runtime@~57.0.14`, `expo-status-bar@~57.0.1`).
- **Linguagem**: TypeScript 5.3+ (**Tipagem Estrita - Zero `any`**, tipagem explícita de props, rotas e retornos).
- **Gerenciamento de Estado Assíncrono & Cache**: **TanStack Query v5** (`@tanstack/react-query@^5.90.20`) com mutações declarativas (`mutate` com `onSuccess`/`onError`) e invalidação granular de cache.
- **Padrão Arquitetural de Dados**: **Domain Hooks** (camada intermediária que encapsula regras de negócio, sanitização de payloads, mutations e diálogos de confirmação, mantendo as telas puramente declarativas).
- **Cliente HTTP Centralizado**: **Axios** com interceptores para injeção automática de Bearer Token JWT e captura global de status `401 Unauthorized`.
- **Gerenciamento de Sessão Global**: React Context API (`AuthContext`) integrado com `@react-native-async-storage/async-storage` e `expo-secure-store`.
- **Navegação Nativa**: `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`.
- **Validação de Formulários**: **Zod** (`zod@^4.3.6`).
- **Ícones**: `@expo/vector-icons` (`MaterialCommunityIcons`, `Ionicons`, `FontAwesome`, `FontAwesome5`).

---

## 📁 2. Estrutura de Diretórios

```text
Mobile-Application-Development/
├── AGENT.md                       → Este documento mestre de arquitetura
├── README.md                      → Documentação de inicialização e rotas
├── App.tsx                        → Root com QueryClientProvider e AuthProvider
├── package.json                   → Dependências alinhadas ao Expo SDK 57
└── src/
    ├── components/                → Componentes visuais atômicos e modulares (DRY / SOLID / SRP)
    │   ├── AuthFooter/            → Rodapé com links de alternância entre Login e Registro
    │   ├── AuthHeader/            → Cabeçalho temático com botão voltar para fluxos de autenticação
    │   ├── BaseModal/             → Modal acessível com backdrop, título, subtítulo, botão fechar e ScrollView
    │   ├── CaregiverCard/         → Card de cuidador familiar com status de responsável principal
    │   ├── CustomButton/          → Botão tátil com variantes: primary, success (verde #10B981), secondary, outline, danger
    │   ├── CustomInput/           → Input com suporte a ícones esquerdo/direito, erro flutuante e foco
    │   ├── EditProfileModal/      → Modal tipado para edição cadastral do tutor
    │   ├── EmptyState/            → Estado vazio padronizado com ícone, título, descrição e botão de ação
    │   ├── FamilySummaryCard/     → Card resumo da família com contadores de pets, tarefas e XP da rede
    │   ├── FamilyTaskItem/        → Item da lista de rotinas familiares com vinculação e exclusão nativa
    │   ├── Header/                → Cabeçalho limpo com título, subtítulo e avatar com iniciais
    │   ├── InviteCaregiverModal/  → Modal de convite de co-cuidadores por e-mail
    │   ├── LoadingSpinner/        → Indicador de carregamento com mensagem contextual
    │   ├── PasswordInput/         → Input de senha com alternância de visibilidade (olho)
    │   ├── PetAvatarCarousel/     → Carrossel horizontal de seleção de pets com mini avatares circulares
    │   ├── PetCard/               → Card de pet para grids com raça, badge de tutor principal e porte
    │   ├── PetFormModal/          → Modal reutilizável para criação e edição da ficha do animal
    │   ├── PetHeaderCard/         → Card principal de destaque do pet com tags dinâmicas e ações
    │   ├── PetHistoryList/        → Histórico consolidado de cuidados com timeline, pontos e status
    │   ├── PetScoreBar/           → Barra de bem-estar orgânica com pílulas de status e nível
    │   ├── PremiumLockCard/       → Card informativo de bloqueio e upgrade para recursos exclusivos Premium
    │   ├── RoleBadge/             → Badge visual de perfil (⭐ Tutor Premium ou 🐾 Tutor Comum)
    │   ├── RoleSelector/          → Seletor declarativo de plano ('cards' no cadastro e 'compact' em modais)
    │   ├── RoutineCard/           → Card de tarefa com checkbox tátil, strike-through e badge de XP
    │   ├── StatCard/              → Card atômico para métricas gamificadas (XP, Pets Família, Concluídas)
    │   ├── TaskFormModal/         → Modal para criação de novas tarefas e rotinas
    │   └── streakCard/            → Card de ofensiva familiar com pílulas dos 7 dias da semana
    ├── constants/
    │   ├── Avatares.ts            → Mapeamento de avatares ilustrados para pets
    │   └── Keys.ts                → Chaves padronizadas do AsyncStorage
    ├── contexts/
    │   └── AuthContext.tsx        → Contexto global de autenticação, login, registro e persistência
    ├── hooks/                     → Custom Hooks & Domain Hooks (Separação de Responsabilidades)
    │   ├── useAiAssistant.ts      → Insights preventivos e chat conversacional com o pet
    │   ├── useAuthMutations.ts    → Mutações de Login e Registro com TanStack Query
    │   ├── useFamilyCare.ts       → [DOMAIN HOOK] Gestão da rede familiar, pets, tarefas e cuidadores
    │   ├── useHomeData.ts         → [DOMAIN HOOK] Orquestração do pet ativo, pontuação e tarefas da Home
    │   ├── usePetDetail.ts        → [DOMAIN HOOK] Gestão da ficha clínica, histórico e edição do pet
    │   ├── usePets.ts             → Queries e mutações básicas de pets (TanStack Query)
    │   ├── useRedeCuidado.ts      → Query da rede de cuidado agregada (GET /usuarios/{id}/rede-cuidado)
    │   ├── useSession.ts          → Hook utilitário para consumir o AuthContext
    │   ├── useTasks.ts            → Queries e mutações de tarefas e pontos do tutor
    │   ├── useTrainings.ts        → [DOMAIN HOOK] Trilhas de adestramento gamificadas com TanStack Query
    │   ├── useUserProfile.ts      → [DOMAIN HOOK] Perfil do tutor, sanitização e preferências
    │   └── useUsers.ts            → Mutações de atualização (PUT) e exclusão (DELETE) de usuário
    ├── lib/
    │   ├── queryClient.ts         → Instância singleton configurada do TanStack QueryClient
    │   └── queryKeys.ts           → Fábrica hierárquica e tipada de Query Keys
    ├── routes/
    │   ├── MainStack.tsx          → Alternador de fluxo (AuthStack vs AppTabs) baseado no token
    │   ├── tabs.tsx               → Barra de abas inferior com botão central elevado da IA
    │   └── types.ts               → Tipagem estrita de parâmetros de todas as rotas e stacks
    ├── screens/
    │   ├── AiAssistant/           → Chat com IA preventiva e bloqueio com PremiumLockCard
    │   ├── FamilyPet/             → Gestão de pets da família, criação de tarefas e co-cuidadores
    │   ├── Home/                  → Dashboard do pet ativo, score, ofensiva e tarefas do dia
    │   ├── Login/                 → Tela de login com campos limpos e validação Zod
    │   ├── PetDetail/             → Ficha clínica detalhada, histórico e edição com componentes modulares
    │   ├── Register/              → Cadastro com RoleSelector (default: PREMIUM) e botão verde success
    │   ├── TrainingEducation/     → Trilhas de adestramento gamificadas alimentadas por TanStack Query
    │   ├── UserProfile/           → Perfil do tutor, estatísticas, preferências e exclusão de conta
    │   └── Welcome/               → Onboarding inicial com botão 'Criar conta grátis'
    ├── services/                  → Camada de comunicação HTTP REST com o Backend
    │   ├── ai.ts                  → Microsserviço Python FastAPI (/ai/insights, /ai/chat)
    │   ├── auth.ts                → Registro e login integrados ao StorageService
    │   ├── http.ts                → Instância Axios central com interceptors de Request/Response
    │   ├── pets.ts                → Endpoints REST do PetController no Java
    │   ├── storage.ts             → Fachada centralizada: SecureStore (JWT) + AsyncStorage (Cache)
    │   ├── tasks.ts               → Endpoints REST do TarefaController no Java
    │   ├── trainings.ts           → Endpoints REST de trilhas, módulos e aulas no Java
    │   └── users.ts               → Endpoints REST do UsuarioController no Java
    ├── types/                     → Contratos TypeScript espelhando a API Java (100% tipados)
    │   ├── ai.ts                  → Mensagens e insights de IA
    │   ├── api.ts                 → Paginação Spring (Page<T>) e erros de API
    │   ├── auth.ts                → Credenciais de Login e Registro
    │   ├── models.ts              → Re-exportação agregada de todos os tipos
    │   ├── pet.ts                 → PetRequest, PetResponse, PetHistoryResponse, CoCuidadorResponse
    │   ├── task.ts                → TarefaRequest, TarefaResponse, TarefaConclusaoRequest
    │   ├── training.ts            → Trilhas, módulos, lições e passos de adestramento
    │   └── user.ts                → UsuarioRequest, UsuarioResponse, RedeCuidadoResponse, UsuarioRole
    └── utils/
        ├── alert.ts               → Utilitário unificado de alerta multiplataforma
        ├── petUtils.ts            → Normalização de datas (ISO <-> BR) e cálculo estético de idade
        └── schemas.ts             → Schemas de validação Zod para Login, Cadastro e Pets
```

---

## 🧭 3. Sistema de Navegação & Rotas Tipadas

A navegação é estritamente tipada em `src/routes/types.ts` sem nenhum uso de `any`:

```typescript
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type FamilyStackParamList = {
  FamilyMain: undefined;
  PetDetail: { petId?: number } | undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  PetDetail: { petId?: number } | undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Family: { screen?: keyof FamilyStackParamList; params?: FamilyStackParamList[keyof FamilyStackParamList] } | undefined;
  IA: { petId?: number } | undefined;
  Treino: undefined;
  Perfil: { screen?: keyof ProfileStackParamList; params?: ProfileStackParamList[keyof ProfileStackParamList] } | undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  Tabs: undefined;
  PetDetail: { petId?: number } | undefined;
  IA: { petId?: number } | undefined;
  Family: { screen?: string; params?: { petId?: number } } | undefined;
  Perfil: { screen?: string; params?: Record<string, unknown> } | undefined;
};
```

---

## 📱 4. Mapeamento Detalhado de Telas & Domain Hooks

### 4.1. `HomeScreen` (`src/screens/Home/HomeScreen.tsx`)
- **Domain Hook**: [`useHomeData.ts`](file:///c:/Users/Enzo/new_backup/FIAP/_Projetos/Challenge%20Clyvo%203/Mobile-Application-Development/src/hooks/useHomeData.ts).
- **Responsabilidade**: Dashboard focado no pet ativo.
- **Componentes Compositores**:
  - `Header`: Saudação ao tutor logado.
  - **Seletor de Pets Horizontal**: Pílulas compactas para alternar o pet ativo.
  - `PetScoreBar`: Barra de progresso orgânica com cálculo de nível de bem-estar.
  - `StreakCard`: Ofensiva de dias consecutivos com tarefas concluídas.
  - `RoutineCard`: Cards interativos para alternar o status das tarefas (`alternarStatusTarefa`) ou removê-las (`excluirTarefaComConfirmacao`).

### 4.2. `FamilyPetScreen` (`src/screens/FamilyPet/FamilyPetScreen.tsx`)
- **Domain Hook**: [`useFamilyCare.ts`](file:///c:/Users/Enzo/new_backup/FIAP/_Projetos/Challenge%20Clyvo%203/Mobile-Application-Development/src/hooks/useFamilyCare.ts).
- **Responsabilidade**: Gestão colaborativa familiar, animais cadastrados, delegação de tarefas e cuidadores.
- **Componentes Compositores**:
  - `FamilySummaryCard`: Resumo visual escuro com totais de pets, tarefas e XP acumulado da rede.
  - `PetCard`: Grid de animais com tag *"Tutor Princ."* via `RedeCuidadoMapper`.
  - `FamilyTaskItem`: Itens da lista de tarefas com confirmação integrada de remoção.
  - `CaregiverCard`: Co-cuidadores vinculados e seus animais associados.
  - `PetFormModal`, `TaskFormModal` e `InviteCaregiverModal`: Modais limpos para inserção de dados reais.

### 4.3. `PetDetailScreen` (`src/screens/PetDetail/PetDetailScreen.tsx`)
- **Domain Hook**: [`usePetDetail.ts`](file:///c:/Users/Enzo/new_backup/FIAP/_Projetos/Challenge%20Clyvo%203/Mobile-Application-Development/src/hooks/usePetDetail.ts).
- **Responsabilidade**: Ficha clínica detalhada e prontuário médico.
- **Componentes Compositores**:
  - `PetAvatarCarousel`: Carrossel horizontal de seleção de pets com mini avatares circulares.
  - `PetHeaderCard`: Card de destaque com tags dinâmicas de porte, idade, sexo e castração, além dos botões "Editar Ficha" e "Excluir".
  - `PetHistoryList`: Timeline de cuidados concluídos com pontuação e formatação segura de datas.
  - `PetFormModal`: Modal pré-preenchido para atualização cadastral na API Java.

### 4.4. `TrainingEducationScreen` (`src/screens/TrainingEducation/TrainingEducationScreen.tsx`)
- **Domain Hook**: [`useTrainings.ts`](file:///c:/Users/Enzo/new_backup/FIAP/_Projetos/Challenge%20Clyvo%203/Mobile-Application-Development/src/hooks/useTrainings.ts).
- **Responsabilidade**: Trilhas educativas gamificadas de adestramento alimentadas por TanStack Query.
- **Regras**:
  - Bloqueio amigável com `PremiumLockCard` para contas comuns (`role === 'COMUM'`).
  - Para `PREMIUM`: nós interativos 3D em zigue-zague, modal prático e mutação `concluirLicao` chamando `PATCH /aulas/{id}/concluir` com invalidação automática de cache de pontos do pet.

### 4.5. `UserProfileScreen` (`src/screens/UserProfile/UserProfileScreen.tsx`)
- **Domain Hook**: [`useUserProfile.ts`](file:///c:/Users/Enzo/new_backup/FIAP/_Projetos/Challenge%20Clyvo%203/Mobile-Application-Development/src/hooks/useUserProfile.ts).
- **Responsabilidade**: Perfil do tutor, estatísticas gamificadas, switches de preferências e exclusão de conta.
- **Componentes Compositores**:
  - `RoleBadge`: Indicador visual do plano (⭐ Premium).
  - `StatCard`: XP acumulado, contagem de pets e tarefas concluídas.
  - `EditProfileModal`: Modal com campos de DDD, telefone, CEP e senha.
  - Ações com diálogos nativos: `logoutComConfirmacao` e `excluirContaComConfirmacao`.

---

## ⚡ 5. Gerenciamento de Estado & TanStack Query

### 5.1. Fábrica de Query Keys (`src/lib/queryKeys.ts`)
```typescript
export const queryKeys = {
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
  pets: {
    all: ['pets'] as const,
    list: (page = 0, size = 20) => ['pets', 'list', { page, size }] as const,
    detail: (id: number) => ['pets', 'detail', id] as const,
    history: (id: number) => ['pets', 'history', id] as const,
    pontos: (id: number) => ['pets', 'pontos', id] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    list: (page = 0, size = 50) => ['tasks', 'list', { page, size }] as const,
    byUser: (userId: number) => ['tasks', 'byUser', userId] as const,
    detail: (id: number) => ['tasks', 'detail', id] as const,
    userPoints: (userId: number) => ['tasks', 'userPoints', userId] as const,
  },
  training: {
    all: ['training'] as const,
    tracks: ['training', 'tracks'] as const,
    byPet: (petId?: number) => ['training', 'pet', petId] as const,
    trackDetail: (id: string) => ['training', 'tracks', id] as const,
  },
  ai: {
    insights: (petId: number) => ['ai', 'insights', petId] as const,
    messages: (petId: number) => ['ai', 'messages', petId] as const,
  },
};
```

### 5.2. Padrão Declarativo de Mutações (Sem `mutateAsync`)
- **Regra**: Não utilizar `mutateAsync` envolto em blocos imperativos de `try / catch / finally` nas telas.
- **Padrão Oficial**: Utilizar `mutate` com os callbacks nativos `onSuccess` e `onError`:
  ```typescript
  updatePetMutation.mutate(payload, {
    onSuccess: () => {
      Alert.alert('Sucesso!', 'Dados atualizados com sucesso.');
      callbacks?.onSuccess?.();
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível salvar na API Java.');
    },
  });
  ```

---

## 📐 6. Contratos TypeScript Principais (`src/types/`)

### Tipos de Pet (`src/types/pet.ts`)
```typescript
export type PetPorte = 'PEQUENO' | 'MEDIO' | 'GRANDE';

export interface PetRequest {
  nome: string;
  dataNasc: string; // ISO 8601 'YYYY-MM-DD'
  raca: string;
  porte: PetPorte;
  sexo: string; // 'M' | 'F'
  castrado: boolean;
  usuarioId: number;
  idade?: number;
  avatarId?: string;
}

export interface PetResponse {
  id: number;
  nome: string;
  dataNasc: string; // ISO 8601 'YYYY-MM-DD'
  idade?: number;   // Calculado dinamicamente para exibição estética
  raca: string;
  porte: PetPorte;
  sexo: string;
  castrado: boolean;
  avatarId?: string;
  peso?: string;
  veterinario?: string;
  alergias?: string;
  medicamentos?: string;
  ultimaVacina?: string;
  ultimaConsulta?: string;
}
```

### Tipos de Usuário & Blindagem da Role (`src/types/user.ts`)
```typescript
// O aplicativo mobile NUNCA deve saber da existência da role ADMIN
export type UsuarioRole = 'COMUM' | 'PREMIUM';

export interface UsuarioRequest {
  nome: string;
  email: string;
  senha: string;
  ddd: string;
  numeroTelefone: string;
  role: UsuarioRole; // Padrão: 'PREMIUM'
  endereco: {
    cep: string;
    numero: string;
  };
}

export interface UsuarioResponse {
  id: number;
  nome: string;
  email: string;
  role: UsuarioRole;
  ddd: string;
  numeroTelefone: string;
  enderecos: EnderecoResponse[];
}
```

---

## 🔒 7. Boas Práticas & Regras Obrigatórias para Agentes

1. **Tipagem Estrita (Zero `any`)**:
   - É estritamente proibido o uso de `any` ou `as any` no TypeScript. Utilize genéricos (`<K extends keyof T>`), tipos derivados de schemas Zod (`z.infer<typeof Schema>`) ou contratos formais de rotas e APIs.
2. **Role Padrão do Tutor**:
   - A role padrão é **`PREMIUM`** em todos os formulários e estados iniciais.
   - **Blindagem da Role ADMIN**: O Mobile **NUNCA** deve conter referências à role `ADMIN`. Apenas o Backend Java conhece o perfil administrador.
3. **Formulários Limpos (Sem Mocks em Produção)**:
   - Os formulários e campos de entrada de produção iniciam limpos (`useState('')`), sem mocks hardcoded como `'15'`, `'Cuidado diário da família'`, `'11'` ou `'email@petguardian.com'`. A validação é real e o botão de submissão permanece desabilitado enquanto o formulário for inválido.
4. **Arquitetura com Hooks de Domínio (SRP / DRY / SOLID)**:
   - Não acumular múltiplas queries, mutations, sanitizações e lógica de persistência nas telas (Views).
   - Extraia a lógica para um **Domain Hook** (ex: `useFamilyCare`, `useHomeData`, `usePetDetail`, `useTrainings`, `useUserProfile`) e mantenha a tela responsável puramente pela orquestração visual e renderização de componentes.
5. **Componentização Modular**:
   - Trechos visuais com responsabilidade definida devem ser componentizados em `src/components/<NomeComponente>/index.tsx`.
   - Exemplos: `PetAvatarCarousel`, `PetHeaderCard`, `PetHistoryList`, `FamilySummaryCard`, `FamilyTaskItem`.
6. **Data de Nascimento nos Pets (`dataNasc`)**:
   - O cadastro e edição operam exclusivamente com `dataNasc` (`DD/MM/AAAA` no input, normalizado para `YYYY-MM-DD` via `normalizarDataNascParaIso`). A idade é calculada dinamicamente via `calcularIdadePet()` e formatada para exibição estética via `formatarIdadePet()`.
7. **Persistência Centralizada no `StorageService`**:
   - Toda operação de armazenamento passa exclusivamente pelo `StorageService` (`src/services/storage.ts`). Tokens JWT são gravados via `expo-secure-store` e dados de cache/sessão via `AsyncStorage`.
8. **Imports no Topo**:
   - Nunca utilizar FQCN ou pacotes inline no corpo dos arquivos. Todos os imports devem constar no topo do arquivo.
