# 📋 Backlog de Refatoração Mobile (3ª Sprint) - Azure Boards
> **Projeto:** Clyvo Vet / PetGuardian  
> **Disciplina:** Mobile Application Development (FIAP)  
> **Epic Principal:** `[EPIC] Epic Mobile Pet Guardian - Arquitetura Pet-Centric (Sprint 3)`  
> **Start Date:** `2026-08-27`  
> **Target Date:** `2026-09-01`  
> **Diretrizes da Mentoria Clyvo:** App focado no Pet, pontuação no Pet, rotina familiar, página dedicada com histórico clínico/vacinal, página de Treinamento/Educação, Assistente de IA e busca de Clínicas 24h.

---

## 🎯 1. Matriz de Requisitos & Critérios Avaliativos (Páginas 31 a 42)

| Critério Avaliativo | Pontos | Requisitos Obrigatórios da Banca & Mentoria Clyvo |
| :--- | :---: | :--- |
| **Navegação entre Telas** | **5 pts** | • Mínimo de **6 telas distintas** e funcionais (sem telas vazias/duplicadas).<br>• Uso exclusivo de biblioteca oficial (`@react-navigation/native-stack` e `@react-navigation/bottom-tabs`), **proibido** controle manual com `useState`/`if`.<br>• Rotas explicitamente declaradas e tipadas em TypeScript. |
| **Arquitetura & Clean Code** | **20 pts** | • Separação estrita de responsabilidades (UI / Lógica / Camada de API).<br>• **Proibido** chamadas HTTP e regras de negócio direto nas telas.<br>• Hooks customizados isolando TanStack Query.<br>• Código limpo, tipado em TypeScript sem `any` e sem duplicações (DRY). |
| **Integração com API Backend HTTP (Java)** | **35 pts** | • Requisições obrigatórias com **TanStack Query** (`useQuery`, `useMutation`).<br>• **100% dados reais da API Spring Boot Java** (proibido mocks, dados fixos ou AsyncStorage como banco).<br>• **2 funcionalidades com CRUD completo (Create, Read, Update, Delete)** na interface.<br>• Estados de **Loading** e **atualização reativa imediata** (cache invalidation). |
| **Sistema de Autenticação JWT** | **20 pts** | • Autenticação real com a API Java (`/auth/login` e `/auth/register`).<br>• Fluxo completo (Login, Cadastro, Logout).<br>• **Persistência de sessão** com Token JWT no `AsyncStorage`.<br>• **Rotas protegidas** (usuário deslogado não acessa telas internas). |
| **Documentação & Apresentação** | **20 pts** | • **README.md** com visão geral, arquitetura, stack e instruções de build/execução.<br>• **Vídeo de até 5 minutos (YouTube)** narrado demonstrando uso real, navegação, login/logout e CRUDs. |

### ⚠️ Penalidades Críticas da Avaliação
* **Aplicativo não funcional / Erro de build / Crash:** **-100 pontos (Nota Zero)**.
* **Vídeo com Figma / Protótipo ou código diferente da entrega:** **-100 pontos (Nota Zero)**.
* **Integrar com mocks / simulação com `useState` / sem PUT/DELETE:** **-20 pontos**.
* **Autenticação fake / usuário fixo no código:** **-20 pontos**.
* **Lógica concentrada nas telas (código espaguete):** **-30 pontos**.
* **Histórico de commits artificial (poucos commits gigantes):** **-50 pontos**.

---

## 🌳 2. Estrutura Hierárquica no Azure Boards

```text
👑 Epic: Epic Mobile Pet Guardian - Arquitetura Pet-Centric (Sprint 3)
│
├── 🏆 Feature 1: Mobile Refatoração e Arquitetura UI Pet-Centric
│   ├── 📄 [PBI-01] Reestruturação da Navegação e Validação das Novas Telas Pet-Centric (5 pts)
│   └── 📄 [PBI-02] Refatoração de Componentes Reutilizáveis, Cards de Rotina e Clean Code (5 pts)
│
├── 🏆 Feature 2: Infraestrutura de Rede e Autenticação (Java Backend & TanStack)
│   ├── 📄 [PBI-03] Configuração da Camada de API (Axios + Spring Boot) e TanStack Query Provider (5 pts)
│   └── 📄 [PBI-04] Sistema de Autenticação Real com JWT, Sessão Persistente e Rotas Protegidas (8 pts)
│
├── 🏆 Feature 3: Integração de CRUDs Pet-Centric com Backend Java
│   ├── 📄 [PBI-05] CRUD Completo 1: Gestão de Pets, Cadastro em FamilyPet e Histórico em PetDetail (8 pts)
│   └── 📄 [PBI-06] CRUD Completo 2: Gestão de Rotina Diária, Treinamento & Score do Pet (8 pts)
│
└── 🏆 Feature 4: Documentação Técnica e Entrega da Sprint
    └── 📄 [PBI-07] Documentação Técnica (README.md) e Preparação do Vídeo de Apresentação (3 pts)
```

---

## 📊 3. Tabela Resumo do Backlog

| Feature | ID do PBI | Título do PBI | Story Points | Prioridade |
| :--- | :--- | :--- | :---: | :---: |
| **Feature 1: Arquitetura UI Pet-Centric** | **PBI-01** | Reestruturação da Navegação e Validação das Novas Telas | 5 | 1 - Crítica |
| | **PBI-02** | Componentização, Cards de Rotina & Clean Code | 5 | 1 - Crítica |
| **Feature 2: Infra de Rede & Auth JWT** | **PBI-03** | Configuração da API Java e TanStack Query Provider | 5 | 1 - Crítica |
| | **PBI-04** | Autenticação JWT Real, Sessão Persistente & Rotas Protegidas | 8 | 1 - Crítica |
| **Feature 3: CRUDs Pet-Centric** | **PBI-05** | CRUD 1: Gestão de Pets, Cadastro em FamilyPet e Histórico Clínico | 8 | 1 - Crítica |
| | **PBI-06** | CRUD 2: Gestão de Rotina Diária, Treinamento & Score do Pet | 8 | 1 - Crítica |
| **Feature 4: Documentação e Entrega** | **PBI-07** | README.md Técnico e Roteiro de Vídeo Demonstrativo | 3 | 2 - Alta |
| **TOTAL GERAL** | **4 Features** | **7 PBIs / 25 Tarefas Técnicas** | **42 pts** | — |

---

# 🚀 4. Detalhamento por Feature e PBIs (Copiar e Colar no Azure Boards)

---

## 🏆 FEATURE 1: Mobile Refatoração e Arquitetura UI Pet-Centric
* **Work Item Type:** `Feature`
* **Parent Epic:** `Epic Mobile Pet Guardian - Arquitetura Pet-Centric (Sprint 3)`
* **Tags:** `Mobile`
* **Start Date:** `2026-08-27`
* **Target Date:** `2026-08-28`
* **Descrição:** Reestruturação da árvore de navegação com React Navigation aplicando a arquitetura Pet-Centric (Home com score e rotina, PetDetail com histórico clínico/vacinas, FamilyPet com cadastro, Training/Education, ClinicsSearch 24h e AiAssistant).

---

### 🔹 [PBI-01] Reestruturação da Navegação e Validação das Novas Telas Pet-Centric
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `Mobile Refatoração e Arquitetura UI Pet-Centric`
* **Priority:** `1 - Critical`
* **Effort / Story Points:** `5`
* **Tags:** `Navigation`, `Routes`, `UI`, `PetCentric`

#### Descrição (User Story)
> **Como** usuário do aplicativo PetGuardian,  
> **Eu quero** navegar de forma fluida entre as telas da plataforma estruturadas com foco no animal,  
> **Para que** a Home apresente o resumo do pet ativo e sua rotina, o cadastro seja feito na FamilyPet, o histórico clínico fique na tela dedicada do Pet e eu possa acessar Treinamentos, Clínicas 24h e a Assistente de IA.

#### Critérios de Aceite (Acceptance Criteria)
- [ ] O aplicativo deve conter a seguinte estrutura de telas funcionais:
  1. `WelcomeScreen`: Boas-vindas e introdução ao aplicativo.
  2. `LoginScreen` & `RegisterScreen`: Fluxo de autenticação com a API Spring Boot.
  3. `HomeScreen`: Painel Pet-Centric com seletor do pet ativo, barra de score de bem-estar do pet, tarefas da rotina de hoje e atalhos rápidos (IA e Clínicas 24h). *Sem criação de animais e sem histórico clínico solto na home.*
  4. `PetDetailScreen` (ou `PetProfileScreen`): Página dedicada ao Pet com dados vitais, acompanhamento de peso, histórico completo de consultas, vacinas e tratamentos.
  5. `FamilyPetScreen`: Gestão de pets da família, botão de criar/cadastrar novo pet e gestão de co-cuidadores.
  6. `TrainingEducationScreen`: Módulos de treinamento, educação e adestramento com gamificação direcionada ao score do Pet e dicas interativas.
  7. `ClinicsSearchScreen`: Busca de clínicas veterinárias, filtro de emergência/pronto-socorro 24h e agendamento.
  8. `AiAssistantScreen`: Assistente de IA que analisa histórico do pet (raça, peso, idade, consultas) e gera dicas preventivas e conselhos.
  9. `UserProfileScreen`: Perfil do tutor, dados da conta e botão de Logout.
- [ ] Navegação gerenciada exclusivamente pelo **React Navigation** (`@react-navigation/native-stack` e `@react-navigation/bottom-tabs`).
- [ ] Todas as rotas tipadas estritamente em `src/routes/types.ts` (`RootStackParamList`, `TabParamList`).

#### Tarefas Técnicas (Child Tasks)
* **Task 1.1:** Mapear e tipar todas as novas rotas e parâmetros em `src/routes/types.ts`. *(1.5h)*
* **Task 1.2:** Reestruturar `MainStack.tsx` e `tabs.tsx` com a nova hierarquia de telas Pet-Centric. *(2.5h)*
* **Task 1.3:** Migrar o cadastro de pets da Home para a `FamilyPetScreen.tsx`. *(1.5h)*
* **Task 1.4:** Migrar o histórico clínico da Home para a página dedicada `PetDetailScreen.tsx`. *(1.5h)*
* **Task 1.5:** Auditar transições e garantir ausência de rotas quebradas ou inacessíveis. *(1.0h)*

---

### 🔹 [PBI-02] Refatoração de Componentes Reutilizáveis, Cards de Rotina e Clean Code
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `Mobile Refatoração e Arquitetura UI Pet-Centric`
* **Priority:** `1 - Critical`
* **Effort / Story Points:** `5`
* **Tags:** `Architecture`, `Refactor`, `Components`, `CleanCode`

#### Descrição (User Story)
> **Como** desenvolvedor mobile,  
> **Eu quero** criar componentes reutilizáveis para cards de rotina, barra de progresso de bem-estar do pet e modais,  
> **Para que** o código respeite os princípios de Clean Code, DRY e modularidade.

#### Critérios de Aceite (Acceptance Criteria)
- [ ] Nenhuma tela ultrapassa 250 linhas de código com lógica misturada.
- [ ] Biblioteca de componentes reutilizáveis em `src/components/common/`:
  - `PetScoreBar`: Barra de progresso visual do nível e bem-estar do Pet.
  - `RoutineCard`: Card de tarefa de rotina com checkbox de conclusão e badge de pontos.
  - `CustomButton`, `CustomInput`, `LoadingSpinner`, `EmptyState`, `Header`.
- [ ] Padronização de tipagens TypeScript em `src/types/` eliminando usos de `any`.

#### Tarefas Técnicas (Child Tasks)
* **Task 2.1:** Criar componentes `PetScoreBar` e `RoutineCard` em `src/components/pet/`. *(2.5h)*
* **Task 2.2:** Refatorar componentes base (`CustomButton`, `CustomInput`, `LoadingSpinner`, `EmptyState`). *(2.0h)*
* **Task 2.3:** Aplicar componentes reutilizáveis nas telas de Home, PetDetail e Training. *(2.5h)*
* **Task 2.4:** Limpar código morto e organizar tipagens em `src/types/models.ts`. *(1.5h)*

---

## 🏆 FEATURE 2: Infraestrutura de Rede e Autenticação (Java Backend & TanStack)
* **Work Item Type:** `Feature`
* **Parent Epic:** `Epic Mobile Pet Guardian - Arquitetura Pet-Centric (Sprint 3)`
* **Tags:** `Mobile`
* **Start Date:** `2026-08-28`
* **Target Date:** `2026-08-30`
* **Descrição:** Configuração do cliente Axios integrado à API Spring Boot Java, TanStack Query Provider, gerenciamento de tokens JWT e persistência de sessão no AsyncStorage.

---

### 🔹 [PBI-03] Configuração da Camada de API (Java Backend) e TanStack Query Provider
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `Infraestrutura de Rede e Autenticação (Java Backend & TanStack)`
* **Priority:** `1 - Critical`
* **Effort / Story Points:** `5`
* **Tags:** `Infra`, `API`, `JavaBackend`, `TanStackQuery`

#### Descrição (User Story)
> **Como** desenvolvedor mobile,  
> **Eu quero** configurar o cliente HTTP Axios conectado à API Java Advanced e o TanStack Query Provider,  
> **Para que** a aplicação consuma dados reais do backend com cache reativo, loading states e injeção automática de Bearer Token.

#### Critérios de Aceite (Acceptance Criteria)
- [ ] Dependências `@tanstack/react-query` e `axios` configuradas.
- [ ] Instância do Axios (`src/services/api.ts`) apontando para a URL da API Spring Boot (`http://{ip-local}:8080` ou `.env`).
- [ ] Interceptor de Request injetando automaticamente o header `Authorization: Bearer <token>` a partir do `AsyncStorage`.
- [ ] Interceptor de Response capturando erro 401 e disparando logout automático.
- [ ] `QueryClientProvider` configurado na raiz da aplicação (`App.tsx`).

#### Tarefas Técnicas (Child Tasks)
* **Task 3.1:** Configurar cliente Axios em `src/services/api.ts` com base URL da API Java e interceptors de JWT. *(2.0h)*
* **Task 3.2:** Configurar `QueryClient` e Provider em `App.tsx`. *(1.0h)*
* **Task 3.3:** Criar contratos de response da API Java (`ApiResponse<T>`, `PetResponse`, `ErrorResponse`). *(1.5h)*

---

### 🔹 [PBI-04] Sistema de Autenticação Real com JWT, Sessão Persistente e Rotas Protegidas
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `Infraestrutura de Rede e Autenticação (Java Backend & TanStack)`
* **Priority:** `1 - Critical`
* **Effort / Story Points:** `8`
* **Tags:** `Auth`, `JWT`, `JavaSecurity`, `Session`

#### Descrição (User Story)
> **Como** tutor ou cuidador cadastrado no PetGuardian,  
> **Eu quero** realizar login e cadastro consumindo os endpoints `/auth/login` e `/auth/register` da API Java Spring Boot, mantendo o token JWT salvo com segurança,  
> **Para que** meus dados fiquem protegidos, minhas requisições sejam autenticadas e eu permaneça conectado ao fechar e reabrir o aplicativo.

#### Critérios de Aceite (Acceptance Criteria)
- [ ] Autenticação conectada à API real em Spring Boot Java (`/auth/login` e `/auth/register`).
- [ ] **Proibido** login simulado com `AsyncStorage` contendo usuários ou validações fixas.
- [ ] Recebimento e armazenamento do token JWT retornado pelo backend (`token`, `tipo: "Bearer"`, `usuario`).
- [ ] `AuthContext` e hook `useAuth()` gerenciando `user`, `token`, `isAuthenticated`, `isLoadingAuth`.
- [ ] Persistência segura do token JWT via `@react-native-async-storage/async-storage`.
- [ ] Rotas privadas acessíveis somente quando autenticado (navegação alterna dinamicamente entre `AuthStack` e `AppStack`).
- [ ] Ação de Logout que limpa storage, reseta cache do TanStack Query e redireciona para o Login.

#### Tarefas Técnicas (Child Tasks)
* **Task 4.1:** Criar `AuthService.ts` com chamadas HTTP para `/auth/login` e `/auth/register` da API Java. *(2.0h)*
* **Task 4.2:** Criar `AuthContext.tsx` e hook `useAuth.ts` com persistência de token JWT. *(3.0h)*
* **Task 4.3:** Integrar `LoginScreen.tsx` e `RegisterScreen.tsx` com `useAuth` e validação Zod. *(2.5h)*
* **Task 4.4:** Proteger a navegação no `MainStack.tsx` baseando-se no estado `isAuthenticated`. *(1.5h)*
* **Task 4.5:** Implementar ação de Logout em `UserProfileScreen.tsx` com limpeza total de sessão. *(1.0h)*

---

## 🏆 FEATURE 3: Integração de CRUDs Pet-Centric com Backend Java
* **Work Item Type:** `Feature`
* **Parent Epic:** `Epic Mobile Pet Guardian - Arquitetura Pet-Centric (Sprint 3)`
* **Tags:** `Mobile`
* **Start Date:** `2026-08-30`
* **Target Date:** `2026-08-31`
* **Descrição:** Implementação de ponta a ponta das 2 funcionalidades centrais conectadas à API Spring Boot Java via HTTP (Create, Read, Update, Delete) com dados 100% reais, estados de loading e invalidação de cache.

---

### 🔹 [PBI-05] CRUD Completo 1: Gestão de Pets, Cadastro em FamilyPet e Histórico em PetDetail
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `Integração de CRUDs Pet-Centric com Backend Java`
* **Priority:** `1 - Critical`
* **Effort / Story Points:** `8`
* **Tags:** `CRUD`, `Pets`, `PetDetail`, `FamilyPet`, `TanStackQuery`

#### Descrição (User Story)
> **Como** tutor de animais,  
> **Eu quero** cadastrar novos pets através da tela FamilyPet, visualizar detalhes vitais e histórico clínico/vacinal na PetDetail, atualizar dados e excluir pets,  
> **Para que** o perfil completo do animal fique sincronizado em tempo real com a API Java.

#### Critérios de Aceite (Acceptance Criteria)
- [ ] **Create:** Cadastro de novo pet em `FamilyPetScreen` enviando `POST /pets` para a API Java.
- [ ] **Read:** Listagem de pets em `FamilyPetScreen` e exibição da ficha completa com histórico clínico, vacinas e peso na `PetDetailScreen` via `useQuery`.
- [ ] **Update:** Edição de dados do pet (nome, peso, raça, data de nascimento) via `PUT /pets/{id}` com `useMutation`.
- [ ] **Delete:** Exclusão do pet via `DELETE /pets/{id}` com `useMutation` e diálogo de confirmação.
- [ ] Invalidação automática de cache (`queryClient.invalidateQueries({ queryKey: ['pets'] })`) após mutações.
- [ ] Exibição de estados visuais de `loading` e feedback amigável de erro/sucesso.

#### Tarefas Técnicas (Child Tasks)
* **Task 5.1:** Criar `PetService.ts` com chamadas HTTP (`getPets`, `getPetById`, `createPet`, `updatePet`, `deletePet`, `getHistoricoSaude`). *(2.5h)*
* **Task 5.2:** Criar custom hook `usePets.ts` encapsulando queries e mutations do TanStack Query. *(2.5h)*
* **Task 5.3:** Implementar tela dedicada `PetDetailScreen.tsx` com ficha do pet, gráficos de peso e histórico de consultas/vacinas. *(3.5h)*
* **Task 5.4:** Implementar fluxo de cadastro e listagem em `FamilyPetScreen.tsx` integrado com `usePets`. *(2.5h)*

---

### 🔹 [PBI-06] CRUD Completo 2: Gestão de Rotina Diária, Treinamento & Score do Pet
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `Integração de CRUDs Pet-Centric com Backend Java`
* **Priority:** `1 - Critical`
* **Effort / Story Points:** `8`
* **Tags:** `CRUD`, `Routine`, `Training`, `PetScore`, `TanStackQuery`

#### Descrição (User Story)
> **Como** membro da família e tutor,  
> **Eu quero** criar tarefas da rotina do pet (alimentação, remédio, passeio), concluir tarefas somando pontos ao Score do animal e realizar módulos de treinamento na TrainingEducationScreen,  
> **Para que** a rotina diária seja cumprida e o animal evolua seu nível de bem-estar.

#### Critérios de Aceite (Acceptance Criteria)
- [ ] **Create:** Criação de nova tarefa de rotina enviando `POST /tarefas` vinculado ao `petId` selecionado.
- [ ] **Read:** Listagem das tarefas de rotina de hoje na `HomeScreen` e módulos de treino na `TrainingEducationScreen` via `useQuery`.
- [ ] **Update:** Conclusão de tarefa via `PATCH /tarefas/{id}/concluir` com `useMutation`, creditando pontos ao Pet e atualizando imediatamente a barra `PetScoreBar` na Home.
- [ ] **Delete:** Remoção de tarefa de rotina via `DELETE /tarefas/{id}` com `useMutation`.
- [ ] Substituir o `TaskService.ts` legado por chamadas REST reais conectadas à API Spring Boot.
- [ ] Atualização reativa imediata da lista de tarefas e do score do pet na interface.

#### Tarefas Técnicas (Child Tasks)
* **Task 6.1:** Refatorar `TaskService.ts` com endpoints (`getTarefasHoje`, `createTarefa`, `concluirTarefa`, `deleteTarefa`). *(2.0h)*
* **Task 6.2:** Criar `TrainingService.ts` com listagem e conclusão de módulos de treinamento. *(2.0h)*
* **Task 6.3:** Criar custom hooks `useRoutine.ts` e `useTraining.ts` com TanStack Query. *(2.5h)*
* **Task 6.4:** Integrar `HomeScreen.tsx` com conclusão de rotina e atualização reativa do `PetScoreBar`. *(2.5h)*
* **Task 6.5:** Desenvolver tela `TrainingEducationScreen.tsx` com trilhas de treino e ganho de pontos do Pet. *(3.0h)*

---

## 🏆 FEATURE 4: Documentação Técnica e Entrega da Sprint
* **Work Item Type:** `Feature`
* **Parent Epic:** `Epic Mobile Pet Guardian - Arquitetura Pet-Centric (Sprint 3)`
* **Tags:** `Mobile`
* **Start Date:** `2026-08-31`
* **Target Date:** `2026-09-01`
* **Descrição:** Produção de documentação no repositório GitHub (README.md) com instruções de execução e gravação do vídeo demonstrativo de até 5 minutos conforme rubrica da FIAP.

---

### 🔹 [PBI-07] Documentação Técnica (README.md) e Preparação do Vídeo de Apresentação
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `Documentação Técnica e Entrega da Sprint`
* **Priority:** `2 - High`
* **Effort / Story Points:** `3`
* **Tags:** `Documentation`, `Video`, `Delivery`

#### Descrição (User Story)
> **Como** avaliador/professor da disciplina,  
> **Eu quero** consultar uma documentação clara e assistir ao vídeo de demonstração narrado,  
> **Para que** eu possa rodar a aplicação e validar o cumprimento de todos os critérios da Sprint 3.

#### Critérios de Aceite (Acceptance Criteria)
- [ ] `README.md` completo contendo:
  - Descrição do problema da Clyvo Vet e arquitetura Pet-Centric do PetGuardian.
  - Tecnologias e bibliotecas utilizadas (React Native, Expo, TanStack Query, Axios, React Navigation, etc.).
  - Instruções de build e execução (`npm install`, configuração da URL da API Java, `npx expo start`).
  - Link público/não-listado do YouTube para o vídeo de apresentação.
- [ ] Roteiro e vídeo de apresentação (máximo 5 minutos) contemplando:
  1. Apresentação do projeto e da arquitetura Pet-Centric.
  2. Demonstração do fluxo de Login/Cadastro com JWT e persistência de sessão.
  3. Navegação pelas telas (Home Pet-Centric, PetDetail com histórico clínico, FamilyPet com cadastro, Training e Clínicas 24h).
  4. Demonstração dos 2 CRUDs completos em funcionamento real com a API Java.
  5. Logout e bloqueio imediato das telas protegidas.

#### Tarefas Técnicas (Child Tasks)
* **Task 7.1:** Atualizar e padronizar o `README.md` conforme especificações da página 38. *(2h)*
* **Task 7.2:** Elaborar roteiro e gravar o vídeo demonstrativo em emulador/dispositivo real de até 5 min. *(3h)*
* **Task 7.3:** Subir o vídeo no YouTube e inserir o link no topo do README. *(0.5h)*
