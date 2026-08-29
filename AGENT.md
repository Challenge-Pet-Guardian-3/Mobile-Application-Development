# 🤖 AGENT.md — Guia Arquitetural & Especificação Técnica Completa (Mobile-Application-Development)

Este documento serve como referência definitiva e fonte única da verdade para agentes de IA e desenvolvedores sobre toda a arquitetura, telas, contratos de API, gerenciamento de estado, rotas, tipagens TypeScript e fluxos do aplicativo móvel **PetGuardian** (Ecossistema Clyvo).

---

## 🏛️ 1. Visão Geral da Arquitetura

O aplicativo foi construído com foco em **alta performance**, **experiência do usuário moderna (estilo Duolingo/iFood)** e **sincronização reativa de dados** com a API Java Spring Boot (`Java-Advanced`) e o microsserviço de IA em Python (`FastAPI`).

### Stack Tecnológica
- **Framework Base**: React Native 0.83.6 com **Expo SDK 57** (`expo@~57.0.17`, `@expo/metro-runtime@~57.0.14`, `expo-status-bar@~57.0.1`).
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
    ├── components/                → Componentes visuais atômicos e reutilizáveis
    │   ├── CustomButton/          → Botão tátil com estados primary, secondary, outline, danger, loading
    │   ├── CustomInput/           → Input com suporte a ícones esquerdo/direito, erro flutuante e foco
    │   ├── Header/                → Cabeçalho limpo com saudação ao tutor e avatar com iniciais
    │   ├── LoadingSpinner/        → Indicador de carregamento com mensagem contextual
    │   ├── PetScoreBar/           → Barra de bem-estar orgânica com pílulas de status e nível
    │   ├── RoutineCard/           → Card de tarefa com checkbox tátil, strike-through e badge de XP
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
    │   ├── AiAssistant/           → Chat com IA preventiva e sugestões rápidas fixas
    │   ├── ClinicsSearch/         → Catálogo e busca de clínicas veterinárias e pronto-socorro
    │   ├── DicasPet/              → Redirecionamento para a tela de Trilhas
    │   ├── FamilyPet/             → Gestão de pets da família, criação de tarefas e co-cuidadores
    │   ├── Home/                  → Dashboard do pet ativo, score, ofensiva, tarefas do dia e atalhos
    │   ├── Login/                 → Tela de login com validação Zod
    │   ├── PetDetail/             → Ficha clínica detalhada, histórico de cuidados, edição e exclusão
    │   ├── PetProfile/            → Redirecionamento para PetDetailScreen
    │   ├── Register/              → Cadastro de usuário completo com endereço e validação Zod
    │   ├── TrainingEducation/     → Trilhas de adestramento gamificadas no estilo Duolingo
    │   ├── UserProfile/           → Perfil do tutor, estatísticas, switches de preferência e FAQ
    │   └── Welcome/               → Onboarding de boas-vindas ao ecossistema Clyvo
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
    │   └── user.ts                → UsuarioRequest, UsuarioResponse, RedeCuidadoResponse
    └── utils/
        └── schemas.ts             → Schemas de validação Zod para Login e Cadastro
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

### Tipagem das Rotas (`src/routes/types.ts`)
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

export type AppTabParamList = {
  Home: undefined;
  Family: undefined;
  IA: { petId?: number } | undefined;
  Treino: undefined;
  Perfil: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Clinicas: undefined;
  PetDetail: { petId?: number } | undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  PetDetail: { petId?: number } | undefined;
  Clinicas: undefined;
  IA: { petId?: number } | undefined;
};
```

### Propriedades Especiais da Barra de Abas (`src/routes/tabs.tsx`)
- `tabBarHideOnKeyboard: true`: Oculta automaticamente a task bar quando o teclado for aberto em qualquer input.
- `tabBarStyle`: Fundo ardósia escuro `#0F172A`, cantos arredondados (`borderRadius: 24`), flutuante (`bottom: 14/24px`, `marginHorizontal: 16px`).
- **Botão Central da IA**: Círculo de `58x58px` elevado com ícone de robô, transicionando para `#2563EB` com glow azul quando ativo.

---

## 📱 4. Mapeamento Detalhado de Telas

### 4.1. `HomeScreen` (`src/screens/Home/HomeScreen.tsx`)
- **Propósito**: Dashboard diário do tutor focado no pet ativo.
- **Componentes Renderizados**:
  - `Header`: Saudação personalizada ao tutor e avatar com iniciais.
  - **Seletor de Pets Horizontal**: Pílulas compactas com foto, nome e raça, permitindo alternar o pet ativo em 1 toque.
  - `PetScoreBar`: Barra de progresso orgânica (0 a 100) com nível calculado (`Math.floor(score / 25) + 1`) e pílula de status (*Excelente*, *Bem Cuidado*, *Atenção*). Ao tocar, abre a ficha `PetDetail`.
  - `StreakCard`: Ofensiva de dias consecutivos com checks esmeralda e chama âmbar 🔥.
  - **Rotina de Hoje (`tasksSection`)**: Lista de tarefas pendentes e concluídas do pet ativo usando `RoutineCard`. Permite conclusão rápida em 1 toque (`useCompleteTask`).
  - **Atalhos no Rodapé**: Cards compactos para acessar a **IA Assistente** e **Clínicas 24h**.

### 4.2. `FamilyPetScreen` (`src/screens/FamilyPet/FamilyPetScreen.tsx`)
- **Propósito**: Gestão colaborativa da família, cadastro de animais e delegação de rotinas.
- **Componentes Renderizados**:
  - `SummaryCard`: Resumo da família com contagem de pets, tarefas, cuidadores e XP total acumulado.
  - **Grid de Animais**: Cards de cada pet com avatar ilustrado, raça e badge de porte. Toque abre a ficha `PetDetail`.
  - **Botão "+ Adicionar Pet"**: Abre modal com campos (Nome, Raça, Idade, Porte `PEQUENO|MEDIO|GRANDE`, Sexo `M|F`, Castrado `Sim|Não`) que executa `useCreatePet` (`POST /pets`).
  - **Seção Rotina & Tarefas**: Lista das tarefas da família com botão "+ Nova Tarefa" que abre modal (Seletor de pet, Título, Descrição, Pontos XP) que executa `useCreateTask` (`POST /tarefas`).
  - **Seção Co-Cuidadores**: Lista de responsáveis vinculados e botão "+ Convidar" para associar familiares por e-mail via `useInviteCaregiver` (`POST /pets/{id}/convidar-email`).

### 4.3. `PetDetailScreen` (`src/screens/PetDetail/PetDetailScreen.tsx`)
- **Propósito**: Prontuário clínico detalhado do animal e edição cadastral.
- **Componentes Renderizados**:
  - **Carrossel Superior de Pets**: Permite alternar a ficha de qualquer pet cadastrado.
  - **Card Principal do Pet**: Avatar ampliado com borda azul, nome, raça e badges (Porte, Idade, Sexo, Castrado/Não Castrado).
  - **Ações**: Botões "Editar Ficha" (abre modal de edição com `useUpdatePet` `PUT /pets/{id}`) e "Excluir" (`useDeletePet` `DELETE /pets/{id}`).
  - **Histórico Clínico & Cuidados (`GET /pets/{id}/historico`)**: Timeline consolidada de todas as tarefas e cuidados concluídos pelo animal com data, descrição e pontos XP ganhos.

### 4.4. `AiAssistantScreen` (`src/screens/AiAssistant/AiAssistantScreen.tsx`)
- **Propósito**: Assistente virtual contextual para orientação preventiva de saúde animal.
- **Componentes Renderizados**:
  - **Barra de Contexto do Pet**: Seletor horizontal para definir qual animal servirá de contexto para a IA.
  - **Recomendações Preventivas (`useAiInsights`)**: Cards com orientações geradas por IA sobre nutrição, rotina e vacinas.
  - **Histórico de Conversa (`useAiChat`)**: Balões de mensagens estilo WhatsApp/ChatGPT com avatar da IA, texto formatado e timestamp. Auto-scroll ao receber resposta.
  - **Painel Fixo Inferior (`fixedBottomContainer`)**:
    - **Sugestões Rápidas de Perguntas**: Chips com faíscas ✨ (ex: *"🦴 Quantidade de ração por porte?"*, *"💉 Vacinas obrigatórias?"*) que enviam o prompt imediatamente ao tocar.
    - **Cápsula de Input**: Campo de texto com botão circular `↑`. Ajusta o padding inferior dinamicamente via `Keyboard.addListener` para nunca sobrepor o teclado ou a bottom tab bar.

### 4.5. `TrainingEducationScreen` (`src/screens/TrainingEducation/TrainingEducationScreen.tsx`)
- **Propósito**: Trilha educacional gamificada de adestramento inspirada no Duolingo.
- **Componentes Renderizados**:
  - **Top Bar Gamificada**: Indicadores de Ofensiva (Fogo 🔥), Cristais de XP (Gems 💎) e Nível do Pet (Coroa 👑).
  - **Banner de Progresso**: Barra percentual de conclusão da trilha ativa.
  - **Caminho em Zigue-Zague**: Nós interativos em 3D posicionados dinamicamente (`marginLeft` oscilante) com ícones de pata, mão e estrela.
  - **Modal da Lição**: Apresenta instruções práticas passo a passo (passos 1, 2, 3, 4), duração estimada e botão "Concluir Lição (+XP)" que credita pontuação ao pet.

### 4.6. `ClinicsSearchScreen` (`src/screens/ClinicsSearch/ClinicsSearchScreen.tsx`)
- **Propósito**: Guia veterinário e pronto-socorro emergencial.
- **Componentes Renderizados**:
  - **Barra de Busca**: Filtro por nome, bairro ou especialidade.
  - **Chips de Filtro Rápido**: *Aberto 24 Horas* (ícone de relógio) e *Pronto-Socorro* (ícone de ambulância).
  - **Cards de Clínicas**: Endereço completo, distância em km, nota com estrelas, badge de Destaque Clyvo, lista de especialidades e botão verde de chamada telefônica direta via `Linking.openURL('tel:...')`.

### 4.7. `UserProfileScreen` (`src/screens/UserProfile/UserProfileScreen.tsx`)
- **Propósito**: Perfil do tutor, configurações de conta, preferências e suporte.
- **Componentes Renderizados**:
  - **Card do Tutor**: Avatar com iniciais, Nome, E-mail, Telefone, Endereço e botão **"Editar Dados Cadastrais"** (executa `useUpdateUser` `PUT /usuarios/{id}`).
  - **Estatísticas Gamificadas**: 3 cards simétricos com Pontos XP, Pets da Família e Tarefas Concluídas.
  - **Resumo da Rede Familiar**: Contagem de animais e cuidadores com atalho para a Family.
  - **Switches de Preferência**: Toggles para Notificações de Rotina e Alertas de Saúde Preventiva.
  - **Recursos**: Atalhos para Clínicas 24h e IA Assistente.
  - **Conta & Suporte**: FAQ com perguntas frequentes, Termos de Uso, Logout Seguro e **Excluir Minha Conta** (`DELETE /usuarios/{id}`).

### 4.8. `WelcomeScreen`, `LoginScreen` & `RegisterScreen`
- **`WelcomeScreen`**: Apresentação visual da marca com chips de categorias e botões "Criar conta grátis" e "Entrar".
- **`LoginScreen`**: Validação com `LoginSchema` (Zod), inputs de e-mail e senha com toggle de visibilidade e feedback de erro.
- **`RegisterScreen`**: Validação com `RegisterSchema` (Zod), cadastro de Nome, E-mail, DDD, Telefone, CEP, Número e Senha.

---

## ⚡ 5. Gerenciamento de Estado & TanStack Query

### 5.1. Instância do QueryClient (`src/lib/queryClient.ts`)
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutos de frescor dos dados
      gcTime: 1000 * 60 * 15,   // 15 minutos em memória cache (garbage collection)
      retry: 2,                 // 2 tentativas em caso de erro de rede
      refetchOnWindowFocus: false,
    },
  },
});
```

### 5.2. Fábrica de Query Keys (`src/lib/queryKeys.ts`)
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

### 5.3. Mapeamento dos Custom Hooks

| Hook | Tipo | QueryKey / Invalidações | Serviço Chamado |
| :--- | :--- | :--- | :--- |
| `usePets(page, size)` | Query | `queryKeys.pets.list(page, size)` | `PetService.getPets()` |
| `usePet(id)` | Query | `queryKeys.pets.detail(id)` | `PetService.getPetById()` |
| `usePetHistory(id)` | Query | `queryKeys.pets.history(id)` | `PetService.getPetHistory()` |
| `useCreatePet()` | Mutation | Invalida `pets.all`, `users.all` | `PetService.createPet()` |
| `useUpdatePet()` | Mutation | Invalida `pets.detail(id)`, `pets.all`, `users.all` | `PetService.updatePet()` |
| `useDeletePet()` | Mutation | Invalida `pets.all`, `users.all`, `tasks.all` | `PetService.deletePet()` |
| `useInviteCaregiver()` | Mutation | Invalida `users.all`, `pets.all` | `PetService.convidarPorEmail()` |
| `useTasks(page, size)` | Query | `queryKeys.tasks.list(page, size)` | `TaskService.getTarefas()` |
| `useUserTasks(userId)` | Query | `queryKeys.tasks.byUser(userId)` | `TaskService.getTarefasPorUsuario()` |
| `useUserPoints(userId)` | Query | `queryKeys.tasks.userPoints(userId)` | `TaskService.getPontosUsuario()` |
| `useCreateTask()` | Mutation | Invalida `tasks.all`, `users.all` | `TaskService.createTarefa()` |
| `useUpdateTask()` | Mutation | Invalida `tasks.detail(id)`, `tasks.all` | `TaskService.updateTarefa()` |
| `useCompleteTask()` | Mutation | Invalida `tasks.all`, `users.all`, `pets.all` | `TaskService.concluirTarefa()` |
| `useDeleteTask()` | Mutation | Invalida `tasks.all`, `users.all` | `TaskService.deleteTarefa()` |
| `useRedeCuidado(userId)` | Query | `queryKeys.users.redeCuidado(userId)` | `UserService.getRedeCuidado()` |
| `useUpdateUser()` | Mutation | Invalida `usuario(id)`, `redeCuidado(id)` | `UserService.updateUsuario()` |
| `useDeleteUser()` | Mutation | Desloga e limpa o storage | `UserService.deleteUsuario()` |
| `useClinics(filtro)` | Query | `queryKeys.clinics.search(...)` | `ClinicService.getClinicas()` |
| `useAiInsights(pet)` | Query | `queryKeys.ai.insights(pet.id)` | `AiService.getInsightsDoPet()` |
| `useAiChat(pet)` | State/Async | Atualiza mensagens localmente | `AiService.enviarMensagem()` |

---

## 🌐 6. Mapeamento de Endpoints do Backend

### 6.1. Endpoints Java Spring Boot (`Java-Advanced` - Porta 8080)

#### Autenticação & Usuários (`UsuarioController` / `AuthController`)
- `POST /auth/register` (ou `POST /usuarios`): Cadastro de novo usuário.
  - **Body**: `{ nome, email, senha, ddd, numeroTelefone, endereco: { cep, numero } }`
  - **Retorno**: `UsuarioResponse`
- `POST /auth/login` (ou `GET /usuarios/by-email?email=...`): Autenticação do usuário.
  - **Retorno**: `{ user: UsuarioResponse, token: string }`
- `GET /usuarios/{id}`: Detalhes do usuário por ID.
- `GET /usuarios/{id}/rede-cuidado`: Resumo consolidado da família (pets, co-cuidadores, tarefas pendentes/concluídas, pontos totais).
- `PUT /usuarios/{id}`: Atualização cadastral do usuário e endereço.
- `DELETE /usuarios/{id}`: Exclusão definitiva da conta.

#### Pets (`PetController`)
- `GET /pets?page=0&size=20&sort=nome,asc`: Listagem paginada de todos os pets.
- `GET /pets/by-nome?nome=...`: Busca de pets por nome.
- `GET /pets/{id}`: Detalhes vitais de um pet específico.
- `GET /pets/{id}/historico`: Histórico clínico consolidado de tarefas concluídas do pet.
- `POST /pets`: Cadastro de novo pet vinculado ao tutor autenticado.
  - **Body**: `{ nome, raca, idade, porte, sexo, castrado, usuarioId }`
- `PUT /pets/{id}`: Atualização da ficha cadastral do animal.
- `DELETE /pets/{id}`: Remoção do pet do sistema.
- `POST /pets/{petId}/convidar-email?responsavelPrincipalId=...&email=...`: Vincula um novo familiar co-cuidador ao pet por e-mail.

#### Tarefas & Rotinas (`TarefaController`)
- `GET /tarefas?page=0&size=50&sort=prazo,asc`: Listagem geral de tarefas.
- `GET /tarefas/by-usuario?usuarioId=...`: Listagem de tarefas atribuídas a um usuário.
- `GET /tarefas/by-usuario/pontos?usuarioId=...`: Total numérico de pontos XP acumulados pelo usuário.
- `POST /tarefas`: Criação de nova tarefa de rotina (passeio, remédio, alimentação).
  - **Body**: `{ titulo, descricao, pontosTarefa, prazo, usuarioId, petId, status: "PENDENTE" }`
- `PUT /tarefas/{id}`: Atualização dos dados de uma tarefa.
- `PATCH /tarefas/{id}/concluir`: Conclusão de uma tarefa.
  - **Body**: `{ concluinteId: number }`
  - **Efeito**: Transiciona status para `CONCLUIDO`, registra data de conclusão e credita pontos ao tutor e pet.
- `DELETE /tarefas/{id}`: Exclusão de uma tarefa.

### 6.2. Endpoints Microsserviço Python FastAPI (`Python AI` - Porta 8000)
- `POST /ai/insights`: Gera recomendações preventivas baseadas na raça, idade e histórico do pet ativo.
  - **Body**: `{ petId, nome, raca, idade, porte, castrado }`
  - **Retorno**: `AiPetInsight[]` (`[{ titulo, descricao, categoria, urgencia }]`)
- `POST /ai/chat`: Processa perguntas do tutor e retorna orientações inteligentes via RAG/LLM.
  - **Body**: `{ prompt, petContext: { nome, raca, idade, porte } }`
  - **Retorno**: `AiMessage` (`{ id, sender: 'assistant', text, timestamp }`)

---

## 📐 7. Contratos e Tipagens TypeScript (`src/types/`)

### Tipos de Pet (`src/types/pet.ts`)
```typescript
export type PetPorte = 'PEQUENO' | 'MEDIO' | 'GRANDE';

export interface PetRequest {
  nome: string;
  idade: number;
  raca: string;
  porte: PetPorte;
  sexo: string; // 'M' | 'F'
  castrado: boolean;
  usuarioId: number;
}

export interface PetResponse {
  id: number;
  nome: string;
  idade: number;
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

export interface PetHistoryResponse {
  petId: number;
  nomePet: string;
  tarefasConcluidas: TarefaResponse[];
}
```

### Tipos de Tarefa (`src/types/task.ts`)
```typescript
export type EnumStatus = 'PENDENTE' | 'CONCLUIDO' | 'EXPIRADO';

export interface TarefaRequest {
  titulo: string;
  pontosTarefa: number;
  descricao: string;
  prazo: string; // ISO 8601 LocalDateTime
  usuarioId?: number | null;
  petId: number;
  status: EnumStatus;
}

export interface TarefaConclusaoRequest {
  concluinteId: number;
}

export interface TarefaResponse {
  id: number;
  titulo: string;
  pontosTarefa: number;
  descricao: string;
  criacao: string;
  prazo: string;
  conclusao?: string | null;
  status: EnumStatus;
  usuarioId?: number | null;
  petId: number;
}
```

### Tipos de Usuário & Rede de Cuidado (`src/types/user.ts`)
```typescript
export interface EnderecoRequest {
  cep: string;
  numero: string;
}

export interface EnderecoResponse {
  id: number;
  cep: string;
  numero: string;
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface UsuarioRequest {
  nome: string;
  email: string;
  senha: string;
  ddd: string;
  numeroTelefone: string;
  endereco: EnderecoRequest;
}

export interface UsuarioResponse {
  id: number;
  nome: string;
  email: string;
  ddd: string;
  numeroTelefone: string;
  enderecos: EnderecoResponse[];
}

export interface RedeCuidadoResponse {
  usuarioId: number;
  nomeUsuario: string;
  pets: { id: number; nome: string; raca: string; responsavelPrincipal: boolean; tarefaIds: number[] }[];
  coCuidadores: { id: number; nome: string; email: string; responsavelPrincipal: boolean; petIds: number[] }[];
  totalTarefasPendentes: number;
  totalTarefasConcluidas: number;
  pontosAcumulados: number;
}
```

---

## 🎨 8. Design System & Padrões Visuais

| Elemento | Token / Valor | Descrição |
| :--- | :--- | :--- |
| **Background Principal** | `#F8FAFC` (Slate 50) | Fundo suave, limpo e orgânico |
| **Superfície de Cards** | `#FFFFFF` | Branco puro com borda ultra-fina `rgba(226, 232, 240, 0.8)` |
| **Cor Primária / Ação** | `#0F172A` (Slate 900) & `#2563EB` (Royal Blue) | Sofisticação e alta legibilidade |
| **Cor de Sucesso / Saúde** | `#10B981` (Emerald) | Conclusão de tarefas, score excelente e botões de chamada |
| **Cor de Alerta / Emergência**| `#EF4444` (Red 500) | Pronto-socorro, exclusão de registros e logout |
| **Pílulas Suaves (Pastéis)** | `#EFF6FF` (Azul), `#ECFDF5` (Verde), `#FFFBEB` (Âmbar) | Badges de status, XP e filtros |
| **Arredondamento Padrão** | `borderRadius: 20` a `24px` | Curvaturas orgânicas e modernas |
| **Sombras Flutuantes** | `elevation: 2-4`, `shadowOpacity: 0.03-0.08`, `shadowRadius: 8-12px` | Sensação tátil e refinada |

---

## 🚀 9. Guia de Inicialização & Comandos Úteis

```bash
# Navegar para o diretório do Mobile
cd Mobile-Application-Development

# Instalar dependências sincronizadas com Expo SDK 57
npm install

# Iniciar servidor de desenvolvimento Metro
npx expo start

```

---

## 🔒 10. Boas Práticas & Regras Obrigatórias para Agentes

1. **Padrão de Validação Zod**:
   - **Validação de E-mail:** Utilizar sempre **`z.email('...')`** no nível raiz (evitando a sintaxe `z.string().email()`).
   - **Números e Coerção:** Utilizar `z.coerce.number()` para campos numéricos provenientes de inputs de texto (como idade e pontos).
   - **Enums e Tipos Estritos:** Utilizar `z.enum(['PEQUENO', 'MEDIO', 'GRANDE'])` e `z.enum(['PENDENTE', 'CONCLUIDO', 'EXPIRADO'])`.
2. **Componentes React Native (React 18/19 & TypeScript 5.3+)**:
   - **Sem `React.FC`:** Declarar sempre componentes como funções puras com props tipadas: `export function NomeComponente({ prop1, prop2 }: Props)`.
   - **Safe Area:** Usar `<SafeAreaProvider>` de `react-native-safe-area-context` no root `App.tsx` (nunca importar `SafeAreaView` depreciada do core do `react-native`).
   - **Status Bar:** Usar `StatusBar` de `expo-status-bar` (`<StatusBar style="auto" />` ou `<StatusBar style="dark" />`).
3. **Gerenciamento de Estado & TanStack Query v5**:
   - **Sem Mocks Locais:** Nunca reintroduzir mocks locais de dados (`MOCK_USER`, arrays fixos em storage). Todas as operações de pets, tarefas e usuários devem passar pelos hooks do TanStack Query (`src/hooks/`) e serviços Axios (`src/services/`).
   - **Query Keys Centralizadas:** Todas as chaves de query e invalidações de mutação devem utilizar `queryKeys` de `src/lib/queryKeys.ts`.
   - **Sintaxe v5:** Utilizar `gcTime` (nunca `cacheTime`) e objeto de opções `{ mutationFn: ... }` no `useMutation`.
4. **Navegação & Interface Tátil**:
   - **Hierarquia de Rotas:** O botão central elevado da Tab Bar pertence exclusivamente à **IA Assistente** (`AiAssistantScreen`), enquanto `PetDetailScreen` é uma subtela do `FamilyStack` e `ProfileStack`.
   - **Gestão do Teclado:** A Tab Bar deve conter `tabBarHideOnKeyboard: true` e telas com chat ou inputs devem utilizar `Keyboard.addListener` para compensação dinâmica de padding, evitando quebras de layout.

