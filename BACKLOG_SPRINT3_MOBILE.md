# 📋 Backlog de Refatoração Mobile (3ª Sprint) - Azure Boards
> **Projeto:** Clyvo Vet / PetGuardian  
> **Disciplina:** Mobile Application Development (FIAP)  
> **Hierarquia:** Epic: `CLYVO VET - Plataforma Mobile` ➔ Feature: `Mobile Refactor`  
> **Estratégia de Execução:** **1º Refatoração Estrutural e Navegação** ➔ **2º Integração com API, Auth e TanStack Query**

---

## 🎯 1. Matriz de Requisitos & Critérios Avaliativos (Páginas 31 a 42)

| Critério Avaliativo | Pontos | Requisitos Obrigatórios da Banca |
| :--- | :---: | :--- |
| **Navegação entre Telas** | **5 pts** | • Mínimo de **6 telas distintas** e funcionais (sem telas vazias/duplicadas).<br>• Uso exclusivo de biblioteca oficial (`@react-navigation` ou `expo-router`), **proibido** controle manual com `useState`/`if`.<br>• Rotas explicitamente declaradas. |
| **Arquitetura & Clean Code** | **20 pts** | • Separação de responsabilidades (UI / Lógica / Camada de API).<br>• **Proibido** chamadas HTTP e regras de negócio direto nas telas.<br>• Hooks customizados isolando TanStack Query.<br>• Código limpo, tipado em TypeScript e sem duplicações (DRY). |
| **Integração com API Backend HTTP** | **35 pts** | • Requisições obrigatórias com **TanStack Query** (`useQuery`, `useMutation`).<br>• **100% dados reais da API** (proibido mocks, dados fixos ou AsyncStorage como banco).<br>• **2 funcionalidades com CRUD completo (Create, Read, Update, Delete)** na interface.<br>• Estados de **Loading** e **atualização reativa imediata** (cache invalidation). |
| **Sistema de Autenticação** | **20 pts** | • Autenticação real (Firebase Auth ou API backend Java/.NET).<br>• Fluxo completo (Login, Cadastro, Logout).<br>• **Persistência de sessão** (não deslogar ao fechar o app).<br>• **Rotas protegidas** (usuário deslogado não acessa telas internas). |
| **Documentação & Apresentação** | **20 pts** | • **README.md** com visão geral, arquitetura, stack e instruções de build/execução.<br>• **Vídeo de até 5 minutos (YouTube)** narrado demonstrando uso real, navegação, login/logout e CRUDs. |

### ⚠️ Penalidades Críticas da Avaliação
* **Aplicativo não funcional / Erro de build / Crash:** **-100 pontos (Nota Zero)**.
* **Vídeo com Figma / Protótipo ou código diferente da entrega:** **-100 pontos (Nota Zero)**.
* **Integrar com mocks / simulação com `useState` / sem PUT/DELETE:** **-20 pontos**.
* **Autenticação fake / usuário fixo no código:** **-20 pontos**.
* **Lógica concentrada nas telas (código espaguete):** **-30 pontos**.
* **Histórico de commits artificial (poucos commits gigantes):** **-50 pontos**.

---

## 📊 2. Visão Geral do Backlog (Ordenado por Sequência de Execução)

| ID do PBI | Título do PBI | Fase de Execução | Story Points | Prioridade |
| :--- | :--- | :--- | :---: | :---: |
| **PBI-01** | Reestruturação da Navegação e Validação das 6+ Telas | Fase 1: Refatoração & UI | 5 | 1 - Crítica |
| **PBI-02** | Refatoração de Código, Componentização & Clean Code | Fase 1: Refatoração & UI | 5 | 1 - Crítica |
| **PBI-03** | Configuração da Camada de API e TanStack Query Provider | Fase 2: Infraestrutura | 5 | 1 - Crítica |
| **PBI-04** | Autenticação Real, Sessão Persistente & Rotas Protegidas | Fase 2: Segurança & Auth | 8 | 1 - Crítica |
| **PBI-05** | CRUD Completo 1: Gestão de Pets (Perfil & Cadastro) | Fase 3: Integração API | 8 | 1 - Crítica |
| **PBI-06** | CRUD Completo 2: Gestão de Tarefas & Cuidados Diários | Fase 3: Integração API | 8 | 1 - Crítica |
| **PBI-07** | README.md Técnico e Roteiro de Vídeo (Máx 5 min) | Fase 4: Entrega & Docs | 3 | 2 - Alta |
| **TOTAL** | **7 PBIs / 23 Tarefas Técnicas** | — | **42 pts** | — |

---

# 🚀 3. Detalhamento dos PBIs (Copiar e Colar no Azure Boards)

---

### 🔹 [PBI-01] Reestruturação da Navegação e Validação das 6+ Telas Obrigatórias
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `Mobile Refactor`
* **Priority:** `1 - Critical`
* **Effort / Story Points:** `5`
* **Tags:** `Navigation`, `Routes`, `UI`, `Phase1`

#### Descrição (User Story)
> **Como** usuário do aplicativo,  
> **Eu quero** navegar de forma fluida, consistente e padronizada entre todas as telas do sistema,  
> **Para que** todas as 6+ telas essenciais estejam acessíveis, tipadas e configuradas explicitamente sem simulações condicionais.

#### Critérios de Aceite (Acceptance Criteria)
- [ ] O aplicativo deve possuir e manter no mínimo **6 telas distintas** e funcionais:
  1. `WelcomeScreen` (Boas-vindas / Onboarding)
  2. `LoginScreen` & `RegisterScreen` (Fluxo de Autenticação)
  3. `HomeScreen` (Painel principal com resumo diário e tarefas de hoje)
  4. `PetProfileScreen` (Detalhes, edição e perfil completo dos pets)
  5. `FamilyPetScreen` / `AddMemberScreen` (Gestão de cuidadores e recados)
  6. `DicasPetScreen` (Conteúdo e orientações veterinárias da Clyvo)
  7. `UserProfileScreen` (Perfil do usuário tutor e configurações da conta)
- [ ] A navegação deve ser exclusivamente controlada pelo **React Navigation** (`@react-navigation/native-stack` e `@react-navigation/bottom-tabs`).
- [ ] **Proibido** controle manual de telas via `useState`, `if` ou renderização condicional como substituto de rotas.
- [ ] Todas as rotas e parâmetros devem estar explicitamente tipados em `src/routes/types.ts` (`RootStackParamList`, `TabParamList`, etc.).
- [ ] Barra inferior de abas (`tabs.tsx`) com ícones corretos, indicação ativa/inativa e sem glitches visuais.

#### Tarefas Técnicas (Child Tasks)
* **Task 1.1:** Mapear e tipar todas as rotas e parâmetros do React Navigation em `src/routes/types.ts`. *(1.5h)*
* **Task 1.2:** Refatorar `MainStack.tsx` organizando a pilha de navegação principal e sub-stacks. *(2h)*
* **Task 1.3:** Refatorar `tabs.tsx` ajustando ícones, Safe Areas e estilização da barra inferior. *(1.5h)*
* **Task 1.4:** Auditar a transição entre todas as telas para garantir ausência de rotas quebradas ou inacessíveis. *(1h)*

---

### 🔹 [PBI-02] Refatoração de Código, Componentização & Clean Code
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `Mobile Refactor`
* **Priority:** `1 - Critical`
* **Effort / Story Points:** `5`
* **Tags:** `Architecture`, `Refactor`, `Components`, `CleanCode`, `Phase1`

#### Descrição (User Story)
> **Como** desenvolvedor mobile,  
> **Eu quero** refatorar os arquivos mal estruturados, isolar lógicas repetidas e criar componentes reutilizáveis,  
> **Para que** o código fique modular, legível, de fácil manutenção e em conformidade com as regras de Clean Code e SOLID.

#### Critérios de Aceite (Acceptance Criteria)
- [ ] Nenhuma tela deve ultrapassar 250 linhas de código acumulando responsabilidades de layout, validação e manipulação de estado.
- [ ] Criação e padronização da biblioteca de componentes reutilizáveis em `src/components/common/`:
  - `CustomButton`: Botão primário, secundário e com estado de loading.
  - `CustomInput`: Campo de texto com label, ícone, tratamento de erro visual e máscara.
  - `LoadingSpinner` / `SkeletonCard`: Indicador visual de carregamento.
  - `EmptyState`: Componente para quando uma lista estiver vazia.
  - `Header`: Cabeçalho padrão com botão voltar e título.
- [ ] Eliminação de códigos duplicados (DRY) em formulários, cartões e cabeçalhos.
- [ ] Padronização das tipagens TypeScript em `src/types/` eliminando usos de `any`.
- [ ] Separação clara de responsabilidades: telas concentram apenas a composição visual e eventos do usuário.

#### Tarefas Técnicas (Child Tasks)
* **Task 2.1:** Criar componentes reutilizáveis base em `src/components/common/` (`CustomButton`, `CustomInput`, `LoadingView`, `EmptyState`). *(3h)*
* **Task 2.2:** Refatorar formulários de `LoginScreen.tsx` e `RegisterScreen.tsx` utilizando os componentes reutilizáveis. *(2h)*
* **Task 2.3:** Refatorar telas principais (`HomeScreen.tsx`, `PetProfileScreen.tsx`, `FamilyPetScreen.tsx`) extraindo cards e seções em subcomponentes. *(3h)*
* **Task 2.4:** Revisar interfaces em `src/types/models.ts` e remover código morto ou não utilizado. *(1.5h)*

---

### 🔹 [PBI-03] Configuração da Camada de API e TanStack Query Provider
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `Mobile Refactor`
* **Priority:** `1 - Critical`
* **Effort / Story Points:** `5`
* **Tags:** `Infra`, `API`, `TanStackQuery`, `Phase2`

#### Descrição (User Story)
> **Como** desenvolvedor mobile,  
> **Eu quero** configurar o cliente HTTP centralizado (Axios) e o TanStack Query Provider,  
> **Para que** a aplicação realize chamadas HTTP ao backend de forma desacoplada com gerenciamento de cache, loading e refetching.

#### Critérios de Aceite (Acceptance Criteria)
- [ ] Dependências `@tanstack/react-query` e `axios` instaladas e configuradas.
- [ ] Criação de instância centralizada do Axios (`src/services/api.ts`) com base URL configurável via `.env` ou arquivo de constantes.
- [ ] Interceptor de requisições configurado para injetar automaticamente o Token JWT (`Authorization: Bearer <token>`).
- [ ] `QueryClientProvider` configurado na raiz da aplicação (`App.tsx`).
- [ ] Camada de serviços organizada (`src/services/`) desacoplada da camada de apresentação (UI).

#### Tarefas Técnicas (Child Tasks)
* **Task 3.1:** Instalar dependências `@tanstack/react-query` e `axios` no `package.json`. *(1h)*
* **Task 3.2:** Criar cliente Axios em `src/services/api.ts` com interceptors de Request e Response. *(2h)*
* **Task 3.3:** Configurar `QueryClient` e envolver a aplicação no `QueryClientProvider` em `App.tsx`. *(1h)*
* **Task 3.4:** Criar tipagens para responses da API (`ApiResponse<T>`, `ErrorResponse`). *(1h)*

---

### 🔹 [PBI-04] Sistema de Autenticação Real, Sessão Persistente e Proteção de Rotas
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `Mobile Refactor`
* **Priority:** `1 - Critical`
* **Effort / Story Points:** `8`
* **Tags:** `Auth`, `Security`, `Phase2`

#### Descrição (User Story)
> **Como** tutor ou cuidador cadastrado,  
> **Eu quero** realizar login, cadastro e logout com persistência de sessão e proteção de rotas,  
> **Para que** meus dados fiquem seguros e eu permaneça conectado ao fechar e reabrir o aplicativo.

#### Critérios de Aceite (Acceptance Criteria)
- [ ] Autenticação conectada a um serviço real (API backend em Java/.NET ou Firebase Auth).
- [ ] **Proibido** login simulado com `AsyncStorage` contendo usuários ou validações fixas.
- [ ] `AuthContext` e custom hook `useAuth()` gerenciando os estados: `user`, `token`, `isAuthenticated`, `isLoadingAuth`.
- [ ] Persistência segura do token de sessão via `@react-native-async-storage/async-storage`.
- [ ] Rotas privadas acessíveis somente quando autenticado (navegador alterna automaticamente entre `AuthStack` e `AppStack`).
- [ ] Função de Logout ativa que limpa o token/storage e redireciona imediatamente para o Login.

#### Tarefas Técnicas (Child Tasks)
* **Task 4.1:** Criar `AuthService.ts` com endpoints de `login`, `register`, `me` e `logout`. *(2h)*
* **Task 4.2:** Criar `AuthContext.tsx` e custom hook `useAuth.ts`. *(3h)*
* **Task 4.3:** Integrar `LoginScreen.tsx` e `RegisterScreen.tsx` com `useAuth` e validação Zod. *(3h)*
* **Task 4.4:** Proteger a navegação no `MainStack.tsx` baseando-se no estado `isAuthenticated`. *(2h)*
* **Task 4.5:** Implementar ação de Logout em `UserProfileScreen.tsx`. *(1h)*

---

### 🔹 [PBI-05] CRUD Completo da Entidade 1: Gestão de Pets (Perfil & Cadastro de Pet)
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `Mobile Refactor`
* **Priority:** `1 - Critical`
* **Effort / Story Points:** `8`
* **Tags:** `CRUD`, `Pets`, `API`, `TanStackQuery`, `Phase3`

#### Descrição (User Story)
> **Como** tutor de animais,  
> **Eu quero** cadastrar, listar, atualizar e excluir os pets da minha família através do app conectado à API,  
> **Para que** o histórico de saúde, vacinas e dados do pet fiquem salvos e sincronizados no backend.

#### Critérios de Aceite (Acceptance Criteria)
- [ ] **Create:** Cadastro de novo pet enviando requisição POST para a API.
- [ ] **Read:** Listagem e detalhes do pet em `PetProfileScreen` consumindo GET via `useQuery`.
- [ ] **Update:** Edição de dados do pet (nome, peso, raça, idade, vacinas) via PUT/PATCH com `useMutation`.
- [ ] **Delete:** Exclusão do pet via DELETE com `useMutation` e diálogo de confirmação.
- [ ] Invalidação automática de cache (`queryClient.invalidateQueries({ queryKey: ['pets'] })`) após mutações.
- [ ] Exibição de estados visuais de `loading` e feedback de erro/sucesso.

#### Tarefas Técnicas (Child Tasks)
* **Task 5.1:** Criar `PetService.ts` com chamadas HTTP (`getPets`, `getPetById`, `createPet`, `updatePet`, `deletePet`). *(2h)*
* **Task 5.2:** Criar custom hook `usePets.ts` encapsulando queries e mutations do TanStack Query. *(2h)*
* **Task 5.3:** Refatorar `PetProfileScreen.tsx` para consumir exclusivamente o hook `usePets`. *(3h)*
* **Task 5.4:** Implementar modais/fluxos de cadastro, edição e exclusão de pets com feedback visual. *(2h)*

---

### 🔹 [PBI-06] CRUD Completo da Entidade 2: Gestão de Tarefas e Cuidados Diários
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `Mobile Refactor`
* **Priority:** `1 - Critical`
* **Effort / Story Points:** `8`
* **Tags:** `CRUD`, `Tasks`, `API`, `TanStackQuery`, `Phase3`

#### Descrição (User Story)
> **Como** membro da família/cuidador,  
> **Eu quero** adicionar novas tarefas de cuidados (alimentação, remédio, passeio), listar, alterar status e remover tarefas,  
> **Para que** toda a família colabore em tempo real com a rotina do pet.

#### Critérios de Aceite (Acceptance Criteria)
- [ ] **Create:** Criação de nova tarefa de cuidado enviando POST para a API.
- [ ] **Read:** Listagem das tarefas de hoje na `HomeScreen` e histórico em `FamilyPetScreen` via `useQuery`.
- [ ] **Update:** Atualização de status (concluída/pendente) e edição de horário via PUT/PATCH com `useMutation`.
- [ ] **Delete:** Remoção de tarefa via DELETE com `useMutation`.
- [ ] Substituir o `TaskService.ts` legado por chamadas HTTP REST reais.
- [ ] Atualização automática da lista na interface após qualquer alteração.

#### Tarefas Técnicas (Child Tasks)
* **Task 6.1:** Refatorar `TaskService.ts` para realizar chamadas REST completas (GET, POST, PUT, DELETE). *(2h)*
* **Task 6.2:** Refatorar `useHome.ts` / criar `useTasks.ts` integrando com TanStack Query. *(3h)*
* **Task 6.3:** Atualizar `HomeScreen.tsx` e `FamilyPetScreen.tsx` para exibir dados reativos da API. *(3h)*
* **Task 6.4:** Implementar exclusão e edição de tarefas pela interface. *(2h)*

---

### 🔹 [PBI-07] Documentação Técnica (README.md) e Preparação do Vídeo de Apresentação
* **Work Item Type:** `Product Backlog Item`
* **Parent Feature:** `Mobile Refactor`
* **Priority:** `2 - High`
* **Effort / Story Points:** `3`
* **Tags:** `Documentation`, `Video`, `Delivery`, `Phase4`

#### Descrição (User Story)
> **Como** avaliador/professor da disciplina,  
> **Eu quero** consultar uma documentação clara e assistir ao vídeo de demonstração,  
> **Para que** eu possa rodar a aplicação e validar o cumprimento de todos os critérios da Sprint 3.

#### Critérios de Aceite (Acceptance Criteria)
- [ ] `README.md` completo contendo:
  - Descrição do problema da Clyvo Vet e solução do PetGuardian.
  - Tecnologias e bibliotecas utilizadas (React Native, Expo, TanStack Query, Axios, React Navigation, etc.).
  - Instruções de build e execução (`npm install`, configuração da URL da API, `npx expo start`).
  - Link público/não-listado do YouTube para o vídeo de apresentação.
- [ ] Roteiro e vídeo de apresentação (máximo 5 minutos) contemplando:
  1. Apresentação do projeto e stack.
  2. Demonstração do fluxo de Login/Cadastro e persistência de sessão.
  3. Navegação pelas 6+ telas.
  4. Demonstração dos 2 CRUDs completos em funcionamento real com a API.
  5. Logout e bloqueio imediato das telas protegidas.

#### Tarefas Técnicas (Child Tasks)
* **Task 7.1:** Atualizar e padronizar o `README.md` conforme especificações da página 38. *(2h)*
* **Task 7.2:** Elaborar roteiro e gravar o vídeo demonstrativo em emulador/dispositivo real de até 5 min. *(3h)*
* **Task 7.3:** Subir o vídeo no YouTube e inserir o link no topo do README. *(0.5h)*
