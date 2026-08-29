# 📋 Backlog Master Azure Boards — Sprint 3: Mobile Application Development

> **Projeto Integrado:** PetGuardian / Clyvo Care (Challenge FIAP 2026 - 2º Ano ADS / 2TDSPG)  
> **Disciplina:** Mobile Application Development (FIAP — 2TDSPG)  
> **Epic Principal:** `[EPIC] Sprint 3 - Mobile Application Development: Arquitetura Mobile Pet-Centric, Autenticação JWT e Integração de APIs`  
> **Start Date:** `2026-08-27`  
> **Target Date:** `2026-09-01`  
> **Padrão:** Azure Boards (Scrum Process: Epic ➔ Feature ➔ PBI ➔ Task)  
> **Diretrizes Estratégicas:** App focado no Pet, pontuação no Pet, rotina familiar (Care Circle), página dedicada com histórico consolidado, página de Treinamento/Educação, Assistente de IA e busca de Clínicas 24h.

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
[EPIC] Sprint 3 - Mobile Application Development: Arquitetura Mobile Pet-Centric, Autenticação JWT e Integração de APIs
│
├── 🏆 [FEATURE 01] Mobile Refatoração e Arquitetura UI Pet-Centric
│   ├── 📄 [PBI-01] Reestruturação da Navegação e Validação das Novas Telas Pet-Centric (3 pts)
│   │   ├── 🔹 Task 1.1: Mapear e tipar todas as rotas e parâmetros em types.ts (1.5h)
│   │   ├── 🔹 Task 1.2: Reestruturar MainStack e tabs com a hierarquia Pet-Centric (2.5h)
│   │   ├── 🔹 Task 1.3: Centralizar cadastro e convite de familiares na FamilyPetScreen (1.5h)
│   │   ├── 🔹 Task 1.4: Integrar histórico consolidado na PetDetailScreen (1.5h)
│   │   └── 🔹 Task 1.5: Auditar transições e validar rotas (1.0h)
│   └── 📄 [PBI-02] Refatoração de Componentes Reutilizáveis, Cards de Rotina e Clean Code (2 pts)
│       ├── 🔹 Task 2.1: Refatorar componentes PetScoreBar e RoutineCard (2.0h)
│       ├── 🔹 Task 2.2: Padronizar componentes base reutilizáveis (2.0h)
│       ├── 🔹 Task 2.3: Aplicar componentes nas telas principais (2.0h)
│       └── 🔹 Task 2.4: Limpeza de código e tipagens em models.ts (1.0h)
│
├── 🏆 [FEATURE 02] Infraestrutura de Rede e Autenticação (Java Backend & TanStack)
│   ├── 📄 [PBI-03] Configuração da Camada HTTP (Axios + Spring Boot) e TanStack Query Provider (3 pts)
│   │   ├── 🔹 Task 3.1: Configurar cliente Axios com interceptors JWT (2.0h)
│   │   ├── 🔹 Task 3.2: Configurar chaves centralizadas de query (1.5h)
│   │   └── 🔹 Task 3.3: Criar contratos de response da API Java (1.5h)
│   └── 📄 [PBI-04] Sistema de Autenticação Real com JWT (OAuth2 Resource Server Java), Sessão Persistente e Rotas Protegidas (3 pts)
│       ├── 🔹 Task 4.1: Criar AuthService com chamadas de autenticação (2.0h)
│       ├── 🔹 Task 4.2: Desenvolver AuthContext e useSession com AsyncStorage (2.5h)
│       ├── 🔹 Task 4.3: Integrar LoginScreen e RegisterScreen com validação (2.0h)
│       └── 🔹 Task 4.4: Proteger navegação condicional no MainStack (1.0h)
│
├── 🏆 [FEATURE 03] Integração de CRUDs Pet-Centric com Backend Java
│   ├── 📄 [PBI-05] CRUD Completo 1: Gestão de Pets, Rede de Cuidado (Care Circle) e Histórico em PetDetail (3 pts)
│   │   ├── 🔹 Task 5.1: Criar PetService com métodos de CRUD e co-cuidadores (2.5h)
│   │   ├── 🔹 Task 5.2: Criar hooks usePets para consultas e mutações (2.5h)
│   │   ├── 🔹 Task 5.3: Desenvolver fluxo de visualização e edição na PetDetailScreen (2.5h)
│   │   └── 🔹 Task 5.4: Integrar cadastro e convite de familiares na FamilyPetScreen (2.0h)
│   └── 📄 [PBI-06] CRUD Completo 2: Gestão de Rotina Diária, Conclusão de Tarefas & Score do Pet (3 pts)
│       ├── 🔹 Task 6.1: Desenvolver TaskService completo (2.0h)
│       ├── 🔹 Task 6.2: Criar hooks useTasks para rotina e pontuação (2.5h)
│       ├── 🔹 Task 6.3: Integrar HomeScreen com conclusão de tarefas e PetScoreBar (2.5h)
│       └── 🔹 Task 6.4: Integrar criação de tarefas e exibição de pontos no perfil (2.0h)
│
└── 🏆 [FEATURE 04] Documentação Técnica e Entrega da Sprint
    └── 📄 [PBI-07] Documentação Técnica (README.md) e Preparação do Vídeo de Apresentação (3 pts)
        ├── 🔹 Task 7.1: Atualizar README.md conforme rubrica FIAP (1.5h)
        ├── 🔹 Task 7.2: Elaborar roteiro e gravar vídeo demonstrativo (2.5h)
        └── 🔹 Task 7.3: Publicar vídeo no YouTube e vincular no README (0.5h)
```

---

## 📊 3. Tabela Resumo do Backlog

| Feature Pai | ID do PBI | Título do Item de Backlog (PBI) | Story Points | Prioridade | Horas Estimadas |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **[FEATURE 01] UI Pet-Centric** | **PBI-01** | Reestruturação da Navegação e Validação das Telas Pet-Centric | 3 pts | 1 - Critical | 8.0h |
| | **PBI-02** | Componentização Reutilizável, Cards de Rotina & Clean Code | 2 pts | 1 - Critical | 7.0h |
| **[FEATURE 02] Infra & Auth JWT** | **PBI-03** | Configuração do Cliente HTTP Axios e TanStack Query Provider | 3 pts | 1 - Critical | 5.0h |
| | **PBI-04** | Sistema de Autenticação Real com JWT (OAuth2 Resource Server Java) & Sessão | 3 pts | 1 - Critical | 7.5h |
| **[FEATURE 03] CRUDs Pet-Centric** | **PBI-05** | CRUD 1: Gestão de Pets, Care Circle Familiar e Histórico Consolidado | 3 pts | 1 - Critical | 9.5h |
| | **PBI-06** | CRUD 2: Gestão de Rotina Diária, Conclusão de Tarefas & Score do Pet | 3 pts | 1 - Critical | 9.0h |
| **[FEATURE 04] Documentação** | **PBI-07** | README.md Técnico e Roteiro de Vídeo Demonstrativo | 3 pts | 2 - High | 4.5h |
| **TOTAL CONSOLIDADO** | **4 Features** | **7 PBIs / 25 Child Tasks Técnicas** | **20 pts** | — | **50.5h** |

---

## 📦 4. Detalhamento dos Itens de Trabalho (Épico, Features, PBIs e Tasks)

---

### 🏛️ ÉPICO
* **Work Item Type:** `Epic`
* **Title:** `[EPIC] Sprint 3 - Mobile Application Development: Arquitetura Mobile Pet-Centric, Autenticação JWT e Integração de APIs`
* **Tags:** `Sprint3, Mobile, PetCentric, React-Native, TypeScript`
* **Start Date:** `2026-08-27`
* **Target Date:** `2026-09-01`
* **Priority:** `1 - Critical`
* **Effort (Story Points):** `20`
* **Business Value:** `100`
* **Description:** Evolução completa do aplicativo mobile em React Native com TypeScript aplicando arquitetura Pet-Centric, autenticação real com JWT RSA 2048-bit integrada à API Spring Boot Java, consumo reativo via TanStack Query e 2 CRUDs completos de domínio.

---

### 🏆 [FEATURE 01] Mobile Refatoração e Arquitetura UI Pet-Centric
* **Work Item Type:** `Feature`
* **Parent:** `[EPIC] Sprint 3 - Mobile Application Development: Arquitetura Mobile Pet-Centric, Autenticação JWT e Integração de APIs`
* **Title:** `[FEATURE 01] Mobile Refatoração e Arquitetura UI Pet-Centric`
* **Tags:** `Sprint3, Mobile, UI, Navigation, CleanCode`
* **Start Date:** `2026-08-27`
* **Target Date:** `2026-08-28`
* **Priority:** `1 - Critical`
* **Effort (Story Points):** `5`
* **Description:** Reestruturação da árvore de navegação com React Navigation aplicando a arquitetura Pet-Centric (Home com score e rotina, PetDetail com histórico consolidado, FamilyPet com cadastro e co-cuidadores, Training/Education, ClinicsSearch 24h e AiAssistant).

#### 🔹 [PBI-01] Reestruturação da Navegação e Validação das Telas Pet-Centric
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `[FEATURE 01] Mobile Refatoração e Arquitetura UI Pet-Centric`
* **State:** `Approved`
* **Priority:** `1 - Critical`
* **Effort (Story Points):** `3`
* **Tags:** `Sprint3, Mobile, Navigation, Routes, UI, PetCentric`

##### Descrição (História de Usuário)
> **Como** usuário do aplicativo PetGuardian,  
> **Eu quero** navegar de forma fluida entre as telas da plataforma estruturadas com foco no animal,  
> **Para que** a Home apresente o resumo do pet ativo e sua rotina, o cadastro seja feito na FamilyPet, o histórico fique na tela dedicada do Pet e eu possa acessar Treinamentos, Clínicas 24h e a Assistente de IA.

##### Critérios de Aceite (Acceptance Criteria / Definition of Done)
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

##### Tarefas Técnicas (Child Tasks)
* **Task 1.1:** [TASK-01] Mapear e tipar todas as rotas e parâmetros em `src/routes/types.ts`. *(Activity: Design, Est: 1.5h)*
  * *Descrição:* Criar e tipar interfaces de rotas para garantir navegação segura e sem erros de TypeScript.
* **Task 1.2:** [TASK-02] Reestruturar `MainStack.tsx` e `tabs.tsx` com a hierarquia de telas Pet-Centric. *(Activity: Development, Est: 2.5h)*
  * *Descrição:* Organizar tabs inferiores (Home, Família, Treino, Clínicas, IA, Perfil) e stack autenticada.
* **Task 1.3:** [TASK-03] Centralizar o cadastro e convite de familiares na `FamilyPetScreen.tsx`. *(Activity: Development, Est: 1.5h)*
  * *Descrição:* Desacoplar formulários de cadastro da tela Home para manter arquitetura modular.
* **Task 1.4:** [TASK-04] Integrar o histórico consolidado do animal na página dedicada `PetDetailScreen.tsx`. *(Activity: Development, Est: 1.5h)*
  * *Descrição:* Exibir linha do tempo com eventos clínicos e tarefas cumpridas do pet.
* **Task 1.5:** [TASK-05] Auditar transições e garantir ausência de rotas quebradas ou inacessíveis. *(Activity: Testing, Est: 1.0h)*
  * *Descrição:* Testar navegação em todas as telas verificando ausência de crash ou loops de redirecionamento.

---

#### 🔹 [PBI-02] Componentização Reutilizável, Cards de Rotina & Clean Code
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `[FEATURE 01] Mobile Refatoração e Arquitetura UI Pet-Centric`
* **State:** `Approved`
* **Priority:** `1 - Critical`
* **Effort (Story Points):** `2`
* **Tags:** `Sprint3, Mobile, Architecture, Refactor, Components, CleanCode`

##### Descrição (História de Usuário)
> **Como** desenvolvedor mobile,  
> **Eu quero** utilizar componentes reutilizáveis para cards de rotina, barra de progresso de bem-estar do pet e formulários padronizados,  
> **Para que** o código respeite os princípios de Clean Code, DRY e modularidade.

##### Critérios de Aceite (Acceptance Criteria / Definition of Done)
- [ ] Biblioteca de componentes reutilizáveis em `src/components/`:
  - `PetScoreBar`: Barra de progresso visual do nível e bem-estar do Pet.
  - `RoutineCard`: Card de tarefa de rotina com checkbox de conclusão e badge de pontos.
  - `StreakCard`: Card de engajamento e acompanhamento da rotina.
  - `CustomButton`, `CustomInput`, `LoadingSpinner`, `EmptyState`, `Header`.
- [ ] Padronização de tipagens TypeScript em `src/types/` eliminando usos de `any` e tipos legados.
- [ ] Código limpo e desacoplado, sem duplicações de chamadas de storage ou estados redundantes.

##### Tarefas Técnicas (Child Tasks)
* **Task 2.1:** [TASK-06] Refatorar componentes `PetScoreBar` e `RoutineCard` em `src/components/`. *(Activity: Development, Est: 2.0h)*
  * *Descrição:* Criar componentes com animação suave e suporte a tema consistente.
* **Task 2.2:** [TASK-07] Padronizar componentes base (`CustomButton`, `CustomInput`, `LoadingSpinner`, `EmptyState`). *(Activity: Design, Est: 2.0h)*
  * *Descrição:* Garantir feedback tátil, tratamento de acessibilidade e estados desabilitados.
* **Task 2.3:** [TASK-08] Aplicar componentes reutilizáveis nas telas de Home, PetDetail e FamilyPet. *(Activity: Development, Est: 2.0h)*
  * *Descrição:* Substituir componentes inline pelos novos módulos compartilhados.
* **Task 2.4:** [TASK-09] Limpar código morto e organizar tipagens em `src/types/models.ts`. *(Activity: Development, Est: 1.0h)*
  * *Descrição:* Remover referências depreciadas da Sprint 1 e centralizar interfaces de domínio.

---

### 🏆 [FEATURE 02] Infraestrutura de Rede e Autenticação (Java Backend & TanStack)
* **Work Item Type:** `Feature`
* **Parent:** `[EPIC] Sprint 3 - Mobile Application Development: Arquitetura Mobile Pet-Centric, Autenticação JWT e Integração de APIs`
* **Title:** `[FEATURE 02] Infraestrutura de Rede e Autenticação (Java Backend & TanStack)`
* **Tags:** `Sprint3, Mobile, Auth, JWT, Security, TanStackQuery`
* **Start Date:** `2026-08-28`
* **Target Date:** `2026-08-30`
* **Priority:** `1 - Critical`
* **Effort (Story Points):** `6`
* **Description:** Configuração do cliente HTTP Axios integrado à API Spring Boot Java, TanStack Query Provider com cache reativo, consumo de tokens Bearer JWT emitidos pelo backend (OAuth2 Resource Server com RSA 2048-bit), interceptor de autorização e persistência atômica de sessão no AsyncStorage.

#### 🔹 [PBI-03] Configuração do Cliente HTTP Axios e TanStack Query Provider
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `[FEATURE 02] Infraestrutura de Rede e Autenticação (Java Backend & TanStack)`
* **State:** `Approved`
* **Priority:** `1 - Critical`
* **Effort (Story Points):** `3`
* **Tags:** `Sprint3, Mobile, Infra, API, JavaBackend, TanStackQuery, Axios`

##### Descrição (História de Usuário)
> **Como** desenvolvedor mobile,  
> **Eu quero** configurar o cliente HTTP Axios conectado à API Java Advanced e o TanStack Query Provider,  
> **Para que** a aplicação consuma dados reais do backend com cache reativo, loading states e injeção automática de Bearer Token.

##### Critérios de Aceite (Acceptance Criteria / Definition of Done)
- [ ] Dependências `@tanstack/react-query` e `axios` configuradas.
- [ ] Instância centralizada do Axios (`src/services/http.ts`) apontando dinamicamente para a URL da API Spring Boot (`http://10.0.2.2:8080` no Android e `http://localhost:8080` no iOS/Web).
- [ ] Interceptor de Request injetando automaticamente o header `Authorization: Bearer <token>` a partir do `AsyncStorage`.
- [ ] Interceptor de Response capturando status HTTP 401 e disparando limpeza de sessão e callback de logout.
- [ ] `QueryClientProvider` configurado na raiz da aplicação (`App.tsx`).

##### Tarefas Técnicas (Child Tasks)
* **Task 3.1:** [TASK-10] Configurar cliente Axios em `src/services/http.ts` com mapeamento dinâmico de host e interceptors de JWT. *(Activity: Development, Est: 2.0h)*
  * *Descrição:* Implementar injeção automática de Bearer token e tratamento global de erros HTTP.
* **Task 3.2:** [TASK-11] Configurar chaves centralizadas de query em `src/lib/queryKeys.ts`. *(Activity: Development, Est: 1.5h)*
  * *Descrição:* Criar fábrica de query keys para invalidação cirúrgica de cache.
* **Task 3.3:** [TASK-12] Criar contratos de response da API Java em `src/types/api.ts` (`Page<T>`). *(Activity: Development, Est: 1.5h)*
  * *Descrição:* Mapear payloads paginados e formatos de erro Spring Boot (ProblemDetails).

---

#### 🔹 [PBI-04] Sistema de Autenticação Real com JWT (OAuth2 Resource Server Java), Sessão Persistente & Rotas Protegidas
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `[FEATURE 02] Infraestrutura de Rede e Autenticação (Java Backend & TanStack)`
* **State:** `Approved`
* **Priority:** `1 - Critical`
* **Effort (Story Points):** `3`
* **Tags:** `Sprint3, Mobile, Auth, JWT, Security, Session, ProtectedRoutes`

##### Descrição (História de Usuário)
> **Como** tutor ou cuidador cadastrado no PetGuardian,  
> **Eu quero** autenticar minhas credenciais consumindo o endpoint `POST /login` e realizar cadastro via `POST /usuarios` da API Spring Boot Java,  
> **Para que** eu receba um token Bearer JWT assinado digitalmente pelo backend (OAuth2 Resource Server RSA 2048-bit), mantenha minha sessão persistida no dispositivo e acesse apenas as telas autorizadas da plataforma.

##### Critérios de Aceite (Acceptance Criteria / Definition of Done)
- [ ] Autenticação conectada à API real em Spring Boot Java:
  - **Login:** `POST /login` enviando `{ email, senha }` com retorno `{ token: string, user: UsuarioResponse }` e status HTTP 200 OK.
  - **Cadastro:** `POST /usuarios` enviando dados estruturados (`UsuarioRequest`: nome, email, senha, ddd, telefone, endereço com CEP e número) com status HTTP 201 Created.
  - Login automático ou redirecionamento para login após cadastro bem-sucedido.
- [ ] Tratamento de status HTTP 401 Unauthorized na `LoginScreen` com mensagens claras de credenciais inválidas.
- [ ] `AuthContext` e hook `useSession()` gerenciando estado global da sessão (`user`, `token`, `isAuthenticated`, `isLoading`, `login`, `register` e `logout`).
- [ ] Persistência segura da sessão via `@react-native-async-storage/async-storage` (`@PetGuardian_AuthToken`, `@PetGuardian_AuthUser` e `@PetGuardian_Logado`).
- [ ] Interceptor HTTP Axios injetando o Bearer Token no formato `Authorization: Bearer <token>` em todas as requisições autenticadas.
- [ ] Proteção de rotas no `MainStack.tsx`:
  - Usuário não autenticado: Acesso restrito a `WelcomeScreen`, `LoginScreen` e `RegisterScreen`.
  - Usuário autenticado: Acesso completo às `Tabs` (`HomeScreen`, `FamilyPetScreen`, `TrainingEducationScreen`, `ClinicsSearchScreen`, `AiAssistantScreen`, `UserProfileScreen`, `PetDetailScreen`).
- [ ] Ação de Logout no perfil que limpa o `AsyncStorage`, reseta o contexto e redireciona imediatamente para a tela inicial.

##### Tarefas Técnicas (Child Tasks)
* **Task 4.1:** [TASK-13] Criar `AuthService.ts` com chamadas `login`, `register`, `getStoredSession` e `logout`. *(Activity: Development, Est: 2.0h)*
  * *Descrição:* Centralizar requisições de autenticação e manipulação segura de tokens.
* **Task 4.2:** [TASK-14] Desenvolver `AuthContext.tsx` e hook `useSession.ts` com persistência atômica de token JWT. *(Activity: Development, Est: 2.5h)*
  * *Descrição:* Criar contexto React para difusão global do estado de sessão do usuário.
* **Task 4.3:** [TASK-15] Integrar `LoginScreen.tsx` e `RegisterScreen.tsx` com validação de formulário Zod e tratamento de 401. *(Activity: Development, Est: 2.0h)*
  * *Descrição:* Exibir mensagens de validação e feedback amigável de erro de credenciais.
* **Task 4.4:** [TASK-16] Proteger a navegação condicional no `MainStack.tsx` baseando-se em `isAuthenticated`. *(Activity: Security, Est: 1.0h)*
  * *Descrição:* Bloquear acesso a telas internas quando desautenticado.

---

### 🏆 [FEATURE 03] Integração de CRUDs Pet-Centric com Backend Java
* **Work Item Type:** `Feature`
* **Parent:** `[EPIC] Sprint 3 - Mobile Application Development: Arquitetura Mobile Pet-Centric, Autenticação JWT e Integração de APIs`
* **Title:** `[FEATURE 03] Integração de CRUDs Pet-Centric com Backend Java`
* **Tags:** `Sprint3, Mobile, CRUD, API, TanStackQuery, Domain`
* **Start Date:** `2026-08-30`
* **Target Date:** `2026-08-31`
* **Priority:** `1 - Critical`
* **Effort (Story Points):** `6`
* **Description:** Implementação de ponta a ponta das funcionalidades centrais conectadas à API Spring Boot Java via HTTP (Create, Read, Update, Delete) com dados 100% reais, estados de loading e invalidação de cache.

#### 🔹 [PBI-05] CRUD Completo 1: Gestão de Pets, Care Circle Familiar e Histórico Consolidado
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `[FEATURE 03] Integração de CRUDs Pet-Centric com Backend Java`
* **State:** `Approved`
* **Priority:** `1 - Critical`
* **Effort (Story Points):** `3`
* **Tags:** `Sprint3, Mobile, CRUD, Pets, CareCircle, PetDetail, FamilyPet, TanStackQuery`

##### Descrição (História de Usuário)
> **Como** tutor responsável pelo animal,  
> **Eu quero** cadastrar novos pets na FamilyPet, visualizar a ficha completa e histórico consolidado na PetDetail, atualizar dados, excluir pets e convidar co-cuidadores por e-mail,  
> **Para que** toda a governança e o histórico de cuidados do animal fiquem sincronizados com o backend Java.

##### Critérios de Aceite (Acceptance Criteria / Definition of Done)
- [ ] **Create:** Cadastro de pet em `FamilyPetScreen` enviando `POST /pets` com `PetRequest` (`nome`, `raca`, `idade`, `porte`, `sexo`, `castrado`, `usuarioId`).
- [ ] **Read:** Listagem paginada de pets (`GET /pets`) e consulta de histórico consolidado de tarefas concluídas (`GET /pets/{id}/historico`) na `PetDetailScreen`.
- [ ] **Update:** Edição de dados do pet via `PUT /pets/{id}` na `PetDetailScreen` com feedback de sucesso.
- [ ] **Delete:** Exclusão do pet via `DELETE /pets/{id}` com confirmação em diálogo nativo.
- [ ] **Care Circle (Governança N:N):**
  - Convite de co-cuidador via `POST /pets/{id}/cuidadores` enviando `{ responsavelPrincipalId, email }`.
  - Visualização da Rede de Cuidados agregada via `GET /usuarios/{id}/rede-cuidado`.
  - Listagem de cuidadores vinculados (`GET /pets/{id}/cuidadores`) e desvinculação (`DELETE /pets/{id}/cuidadores/{usuarioId}`).
- [ ] Invalidação automática de cache no TanStack Query após todas as mutações (`pets.all`, `users.all`, `tasks.all`).

##### Tarefas Técnicas (Child Tasks)
* **Task 5.1:** [TASK-17] Criar `PetService.ts` com métodos `getPets`, `getPetById`, `createPet`, `updatePet`, `deletePet`, `getPetHistory` e `convidarPorEmail`. *(Activity: Development, Est: 2.5h)*
  * *Descrição:* Implementar camada de serviço desacoplada para chamadas de API do Pet.
* **Task 5.2:** [TASK-18] Criar hooks `usePets.ts` (`usePets`, `usePet`, `usePetHistory`, `useCreatePet`, `useUpdatePet`, `useDeletePet`, `useInviteCaregiver`). *(Activity: Development, Est: 2.5h)*
  * *Descrição:* Encapsular React Query hooks com cache reativo e mutações.
* **Task 5.3:** [TASK-19] Desenvolver fluxo de visualização e edição na `PetDetailScreen.tsx`. *(Activity: Development, Est: 2.5h)*
  * *Descrição:* Construir tela de detalhes com edição de dados e histórico clínico de tarefas.
* **Task 5.4:** [TASK-20] Integrar cadastro e convite de familiares na `FamilyPetScreen.tsx`. *(Activity: Development, Est: 2.0h)*
  * *Descrição:* Implementar formulário de inclusão de pet e convite de co-cuidadores por e-mail.

---

#### 🔹 [PBI-06] CRUD Completo 2: Gestão de Rotina Diária, Conclusão de Tarefas & Score do Pet
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `[FEATURE 03] Integração de CRUDs Pet-Centric com Backend Java`
* **State:** `Approved`
* **Priority:** `1 - Critical`
* **Effort (Story Points):** `3`
* **Tags:** `Sprint3, Mobile, CRUD, Routine, Tasks, PetScore, Gamification, TanStackQuery`

##### Descrição (História de Usuário)
> **Como** membro da família ou co-cuidador,  
> **Eu quero** criar tarefas da rotina do pet (alimentação, medicação, passeio), concluir tarefas somando pontos ao cuidador e ao animal e visualizar meu total acumulado,  
> **Para que** os cuidados fiquem organizados e o animal mantenha uma alta pontuação de bem-estar.

##### Critérios de Aceite (Acceptance Criteria / Definition of Done)
- [ ] **Create:** Criação de nova tarefa de rotina enviando `POST /tarefas` com `TarefaRequest` (`titulo`, `descricao`, `pontosTarefa`, `prazo`, `usuarioId: null`, `petId`, `status: "PENDENTE"`).
- [ ] **Read:** Listagem de tarefas em tempo real na `HomeScreen` e `FamilyPetScreen` via `useTasks()`.
- [ ] **Update (Conclusão):** Conclusão de tarefa via `PATCH /tarefas/{id}/concluir` enviando `{ concluinteId: user.id }`, atualizando status para `CONCLUIDO` e recalculando imediatamente a barra `PetScoreBar`.
- [ ] **Delete:** Remoção de tarefa de rotina via `DELETE /tarefas/{id}` com confirmação.
- [ ] **Pontuação:** Consulta do total de pontos acumulados pelo cuidador via `GET /tarefas/by-usuario/pontos?usuarioId={id}` no perfil do usuário.
- [ ] Invalidação automática de cache do TanStack Query (`tasks.all`, `users.all`, `pets.all`).

##### Tarefas Técnicas (Child Tasks)
* **Task 6.1:** [TASK-21] Desenvolver `TaskService.ts` (`getTarefas`, `getTarefasPorUsuario`, `createTarefa`, `updateTarefa`, `concluirTarefa`, `getPontosUsuario`, `deleteTarefa`). *(Activity: Development, Est: 2.0h)*
  * *Descrição:* Implementar endpoints de tarefas e cálculo de pontuação acumulada.
* **Task 6.2:** [TASK-22] Criar hooks `useTasks.ts` (`useTasks`, `useUserTasks`, `useUserPoints`, `useCreateTask`, `useCompleteTask`, `useDeleteTask`). *(Activity: Development, Est: 2.5h)*
  * *Descrição:* Isolar operações de rotina no TanStack Query com invalidação cruzada.
* **Task 6.3:** [TASK-23] Integrar `HomeScreen.tsx` com alternância e conclusão de rotina via `useCompleteTask` e atualização do `PetScoreBar`. *(Activity: Development, Est: 2.5h)*
  * *Descrição:* Atualizar a tela inicial com listagem dinâmica de hoje e atualização instantânea de pontuação.
* **Task 6.4:** [TASK-24] Integrar criação de tarefas em `FamilyPetScreen.tsx` e exibição de pontos em `UserProfileScreen.tsx`. *(Activity: Development, Est: 2.0h)*
  * *Descrição:* Adicionar formulário de nova tarefa e card de pontuação individual do tutor.

---

### 🏆 [FEATURE 04] Documentação Técnica e Entrega da Sprint
* **Work Item Type:** `Feature`
* **Parent:** `[EPIC] Sprint 3 - Mobile Application Development: Arquitetura Mobile Pet-Centric, Autenticação JWT e Integração de APIs`
* **Title:** `[FEATURE 04] Documentação Técnica e Entrega da Sprint`
* **Tags:** `Sprint3, Mobile, Documentation, Video, Delivery`
* **Start Date:** `2026-08-31`
* **Target Date:** `2026-09-01`
* **Priority:** `2 - High`
* **Effort (Story Points):** `3`
* **Description:** Produção de documentação no repositório GitHub (README.md) com instruções de execução e gravação do vídeo demonstrativo de até 5 minutos conforme rubrica da FIAP.

#### 🔹 [PBI-07] Documentação Técnica (README.md) e Preparação do Vídeo de Apresentação
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `[FEATURE 04] Documentação Técnica e Entrega da Sprint`
* **State:** `Approved`
* **Priority:** `2 - High`
* **Effort (Story Points):** `3`
* **Tags:** `Sprint3, Mobile, Documentation, Video, Delivery`

##### Descrição (História de Usuário)
> **Como** avaliador/professor da disciplina,  
> **Eu quero** consultar uma documentação clara e assistir ao vídeo de demonstração narrado,  
> **Para que** eu possa rodar a aplicação e validar o cumprimento de todos os critérios da Sprint 3.

##### Critérios de Aceite (Acceptance Criteria / Definition of Done)
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

##### Tarefas Técnicas (Child Tasks)
* **Task 7.1:** [TASK-25] Atualizar e padronizar o `README.md` conforme especificações da disciplina. *(Activity: Documentation, Est: 1.5h)*
  * *Descrição:* Descrever arquitetura, componentes, requisitos e passo a passo de inicialização.
* **Task 7.2:** [TASK-26] Elaborar roteiro e gravar o vídeo demonstrativo em emulador/dispositivo real de até 5 min. *(Activity: Documentation, Est: 2.5h)*
  * *Descrição:* Gravar apresentação em vídeo narrado cobrindo navegação, autenticação e os 2 CRUDs reais.
* **Task 7.3:** [TASK-27] Subir o vídeo no YouTube e inserir o link no topo do README. *(Activity: Deployment, Est: 0.5h)*
  * *Descrição:* Publicar em modo não listado e validar acesso público sem restrições.

---

## 👥 5. Integrantes do Grupo e Responsabilidades (Ordem Alfabética Estrita)

| Integrante | RM | Turma | Responsabilidade Principal na Sprint 3 |
| :--- | :---: | :---: | :--- |
| **Enzo Okuizumi** | **561432** | 2TDSPG | Mobile Development (React Native), Integração TanStack Query & Coordenação Geral |
| **Gustavo Okada** | **563428** | 2TDSPG | Java Advanced (Spring Security JWT, Flyway e SOLID) & .NET Observabilidade |
| **Lucas Barros Gouveia** | **566422** | 2TDSPG | Database Advanced (PL/SQL, Funções, Procedures e Triggers DML) |
| **Luna de Carvalho Guimarães** | **562290** | 2TDSPG | Disruptive Architectures (FastAPI, IA Generativa, RAG e Chat) & Compliance |
| **Milton Marcelino** | **564836** | 2TDSPG | DevOps Tools & Cloud Computing (Azure CLI, ACR, ACI e Containers) |
