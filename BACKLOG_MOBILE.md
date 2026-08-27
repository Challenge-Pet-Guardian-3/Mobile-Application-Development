# 📋 Backlog de Refatoração Mobile (3ª Sprint) - Azure Boards
> **Projeto:** Clyvo Vet / PetGuardian  
> **Disciplina:** Mobile Application Development (FIAP)  
> **Epic Principal:** `[EPIC] Epic Mobile Pet Guardian - Arquitetura Pet-Centric (Sprint 3)`  
> **Start Date:** `2026-08-27`  
> **Target Date:** `2026-09-01`  
> **Diretrizes da Mentoria Clyvo:** App focado no Pet, pontuação no Pet, rotina familiar (Care Circle), página dedicada com histórico consolidado, página de Treinamento/Educação, Assistente de IA e busca de Clínicas 24h.

---

## 🎯 1. Matriz de Requisitos & Critérios Avaliativos (Páginas 31 a 42)

| Critério Avaliativo | Pontos | Requisitos Obrigatórios da Banca & Mentoria Clyvo |
| :--- | :---: | :--- |
| **Navegação entre Telas** | **5 pts** | • Mínimo de **6 telas distintas** e funcionais (sem telas vazias/duplicadas).<br>• Uso exclusivo de biblioteca oficial (`@react-navigation/native-stack` e `@react-navigation/bottom-tabs`), **proibido** controle manual com `useState`/`if`.<br>• Rotas explicitamente declaradas e tipadas em TypeScript. |
| **Arquitetura & Clean Code** | **20 pts** | • Separação estrita de responsabilidades (UI / Lógica / Camada de API).<br>• **Proibido** chamadas HTTP e regras de negócio direto nas telas.<br>• Hooks customizados isolando TanStack Query (`usePets`, `useTasks`, `useRedeCuidado`, `useUsers`, `useSession`).<br>• Código limpo, tipado em TypeScript sem `any` e sem duplicações (DRY). |
| **Integração com API Backend HTTP (Java)** | **35 pts** | • Requisições obrigatórias com **TanStack Query** (`useQuery`, `useMutation`).<br>• **100% dados reais da API Spring Boot Java** (proibido mocks, dados fixos ou AsyncStorage como banco).<br>• **2 funcionalidades com CRUD completo (Create, Read, Update, Delete)** na interface.<br>• Estados de **Loading** e **atualização reativa imediata** (cache invalidation). |
| **Sistema de Autenticação JWT** | **20 pts** | • Autenticação real com a API Java (`POST /login` e `POST /usuarios`).<br>• Fluxo completo (Login, Cadastro, Logout).<br>• **Persistência de sessão** com Token JWT no `AsyncStorage`.<br>• **Rotas protegidas** (usuário deslogado não acessa telas internas via `MainStack.tsx`). |
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
│   ├── 📄 [PBI-03] Configuração da Camada HTTP (Axios + Spring Boot) e TanStack Query Provider (5 pts)
│   └── 📄 [PBI-04] Sistema de Autenticação Real com JWT RSA 2048-bit, Sessão Persistente e Rotas Protegidas (8 pts)
│
├── 🏆 Feature 3: Integração de CRUDs Pet-Centric com Backend Java
│   ├── 📄 [PBI-05] CRUD Completo 1: Gestão de Pets, Rede de Cuidado (Care Circle) e Histórico em PetDetail (8 pts)
│   └── 📄 [PBI-06] CRUD Completo 2: Gestão de Rotina Diária, Conclusão de Tarefas & Score do Pet (8 pts)
│
└── 🏆 Feature 4: Documentação Técnica e Entrega da Sprint
    └── 📄 [PBI-07] Documentação Técnica (README.md) e Preparação do Vídeo de Apresentação (3 pts)
```

---

## 📊 3. Tabela Resumo do Backlog

| Feature | ID do PBI | Título do PBI | Story Points | Prioridade |
| :--- | :--- | :--- | :---: | :---: |
| **Feature 1: Arquitetura UI Pet-Centric** | **PBI-01** | Reestruturação da Navegação e Validação das Telas Pet-Centric | 5 | 1 - Crítica |
| | **PBI-02** | Componentização Reutilizável, Cards de Rotina & Clean Code | 5 | 1 - Crítica |
| **Feature 2: Infra de Rede & Auth JWT** | **PBI-03** | Configuração do Cliente HTTP Axios e TanStack Query Provider | 5 | 1 - Crítica |
| | **PBI-04** | Autenticação JWT RSA 2048-bit Real, Sessão Persistente & Rotas Protegidas | 8 | 1 - Crítica |
| **Feature 3: CRUDs Pet-Centric** | **PBI-05** | CRUD 1: Gestão de Pets, Care Circle Familiar e Histórico Consolidado | 8 | 1 - Crítica |
| | **PBI-06** | CRUD 2: Gestão de Rotina Diária, Conclusão de Tarefas & Score do Pet | 8 | 1 - Crítica |
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
* **Descrição:** Reestruturação da árvore de navegação com React Navigation aplicando a arquitetura Pet-Centric (Home com score e rotina, PetDetail com histórico consolidado, FamilyPet com cadastro e co-cuidadores, Training/Education, ClinicsSearch 24h e AiAssistant).

---

### 🔹 [PBI-01] Reestruturação da Navegação e Validação das Telas Pet-Centric
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `Mobile Refatoração e Arquitetura UI Pet-Centric`
* **Priority:** `1 - Critical`
* **Effort / Story Points:** `5`
* **Tags:** `Navigation`, `Routes`, `UI`, `PetCentric`

#### Descrição (User Story)
> **Como** usuário do aplicativo PetGuardian,  
> **Eu quero** navegar de forma fluida entre as telas da plataforma estruturadas com foco no animal,  
> **Para que** a Home apresente o resumo do pet ativo e sua rotina, o cadastro seja feito na FamilyPet, o histórico fique na tela dedicada do Pet e eu possa acessar Treinamentos, Clínicas 24h e a Assistente de IA.

#### Critérios de Aceite (Acceptance Criteria)
- [ ] O aplicativo deve conter a seguinte estrutura de telas funcionais:
  1. `WelcomeScreen`: Boas-vindas e introdução ao aplicativo.
  2. `LoginScreen` & `RegisterScreen`: Fluxo de autenticação e cadastro de tutor na API Spring Boot.
  3. `HomeScreen`: Painel Pet-Centric com seletor do pet ativo, barra de score de bem-estar (`PetScoreBar`), tarefas da rotina de hoje e atalhos rápidos (IA e Clínicas 24h).
  4. `PetDetailScreen`: Página dedicada ao Pet com dados cadastrais, porte, castração, histórico completo de tarefas concluídas e edição (`PUT /pets/{id}`).
  5. `FamilyPetScreen`: Gestão de pets da família, criação de novos pets (`POST /pets`), criação de tarefas da rotina e convite de co-cuidadores por e-mail (`POST /pets/{id}/cuidadores`).
  6. `TrainingEducationScreen`: Módulos de treinamento, educação e adestramento com gamificação direcionada ao Pet.
  7. `ClinicsSearchScreen`: Busca de clínicas veterinárias com filtro de emergência/pronto-socorro 24h.
  8. `AiAssistantScreen`: Assistente de IA integrada que analisa histórico do pet e gera orientações preventivas.
  9. `UserProfileScreen`: Perfil do tutor, dados de endereço/telefone, total de pontos acumulados e botão de Logout.
- [ ] Navegação gerenciada exclusivamente pelo **React Navigation** (`@react-navigation/native-stack` e `@react-navigation/bottom-tabs`).
- [ ] Todas as rotas tipadas estritamente em `src/routes/types.ts` (`AppTabParamList`, `FamilyStackParamList`, `ProfileStackParamList`).

#### Tarefas Técnicas (Child Tasks)
* **Task 1.1:** Mapear e tipar todas as rotas e parâmetros em `src/routes/types.ts`. *(1.5h)*
* **Task 1.2:** Reestruturar `MainStack.tsx` e `tabs.tsx` com a hierarquia de telas Pet-Centric. *(2.5h)*
* **Task 1.3:** Centralizar o cadastro e convite de familiares na `FamilyPetScreen.tsx`. *(1.5h)*
* **Task 1.4:** Integrar o histórico consolidado do animal na página dedicada `PetDetailScreen.tsx`. *(1.5h)*
* **Task 1.5:** Auditar transições e garantir ausência de rotas quebradas ou inacessíveis. *(1.0h)*

---

### 🔹 [PBI-02] Componentização Reutilizável, Cards de Rotina & Clean Code
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `Mobile Refatoração e Arquitetura UI Pet-Centric`
* **Priority:** `1 - Critical`
* **Effort / Story Points:** `5`
* **Tags:** `Architecture`, `Refactor`, `Components`, `CleanCode`

#### Descrição (User Story)
> **Como** desenvolvedor mobile,  
> **Eu quero** utilizar componentes reutilizáveis para cards de rotina, barra de progresso de bem-estar do pet e formulários padronizados,  
> **Para que** o código respeite os princípios de Clean Code, DRY e modularidade.

#### Critérios de Aceite (Acceptance Criteria)
- [ ] Biblioteca de componentes reutilizáveis em `src/components/`:
  - `PetScoreBar`: Barra de progresso visual do nível e bem-estar do Pet.
  - `RoutineCard`: Card de tarefa de rotina com checkbox de conclusão e badge de pontos.
  - `StreakCard`: Card de engajamento e acompanhamento da rotina.
  - `CustomButton`, `CustomInput`, `LoadingSpinner`, `EmptyState`, `Header`.
- [ ] Padronização de tipagens TypeScript em `src/types/` eliminando usos de `any` e tipos legados.
- [ ] Código limpo e desacoplado, sem duplicações de chamadas de storage ou estados redundantes.

#### Tarefas Técnicas (Child Tasks)
* **Task 2.1:** Refatorar componentes `PetScoreBar` e `RoutineCard` em `src/components/`. *(2.0h)*
* **Task 2.2:** Padronizar componentes base (`CustomButton`, `CustomInput`, `LoadingSpinner`, `EmptyState`). *(2.0h)*
* **Task 2.3:** Aplicar componentes reutilizáveis nas telas de Home, PetDetail e FamilyPet. *(2.0h)*
* **Task 2.4:** Limpar código morto e organizar tipagens em `src/types/models.ts`. *(1.0h)*

---

## 🏆 FEATURE 2: Infraestrutura de Rede e Autenticação (Java Backend & TanStack)
* **Work Item Type:** `Feature`
* **Parent Epic:** `Epic Mobile Pet Guardian - Arquitetura Pet-Centric (Sprint 3)`
* **Tags:** `Mobile`
* **Start Date:** `2026-08-28`
* **Target Date:** `2026-08-30`
* **Descrição:** Configuração do cliente Axios integrado à API Spring Boot Java, TanStack Query Provider, gerenciamento de tokens JWT RSA 2048-bit e persistência de sessão atômica no AsyncStorage.

---

### 🔹 [PBI-03] Configuração do Cliente HTTP Axios e TanStack Query Provider
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `Infraestrutura de Rede e Autenticação (Java Backend & TanStack)`
* **Priority:** `1 - Critical`
* **Effort / Story Points:** `5`
* **Tags:** `Infra`, `API`, `JavaBackend`, `TanStackQuery`, `Axios`

#### Descrição (User Story)
> **Como** desenvolvedor mobile,  
> **Eu quero** configurar o cliente HTTP Axios conectado à API Java Advanced e o TanStack Query Provider,  
> **Para que** a aplicação consuma dados reais do backend com cache reativo, loading states e injeção automática de Bearer Token.

#### Critérios de Aceite (Acceptance Criteria)
- [ ] Dependências `@tanstack/react-query` e `axios` configuradas.
- [ ] Instância centralizada do Axios (`src/services/http.ts`) apontando dinamicamente para a URL da API Spring Boot (`http://10.0.2.2:8080` no Android e `http://localhost:8080` no iOS/Web).
- [ ] Interceptor de Request injetando automaticamente o header `Authorization: Bearer <token>` a partir do `AsyncStorage`.
- [ ] Interceptor de Response capturando status HTTP 401 e disparando limpeza de sessão e callback de logout.
- [ ] `QueryClientProvider` configurado na raiz da aplicação (`App.tsx`).

#### Tarefas Técnicas (Child Tasks)
* **Task 3.1:** Configurar cliente Axios em `src/services/http.ts` com mapeamento dinâmico de host e interceptors de JWT. *(2.0h)*
* **Task 3.2:** Configurar chaves centralizadas de query em `src/lib/queryKeys.ts`. *(1.5h)*
* **Task 3.3:** Criar contratos de response da API Java em `src/types/api.ts` (`Page<T>`). *(1.5h)*

---

### 🔹 [PBI-04] Autenticação JWT RSA 2048-bit Real, Sessão Persistente & Rotas Protegidas
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `Infraestrutura de Rede e Autenticação (Java Backend & TanStack)`
* **Priority:** `1 - Critical`
* **Effort / Story Points:** `8`
* **Tags:** `Auth`, `JWT`, `RSA2048`, `JavaSecurity`, `Session`

#### Descrição (User Story)
> **Como** tutor ou cuidador cadastrado no PetGuardian,  
> **Eu quero** realizar login e cadastro consumindo os endpoints `POST /login` e `POST /usuarios` da API Java Spring Boot, mantendo o token JWT salvo com segurança,  
> **Para que** minhas credenciais sejam autenticadas com chaves assimétricas RSA 2048-bit e eu permaneça conectado de forma segura ao fechar e reabrir o aplicativo.

#### Critérios de Aceite (Acceptance Criteria)
- [ ] Autenticação conectada à API real em Spring Boot Java:
  - Login via `POST /login` recebendo `{ email, senha }` e retornando `{ token, user }`.
  - Cadastro via `POST /usuarios` com dados de endereço e telefone estruturados, realizando login automático com as credenciais.
- [ ] `LoginScreen` trata corretamente o status HTTP 401 para credenciais inválidas.
- [ ] `AuthContext` e hook `useSession()` gerenciando `user`, `token`, `isAuthenticated`, `isLoading`, `login`, `register` e `logout`.
- [ ] Persistência segura da sessão via `@react-native-async-storage/async-storage` (`@PetGuardian_AuthToken` e `@PetGuardian_AuthUser`).
- [ ] Rotas protegidas no `MainStack.tsx`: usuário deslogado tem acesso apenas a `Welcome`, `Login` e `Register`; usuário autenticado entra diretamente nas `Tabs`.
- [ ] Ação de Logout que limpa storage, reseta o estado do contexto e redireciona para a tela de boas-vindas.

#### Tarefas Técnicas (Child Tasks)
* **Task 4.1:** Criar `AuthService.ts` com chamadas `login`, `register`, `getStoredSession` e `logout`. *(2.0h)*
* **Task 4.2:** Desenvolver `AuthContext.tsx` e hook `useSession.ts` com persistência atômica de token JWT. *(2.5h)*
* **Task 4.3:** Integrar `LoginScreen.tsx` e `RegisterScreen.tsx` com validação de formulário Zod e tratamento de 401. *(2.0h)*
* **Task 4.4:** Proteger a navegação condicional no `MainStack.tsx` baseando-se em `isAuthenticated`. *(1.0h)*

---

## 🏆 FEATURE 3: Integração de CRUDs Pet-Centric com Backend Java
* **Work Item Type:** `Feature`
* **Parent Epic:** `Epic Mobile Pet Guardian - Arquitetura Pet-Centric (Sprint 3)`
* **Tags:** `Mobile`
* **Start Date:** `2026-08-30`
* **Target Date:** `2026-08-31`
* **Descrição:** Implementação de ponta a ponta das funcionalidades centrais conectadas à API Spring Boot Java via HTTP (Create, Read, Update, Delete) com dados 100% reais, estados de loading e invalidação de cache.

---

### 🔹 [PBI-05] CRUD Completo 1: Gestão de Pets, Care Circle Familiar e Histórico Consolidado
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `Integração de CRUDs Pet-Centric com Backend Java`
* **Priority:** `1 - Critical`
* **Effort / Story Points:** `8`
* **Tags:** `CRUD`, `Pets`, `CareCircle`, `PetDetail`, `FamilyPet`, `TanStackQuery`

#### Descrição (User Story)
> **Como** tutor responsável pelo animal,  
> **Eu quero** cadastrar novos pets na FamilyPet, visualizar a ficha completa e histórico consolidado na PetDetail, atualizar dados, excluir pets e convidar co-cuidadores por e-mail,  
> **Para que** toda a governança e o histórico de cuidados do animal fiquem sincronizados com o backend Java.

#### Critérios de Aceite (Acceptance Criteria)
- [ ] **Create:** Cadastro de pet em `FamilyPetScreen` enviando `POST /pets` com `PetRequest` (`nome`, `raca`, `idade`, `porte`, `sexo`, `castrado`, `usuarioId`).
- [ ] **Read:** Listagem paginada de pets (`GET /pets`) e consulta de histórico consolidado de tarefas concluídas (`GET /pets/{id}/historico`) na `PetDetailScreen`.
- [ ] **Update:** Edição de dados do pet via `PUT /pets/{id}` na `PetDetailScreen` com feedback de sucesso.
- [ ] **Delete:** Exclusão do pet via `DELETE /pets/{id}` com confirmação em diálogo nativo.
- [ ] **Care Circle (Governança N:N):**
  - Convite de co-cuidador via `POST /pets/{id}/cuidadores` enviando `{ responsavelPrincipalId, email }`.
  - Visualização da Rede de Cuidados agregada via `GET /usuarios/{id}/rede-cuidado`.
  - Listagem de cuidadores vinculados (`GET /pets/{id}/cuidadores`) e desvinculação (`DELETE /pets/{id}/cuidadores/{usuarioId}`).
- [ ] Invalidação automática de cache no TanStack Query após todas as mutações (`pets.all`, `users.all`, `tasks.all`).

#### Tarefas Técnicas (Child Tasks)
* **Task 5.1:** Criar `PetService.ts` com métodos `getPets`, `getPetById`, `createPet`, `updatePet`, `deletePet`, `getPetHistory` e `convidarPorEmail`. *(2.5h)*
* **Task 5.2:** Criar hooks `usePets.ts` (`usePets`, `usePet`, `usePetHistory`, `useCreatePet`, `useUpdatePet`, `useDeletePet`, `useInviteCaregiver`). *(2.5h)*
* **Task 5.3:** Desenvolver fluxo de visualização e edição na `PetDetailScreen.tsx`. *(2.5h)*
* **Task 5.4:** Integrar cadastro e convite de familiares na `FamilyPetScreen.tsx`. *(2.0h)*

---

### 🔹 [PBI-06] CRUD Completo 2: Gestão de Rotina Diária, Conclusão de Tarefas & Score do Pet
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `Integração de CRUDs Pet-Centric com Backend Java`
* **Priority:** `1 - Critical`
* **Effort / Story Points:** `8`
* **Tags:** `CRUD`, `Routine`, `Tasks`, `PetScore`, `Gamification`, `TanStackQuery`

#### Descrição (User Story)
> **Como** membro da família ou co-cuidador,  
> **Eu quero** criar tarefas da rotina do pet (alimentação, medicação, passeio), concluir tarefas somando pontos ao cuidador e ao animal e visualizar meu total acumulado,  
> **Para que** os cuidados fiquem organizados e o animal mantenha uma alta pontuação de bem-estar.

#### Critérios de Aceite (Acceptance Criteria)
- [ ] **Create:** Criação de nova tarefa de rotina enviando `POST /tarefas` com `TarefaRequest` (`titulo`, `descricao`, `pontosTarefa`, `prazo`, `usuarioId: null`, `petId`, `status: "PENDENTE"`).
- [ ] **Read:** Listagem de tarefas em tempo real na `HomeScreen` e `FamilyPetScreen` via `useTasks()`.
- [ ] **Update (Conclusão):** Conclusão de tarefa via `PATCH /tarefas/{id}/concluir` enviando `{ concluinteId: user.id }`, atualizando status para `CONCLUIDO` e recalculando imediatamente a barra `PetScoreBar`.
- [ ] **Delete:** Remoção de tarefa de rotina via `DELETE /tarefas/{id}` com confirmação.
- [ ] **Pontuação:** Consulta do total de pontos acumulados pelo cuidador via `GET /tarefas/by-usuario/pontos?usuarioId={id}` no perfil do usuário.
- [ ] Invalidação automática de cache do TanStack Query (`tasks.all`, `users.all`, `pets.all`).

#### Tarefas Técnicas (Child Tasks)
* **Task 6.1:** Desenvolver `TaskService.ts` (`getTarefas`, `getTarefasPorUsuario`, `createTarefa`, `updateTarefa`, `concluirTarefa`, `getPontosUsuario`, `deleteTarefa`). *(2.0h)*
* **Task 6.2:** Criar hooks `useTasks.ts` (`useTasks`, `useUserTasks`, `useUserPoints`, `useCreateTask`, `useCompleteTask`, `useDeleteTask`). *(2.5h)*
* **Task 6.3:** Integrar `HomeScreen.tsx` com alternância e conclusão de rotina via `useCompleteTask` e atualização do `PetScoreBar`. *(2.5h)*
* **Task 6.4:** Integrar criação de tarefas em `FamilyPetScreen.tsx` e exibição de pontos em `UserProfileScreen.tsx`. *(2.0h)*

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
  3. Navegação pelas telas (Home Pet-Centric, PetDetail com histórico, FamilyPet com cadastro e Care Circle, Training e Clínicas 24h).
  4. Demonstração dos 2 CRUDs completos em funcionamento real com a API Java.
  5. Logout e bloqueio imediato das telas protegidas.

#### Tarefas Técnicas (Child Tasks)
* **Task 7.1:** Atualizar e padronizar o `README.md` conforme especificações da disciplina. *(1.5h)*
* **Task 7.2:** Elaborar roteiro e gravar o vídeo demonstrativo em emulador/dispositivo real de até 5 min. *(2.5h)*
* **Task 7.3:** Subir o vídeo no YouTube e inserir o link no topo do README. *(0.5h)*
