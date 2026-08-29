# 🤖 AGENT.md — Guia Arquitetural & Especificação Técnica Completa (Mobile-Application-Development)

Este documento serve como referência definitiva e fonte única da verdade para agentes de IA e desenvolvedores sobre toda a arquitetura, telas, contratos de API, gerenciamento de estado, rotas, tipagens TypeScript e fluxos do aplicativo móvel **PetGuardian** (Ecossistema Clyvo).

---

## 🏛️ 1. Visão Geral da Arquitetura

O aplicativo foi construído com foco em **alta performance**, **experiência do usuário moderna (estilo Duolingo/iFood)**, **arquitetura limpa (Clean Code, DRY, SOLID)** e **sincronização reativa de dados** com a API Java Spring Boot (`Java-Advanced`) e o microsserviço de IA em Python (`FastAPI`).

### Stack Tecnológica
- **Framework Base**: React Native 0.83.6 com **Expo SDK 57** (`expo@~57.0.18`, `@expo/metro-runtime@~57.0.14`, `expo-status-bar@~57.0.1`).
- **Linguagem**: TypeScript 5.3+ (estrito, sem `any` desnecessário, tipagem explícita de funções).
- **Gerenciamento de Estado Assíncrono & Cache**: **TanStack Query v5** (`@tanstack/react-query@^5.90.20`).
- **Cliente HTTP Centralizado**: **Axios** com interceptores para injeção automática de Bearer Token JWT e captura global de status `401 Unauthorized`.
- **Gerenciamento de Sessão Global**: React Context API (`AuthContext`) integrado com `@react-native-async-storage/async-storage`.
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
    ├── components/                → Componentes visuais atômicos e reutilizáveis (DRY / SOLID)
    │   ├── BaseModal/             → Modal acessível com backdrop, título, subtítulo, botão fechar e ScrollView
    │   ├── CustomButton/          → Botão tátil com variantes: primary, success (verde #10B981), secondary, outline, danger
    │   ├── CustomInput/           → Input com suporte a ícones esquerdo/direito, erro flutuante e foco
    │   ├── EmptyState/            → Estado vazio padronizado com ícone, título, descrição e botão de ação opcional
    │   ├── Header/                → Cabeçalho limpo com título, subtítulo e avatar com iniciais
    │   ├── LoadingSpinner/        → Indicador de carregamento com mensagem contextual
    │   ├── PetScoreBar/           → Barra de bem-estar orgânica com pílulas de status e nível
    │   ├── PremiumLockCard/       → Card informativo de bloqueio e upgrade para recursos exclusivos Premium
    │   ├── RoleBadge/             → Badge visual de perfil (⭐ Tutor Premium ou 🐾 Tutor Comum)
    │   ├── RoleSelector/          → Seletor declarativo de plano (variantes: 'cards' para cadastro e 'compact' para modais)
    │   ├── RoutineCard/           → Card de tarefa com checkbox tátil, strike-through e badge de XP
    │   ├── StatCard/              → Card atômico para métricas gamificadas (XP, Pets Família, Concluídas)
    │   └── streakCard/            → Card de ofensiva familiar com pílulas dos 7 dias da semana
    ├── constants/
    │   ├── Avatares.ts            → Mapeamento de avatares ilustrados para pets
    │   └── Keys.ts                → Chaves padronizadas do AsyncStorage
    ├── contexts/
    │   └── AuthContext.tsx        → Contexto global de autenticação, login, registro e persistência
    ├── hooks/                     → Custom Hooks com TanStack Query (Query & Mutation hooks)
    │   ├── useAiAssistant.ts      → Insights preventivos e chat conversacional com o pet
    │   ├── useClinics.ts          → Busca de clínicas com filtros de emergência/24h
    │   ├── usePets.ts             → CRUD de pets, histórico consolidado e convites de familiares
    │   ├── useRedeCuidado.ts      → Dados agregados da família (pets, co-cuidadores, tarefas)
    │   ├── useSession.ts          → Hook utilitário para consumir o AuthContext
    │   ├── useTasks.ts            → CRUD de tarefas, toggle de conclusão reativo e pontos do tutor
    │   └── useUsers.ts            → Edição de perfil do usuário (PUT) e exclusão de conta (DELETE)
    ├── lib/
    │   ├── queryClient.ts         → Instância singleton configurada do TanStack QueryClient
    │   └── queryKeys.ts           → Fábrica de Query Keys hierárquica e tipada
    ├── routes/
    │   ├── MainStack.tsx          → Alternador de fluxo (AuthStack vs AppTabs) baseado no token
    │   ├── tabs.tsx               → Barra de abas inferior com botão central elevado da IA
    │   └── types.ts               → Tipagem estrita de parâmetros de todas as rotas e stacks
    ├── screens/
    │   ├── AiAssistant/           → Chat com IA preventiva e bloqueio com PremiumLockCard para usuários comuns
    │   ├── ClinicsSearch/         → Catálogo e busca de clínicas veterinárias e pronto-socorro
    │   ├── DicasPet/              → Redirecionamento para a tela de Trilhas
    │   ├── FamilyPet/             → Gestão de pets da família, criação de tarefas e co-cuidadores com BaseModal
    │   ├── Home/                  → Dashboard do pet ativo, score, ofensiva, tarefas do dia e atalhos rápidos
    │   ├── Login/                 → Tela de login com validação Zod
    │   ├── PetDetail/             → Ficha clínica detalhada, histórico, edição de dados com BaseModal e exclusão
    │   ├── PetProfile/            → Redirecionamento para PetDetailScreen
    │   ├── Register/              → Cadastro completo com RoleSelector (default: PREMIUM) e botão verde success
    │   ├── TrainingEducation/     → Trilhas de adestramento gamificadas com bloqueio PremiumLockCard
    │   ├── UserProfile/           → Perfil do tutor com RoleBadge, StatCard, RoleSelector e BaseModal
    │   └── Welcome/               → Onboarding com botão verde 'Criar conta grátis' (variant='success')
    ├── services/                  → Camada de comunicação HTTP REST com o Backend
    │   ├── ai.ts                  → Comunicação com microsserviço Python FastAPI (/ai/insights, /ai/chat)
    │   ├── auth.ts                → Registro, login e gestão de tokens JWT
    │   ├── clinics.ts             → Serviços de busca de clínicas veterinárias
    │   ├── http.ts                → Instância Axios central com interceptors de Request/Response
    │   ├── pets.ts                → Endpoints REST do PetController no Java
    │   ├── tasks.ts               → Endpoints REST do TarefaController no Java
    │   ├── trainings.ts           → Base de trilhas e lições de treino do pet
    │   └── users.ts               → Endpoints REST do UsuarioController no Java
    ├── types/                     → Contratos TypeScript espelhando a API Java
    │   ├── ai.ts                  → Mensagens e insights de IA
    │   ├── api.ts                 → Paginação Spring (Page<T>) e erros de API
    │   ├── auth.ts                → Credenciais de Login e Registro
    │   ├── clinic.ts              → Clínicas veterinárias e filtros
    │   ├── models.ts              → Re-exportação agregada de todos os tipos
    │   ├── pet.ts                 → PetRequest, PetResponse, PetHistoryResponse, CoCuidadorResponse
    │   ├── task.ts                → TarefaRequest, TarefaResponse, TarefaConclusaoRequest
    │   ├── training.ts            → Trilhas, lições e passos de adestramento
    │   └── user.ts                → UsuarioRequest, UsuarioResponse, RedeCuidadoResponse, UsuarioRole
    └── utils/
        ├── petUtils.ts            → Utilitários de normalização de data (ISO <-> BR) e cálculo estético de idade
        └── schemas.ts             → Schemas de validação Zod para Login, Cadastro e Pets
```

---

## 🧭 3. Sistema de Navegação & Rotas

A navegação é dividida em dois universos condicionados pelo estado `isAuthenticated` do `AuthContext`:

```text
RootNavigator (src/routes/MainStack.tsx)
│
├── [SE NÃO AUTENTICADO] AuthStack (Native Stack)
│   ├── Welcome   → WelcomeScreen (src/screens/Welcome/WelcomeScreen.tsx)
│   ├── Login     → LoginScreen (src/screens/Login/LoginScreen.tsx)
│   └── Register  → RegisterScreen (src/screens/Register/RegisterScreen.tsx)
│
└── [SE AUTENTICADO] AppTabs (Bottom Tab Navigator - src/routes/tabs.tsx)
    ├── Tab 1: Home     → HomeScreen (src/screens/Home/HomeScreen.tsx)
    ├── Tab 2: Family   → FamilyStack (Native Stack)
    │   ├── FamilyMain  → FamilyPetScreen (src/screens/FamilyPet/FamilyPetScreen.tsx)
    │   └── PetDetail   → PetDetailScreen (src/screens/PetDetail/PetDetailScreen.tsx)
    ├── Tab 3: IA       → (BOTÃO CENTRAL ELEVADO) AiAssistantScreen (src/screens/AiAssistant/AiAssistantScreen.tsx)
    ├── Tab 4: Treino   → TrainingEducationScreen (src/screens/TrainingEducation/TrainingEducationScreen.tsx)
    └── Tab 5: Perfil   → ProfileStack (Native Stack)
        ├── ProfileMain → UserProfileScreen (src/screens/UserProfile/UserProfileScreen.tsx)
        ├── Clinicas    → ClinicsSearchScreen (src/screens/ClinicsSearch/ClinicsSearchScreen.tsx)
        └── PetDetail   → PetDetailScreen (src/screens/PetDetail/PetDetailScreen.tsx)
```

---

## 📱 4. Mapeamento Detalhado de Telas

### 4.1. `HomeScreen` (`src/screens/Home/HomeScreen.tsx`)
- **Propósito**: Dashboard diário do tutor focado no pet ativo.
- **Componentes Renderizados**:
  - `Header`: Saudação personalizada ao tutor e subtítulo.
  - **Seletor de Pets Horizontal**: Pílulas compactas com foto, nome e raça, permitindo alternar o pet ativo em 1 toque.
  - `PetScoreBar`: Barra de progresso orgânica (0 a 100) com nível calculado (`Math.floor(score / 25) + 1`) e pílula de status (*Excelente*, *Bem Cuidado*, *Atenção*). Ao tocar, abre a ficha `PetDetail`.
  - `StreakCard`: Ofensiva de dias consecutivos com checks esmeralda e chama âmbar 🔥.
  - **Rotina de Hoje (`tasksSection`)**: Lista de tarefas pendentes e concluídas do pet ativo usando `RoutineCard`. Permite conclusão rápida em 1 toque (`useCompleteTask`).
  - **EmptyState com Botão Verde**: Exibe botão verde `#10B981` ("Cadastrar Pet na Family") quando nenhum animal está cadastrado.
  - **Atalhos no Rodapé**: Cards compactos para acessar a **IA Assistente** e **Clínicas 24h**.

### 4.2. `FamilyPetScreen` (`src/screens/FamilyPet/FamilyPetScreen.tsx`)
- **Propósito**: Gestão colaborativa da família, cadastro de animais e delegação de rotinas.
- **Componentes Renderizados**:
  - `SummaryCard`: Resumo da família com contagem de pets, tarefas, cuidadores e XP total acumulado.
  - **Grid de Animais**: Cards de cada pet com avatar ilustrado, raça e badge de porte. Toque abre a ficha `PetDetail`.
  - **Botão Verde "+ Novo Pet"**: Abre `<BaseModal>` com campos (Nome, Raça, **Data de Nascimento** `DD/MM/AAAA`, Porte, Sexo, Castrado) com botão verde `#10B981` de confirmação (`POST /pets`).
  - **Botão "+ Nova Tarefa"**: Abre `<BaseModal>` com botão verde `#10B981` de confirmação (`POST /tarefas`).
  - **Botão "+ Convidar"**: Abre `<BaseModal>` para vincular familiares co-cuidadores por e-mail via `useInviteCaregiver` (`POST /pets/{id}/convidar-email`).

### 4.3. `PetDetailScreen` (`src/screens/PetDetail/PetDetailScreen.tsx`)
- **Propósito**: Prontuário clínico detalhado do animal e edição cadastral.
- **Componentes Renderizados**:
  - **Carrossel Superior de Pets**: Permite alternar a ficha de qualquer pet cadastrado.
  - **Card Principal do Pet**: Avatar ampliado, nome, raça e tags informativas com cálculo dinâmico da idade via `formatarIdadePet(activePet.dataNasc)` (ex: *"2 anos • Macho • Médio"*).
  - **Edição Cadastral**: Botão "Editar Ficha" abre `<BaseModal>` com o input de **Data de Nascimento** pré-formatado em `DD/MM/AAAA` através de `formatarIsoParaBr()`.
  - **Histórico Clínico & Cuidados (`GET /pets/{id}/historico`)**: Timeline consolidada de tarefas concluídas com pontos XP.

### 4.4. `AiAssistantScreen` (`src/screens/AiAssistant/AiAssistantScreen.tsx`)
- **Propósito**: Assistente virtual contextual para orientação preventiva de saúde animal.
- **Controle de Acesso RBAC**:
  - Usuários com `role === 'COMUM'` visualizam o componente `<PremiumLockCard />` detalhando os benefícios exclusivos da assinatura Premium e instrução de upgrade.
  - Usuários `PREMIUM` têm acesso irrestrito ao chat em tempo real (`useAiChat`) e insights preventivos (`useAiInsights`).

### 4.5. `TrainingEducationScreen` (`src/screens/TrainingEducation/TrainingEducationScreen.tsx`)
- **Propósito**: Trilha educacional gamificada de adestramento inspirada no Duolingo.
- **Controle de Acesso RBAC**:
  - Usuários com `role === 'COMUM'` visualizam o `<PremiumLockCard />`, protegendo as rotas e evitando erros `403 Forbidden` da API Spring Security.
  - Usuários `PREMIUM` acessam as lições interativas, nós em zigue-zague 3D e ganho de XP acelerado.

### 4.6. `ClinicsSearchScreen` (`src/screens/ClinicsSearch/ClinicsSearchScreen.tsx`)
- **Propósito**: Guia veterinário e pronto-socorro emergencial.
- **Componentes**: Busca com debounce, filtros rápidos (Aberto 24h, Pronto-Socorro), `<EmptyState />` para listas vazias e botão de chamada direta `tel:`.

### 4.7. `UserProfileScreen` (`src/screens/UserProfile/UserProfileScreen.tsx`)
- **Propósito**: Perfil do tutor, configurações de conta, preferências e suporte.
- **Componentes Renderizados**:
  - **Card do Tutor**: Exibe `<RoleBadge />`, nome, e-mail, telefone e endereço.
  - **Modal de Edição Cadastral**: Utiliza `<BaseModal>` e `<RoleSelector variant="compact" />` para troca de plano e dados.
  - **Métricas Gamificadas**: 3 `<StatCard />` com Pontos XP, Pets da Família e Tarefas Concluídas.
  - **Modais de Suporte**: FAQ e Termos de Uso padronizados com `<BaseModal />`.

### 4.8. `WelcomeScreen`, `LoginScreen` & `RegisterScreen`
- **`WelcomeScreen`**: Botão de entrada **"Criar conta grátis →"** com `variant="success"` (verde `#10B981`).
- **`LoginScreen`**: Validação com `LoginSchema` (Zod), inputs com toggle de visibilidade e integração com `useSession`.
- **`RegisterScreen`**: Seleção de plano visual com `<RoleSelector variant="cards" />` (default: `PREMIUM`), validação Zod e botão **"Concluir Cadastro"** verde (`variant="success"`).

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
  },
  tasks: {
    all: ['tasks'] as const,
    list: (page = 0, size = 50) => ['tasks', 'list', { page, size }] as const,
    byUser: (userId: number) => ['tasks', 'byUser', userId] as const,
    detail: (id: number) => ['tasks', 'detail', id] as const,
    userPoints: (userId: number) => ['tasks', 'userPoints', userId] as const,
  },
  clinics: {
    all: ['clinics'] as const,
    search: (termo?: string, apenas24h?: boolean) => ['clinics', 'search', { termo, apenas24h }] as const,
    detail: (id: number) => ['clinics', 'detail', id] as const,
  },
  training: {
    tracks: ['training', 'tracks'] as const,
    trackDetail: (id: string) => ['training', 'tracks', id] as const,
  },
  ai: {
    insights: (petId: number) => ['ai', 'insights', petId] as const,
    messages: (petId: number) => ['ai', 'messages', petId] as const,
  },
};
```

---

## 📐 6. Contratos e Tipagens TypeScript (`src/types/`)

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

### Tipos de Usuário & Role (`src/types/user.ts`)
```typescript
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

## 🎨 7. Design System & Padrões Visuais

| Elemento | Token / Valor | Descrição |
| :--- | :--- | :--- |
| **Background Principal** | `#F8FAFC` (Slate 50) | Fundo suave, limpo e orgânico |
| **Superfície de Cards** | `#FFFFFF` | Branco puro com borda fina `rgba(226, 232, 240, 0.8)` |
| **Cor Primária / Base** | `#0F172A` (Slate 900) & `#2563EB` (Royal Blue) | Tipografia forte e elementos de navegação |
| **Cor de Cadastro & Criação**| `#10B981` (Emerald Green) | Botões de ação positiva: "Concluir Cadastro", "Criar conta", "Cadastrar Pet", "Criar Tarefa" |
| **Plano Premium (Gold)** | `#D97706` (Amber 600) & `#FEF3C7` (Amber 100) | Badges de Coroa ⭐, destaques e cards de upgrade |
| **Plano Comum (Blue)** | `#2563EB` (Blue 600) & `#EFF6FF` (Blue 50) | Badges de Pata 🐾 |
| **Cor de Alerta / Exclusão**| `#EF4444` (Red 500) | Pronto-socorro, exclusão de registros e logout |
| **Arredondamento Padrão** | `borderRadius: 18` a `24px` | Curvaturas orgânicas e modernas |

---

## 🔒 8. Boas Práticas & Regras Obrigatórias para Agentes

1. **Cadastro e Edição de Pets (Data de Nascimento)**:
   - Os formulários utilizam **exclusivamente `dataNasc`** (`DD/MM/AAAA` no input do usuário, convertido para `YYYY-MM-DD` pela função `normalizarDataNascParaIso`).
   - A **idade** do animal nunca é inputada manualmente; ela é calculada dinamicamente via `calcularIdadePet()` e formatada via `formatarIdadePet()` para exibição estética nos cards e badges.
2. **Role Padrão do Usuário**:
   - A role padrão é **`PREMIUM`** em todos os formulários (`RegisterScreen`, schemas Zod, entidade backend).
3. **Componentização & Princípios SOLID / DRY**:
   - **`BaseModal`**: Usar para todos os novos modais da aplicação. Tipagem de altura deve usar `DimensionValue` de `react-native`.
   - **`CustomButton`**: Usar `variant="success"` para ações de cadastro e criação de novos registros.
   - **`RoleBadge` & `RoleSelector`**: Centralizar toda a exibição e seleção de papéis (`COMUM` / `PREMIUM`) nesses componentes.
   - **`PremiumLockCard`**: Usar como guarda visual em telas/recursos restritos para contas comuns.
   - **`StatCard`**: Usar para blocos numéricos e métricas de gamificação.
4. **Sem Null-Checks Defensivos Desnecessários**:
   - Não utilizar encadeamentos defensivos redundantes onde os valores são garantidos por valores padrão ou validação Zod.
5. **Nenhum uso de `Locale.ROOT`**:
   - Utilizar sempre `.toUpperCase()` ou `.toLowerCase()` padrão do JavaScript/TypeScript.
