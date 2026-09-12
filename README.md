# 🐾 PetGuardian — Mobile Application Development

> **Arquitetura Pet-Centric, Governança Familiar Colaborativa & Autenticação JWT Real**  
> *Aplicativo mobile corporativo desenvolvido para a 3ª Sprint do Challenge Clyvo 2026 (2TDSPG - FIAP).*

---

## 👥 Equipe de Desenvolvimento 

| Nome | RM | GitHub | LinkedIn |
| :--- | :---: | :---: | :--- |
| **Enzo Okuizumi** | **561432** | [EnzoOkuizumiFiap](https://github.com/EnzoOkuizumiFiap) | [LinkedIn](https://www.linkedin.com/in/enzo-okuizumi-b60292256/) |
| **Gustavo Okada** | **563428** | [Gdev3356](https://github.com/Gdev3356) | [LinkedIn](https://www.linkedin.com/in/gustavo-okada-53a3b8359/) |
| **Lucas Barros Gouveia** | **566422** | [LuzBGouveia](https://github.com/LuzBGouveia) | [LinkedIn](https://www.linkedin.com/in/lucas-barros-gouveia-09b147355/) |
| **Luna de Carvalho Guimarães** | **562290** | [lunaguima](https://github.com/lunaguima) | [LinkedIn](https://www.linkedin.com/in/luna-guimar%C3%A3es-b0ba82309/) |
| **Milton Marcelino** | **564836** | [MiltonMarcelino](https://github.com/MiltonMarcelino) | [LinkedIn](http://linkedin.com/in/milton-marcelino-250298142) |

---

## 🔗 Repositório GitHub e Vídeo de Demonstração

[Repositório GitHub Oficial](https://github.com/Challenge-Pet-Guardian-3/Mobile-Application-Development) | [Vídeo de Demonstração]()

---

## 📱 1. Visão Geral do Projeto & Arquitetura Pet-Centric

O **PetGuardian** é um aplicativo mobile desenvolvido em **React Native com Expo e TypeScript**, conectado diretamente à **API RESTful corporativa em Spring Boot (Java Advanced)** e ao **microsserviço de Inteligência Artificial Preventiva em FastAPI (Python / Google Gemini no Render)**.

O aplicativo centraliza o cuidado, a saúde e a gamificação no próprio animal, permitindo que os membros da família sincronizem a rotina diária, acessem prontuários clínicos e histórico consolidado, treinem seus animais em trilhas educativas interativas e conversem com a assistente de inteligência artificial preventiva (Guardian AI).

Estruturado estritamente sob as diretrizes da **Mentoria Clyvo 2026**, o ecossistema supera os modelos tradicionais focados em clínicas burocráticas, estabelecendo a **Arquitetura Pet-Centric**:

```text
       ┌─────────────────────────────────────────────────────────────┐
       │                   ECOSSISTEMA PETGUARDIAN                   │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
  ┌──────────────┐             ┌──────────────┐             ┌──────────────┐
  │   O TUTOR    │             │  A FAMÍLIA   │             │    O PET     │
  └──────┬───────┘             └──────┬───────┘             └──────┬───────┘
         │                            │                            │
  • Onboarding                 • Care Circle (N:N)          • Prontuário clínico
  • Login JWT com RSA          • Co-cuidadores por e-mail   • Score consolidado
  • Hardware Seguro            • Delegação de tarefas       • Trilhas didáticas
  • Perfil & Pontuação         • Visão agregada da rede     • Prevenção ativa IA
```

---

## 🖥️ 3. Explicação das Telas do Aplicativo

O aplicativo é composto por **9 telas exclusivas, ricas e funcionais**, organizadas entre rotas públicas (`AuthStack`) e rotas privadas protegidas (`AppTabs`):

### 🔓 Telas Públicas (`AuthStack`)

#### 1. `WelcomeScreen` (Boas-Vindas & Onboarding)
* **Objetivo:** Ponto de entrada do aplicativo, apresentando a proposta de valor e a governança familiar Pet-Centric.
* **Funcionalidades:**
  * Apresentação visual da plataforma com identidade gráfica moderna.
  * Botões de navegação direta para `LoginScreen` e `RegisterScreen`.
  * Roteamento seguro sem permitir transição antecipada para telas protegidas.

#### 2. `LoginScreen` (Autenticação Real com Spring Boot)
* **Objetivo:** Autenticação de credenciais corporativas do tutor.
* **Funcionalidades:**
  * Formulário controlado com campos `email` e `senha` validados via **Zod** (`LoginSchema`).
  * Envio de requisição real `POST /login` para a API Spring Boot Java.
  * Recebimento do token JWT assinado via **RSA 2048-bit** e dos dados do tutor (`UsuarioResponse`).
  * Gravação atômica do token e do e-mail no **hardware seguro do celular (`expo-secure-store`)**.
  * Tratamento amigável de erro `401 Unauthorized` ("E-mail ou senha incorretos") e feedback visual de loading via `ActivityIndicator`.

#### 3. `RegisterScreen` (Onboarding do Tutor com ViaCEP)
* **Objetivo:** Cadastro de novos tutores no ecossistema PetGuardian.
* **Funcionalidades:**
  * Formulário abrangente validado pelo `RegisterSchema` (Zod): nome completo, e-mail, senha forte, confirmação de senha, DDD, telefone, CEP e número residencial.
  * **Integração com ViaCEP:** O preenchimento automático do endereço ocorre de forma declarativa e transparente.
  * Envio de payload estruturado via `POST /usuarios`.
  * Login automático e transição suave para as rotas protegidas após o sucesso do cadastro.

---

### 🔒 Telas Protegidas (`AppTabs`)

#### 4. `HomeScreen` (Dashboard Pet-Centric do Pet Ativo)
* **Objetivo:** Painel centralizado do tutor e da família com foco exclusivo no animal ativo.
* **Funcionalidades:**
  * **Seletor de Pet Ativo:** Alternância rápida entre os animais da família cadastrados na API.
  * **`PetScoreBar`:** Barra de progresso animada calculando o bem-estar e o nível gamificado do pet com base na somatória real de tarefas e aulas concluídas (`GET /pets/{id}/pontos`).
  * **Rotina Diária:** Listagem de tarefas do dia via TanStack Query (`GET /tarefas/by-usuario`), com cards informando título, horário, prazo e pontuação.
  * **Conclusão em 1 Toque:** Conclusão de tarefas via `PATCH /tarefas/{id}/concluir`, com vibração tátil, atualização reativa do score e estorno instantâneo via `PATCH /tarefas/{id}/desmarcar`.
  * **`StreakCard`:** Indicador de ofensiva diária incentivando a consistência dos cuidados.
  * **Atalho Rápido:** Acesso direto à Assistente de Inteligência Artificial Preventiva.

#### 5. `FamilyPetScreen` (Gestão Familiar & Care Circle)
* **Objetivo:** Governança colaborativa de pets e tarefas familiares compartilhadas.
* **Funcionalidades:**
  * **Listagem Familiar:** Exibição de todos os pets sob tutela do usuário ou de seus co-cuidadores via `GET /pets/by-usuario`.
  * **Cadastro de Pet (CRUD 1 - Create):** Modal com formulário completo para inclusão de novo animal (`POST /pets`), vinculando automaticamente o usuário criador como Responsável Principal.
  * **Criação de Tarefas da Rotina (CRUD 2 - Create):** Modal de cadastro de novas rotinas (`POST /tarefas`) definindo título, descrição, prazo, pontuação e pet associado.
  * **Care Circle (Convite de Co-cuidadores):** Funcionalidade para convidar familiares por e-mail (`POST /pets/{id}/cuidadores`), permitindo que mais membros acompanhem a rotina do animal.

#### 6. `PetDetailScreen` (Prontuário Clínico & Gestão Completa do Pet)
* **Objetivo:** Página dedicada individual do pet com histórico consolidado e operações completas de CRUD.
* **Funcionalidades:**
  * **Ficha Cadastral Completa:** Exibição de nome, raça, porte, sexo, castração e idade calculada dinamicamente com base na data de nascimento.
  * **Edição de Dados (CRUD 1 - Update):** Atualização dos dados do pet via `PUT /pets/{id}` com formulário modal e validação.
  * **Exclusão de Pet (CRUD 1 - Delete):** Remoção definitiva do animal via `DELETE /pets/{id}`, com confirmação prévia em modal nativo (restrito ao responsável principal).
  * **Histórico Clínico e de Cuidados:** Visualização consolidada de eventos clínicos (vacinas, consultas, exames) obtidos em tempo real via `GET /pets/{id}/historico` e `GET /historicos/pet/{petId}`.
  * **Adicionar Histórico:** Registro de novas intervenções clínicas e preventivas (`POST /historicos`).

#### 7. `TrainingEducationScreen` (Trilhas Educativas Gamificadas)
* **Objetivo:** Capacitação dos tutores através de trilhas interativas de adestramento e boas práticas veterinárias (estilo Duolingo).
* **Funcionalidades:**
  * Listagem dinâmica de trilhas associadas ao pet ativo (`GET /trilhas/pet/{petId}`).
  * Módulos temáticos (`GET /modulos/trilha/{trilhaId}`) e lições didáticas (`GET /aulas/modulo/{moduloId}`).
  * Passo a passo com instruções práticas de adestramento e cuidados comportamentais.
  * **Conclusão Didática:** Marcação de aula como finalizada via `PATCH /aulas/{id}/concluir`, creditando pontos educativos diretamente ao score de bem-estar do pet no backend Java.

#### 8. `AiAssistantScreen` (Guardian AI — Triagem Clínica Preventiva)
* **Objetivo:** Assistente virtual inteligente de orientação preventiva e apoio emergencial aos tutores.
* **Funcionalidades:**
  * Conectada ao microsserviço Python FastAPI (`/ai/chat`) com **Google Gemini 3.5**.
  * **Contexto Clínico Automático:** A IA recebe a idade, o porte, o sexo e o status de castração do animal ativo para respostas altamente personalizadas.
  * **Bloqueio de Automedicação Letal:** Identificação de substâncias humanas proibidas (Paracetamol, Ibuprofeno, Dipirona) com alerta visual imediato de emergência e recomendação de busca a atendimento veterinário 24h.
  * **Insights Preventivos:** Geração de cartões de recomendação nutricional e de atividade física adaptados ao porte e idade (`POST /ai/insights`).
  * **Histórico Conversacional Estilo LLM (`AiHistoryModal`):** Navegação e recuperação de conversas anteriores do pet no padrão consagrado de mercado (estilo ChatGPT/Claude), permitindo carregar mensagens anteriores e retomar o contexto ativo.
  * **Gestão Ágil de Sessões:** Exclusão direta de conversas passadas via botão de lixeira no modal e botão "Nova Conversa" para iniciar uma nova interação clínica limpa.
  * **Foco Clínico Exclusivo:** Ausência deliberada de gamificação (sem pontuação de XP por uso do chat), priorizando a segurança e a sobriedade médica veterinária.

#### 9. `UserProfileScreen` (Perfil do Tutor, Gamificação & Sessão)
* **Objetivo:** Gestão cadastral do tutor, consulta de score acumulado e controle de logout seguro.
* **Funcionalidades:**
  * Exibição dos dados do usuário autenticado (Nome, E-mail, Perfil RBAC, Telefone formatado e Endereço).
  * **Score Gamificado Real:** Consulta da pontuação total acumulada pelo tutor em toda a sua jornada de cuidados (`GET /tarefas/by-usuario/pontos`).
  * Suporte com seção de Perguntas Frequentes (FAQ).
  * **Logout Seguro:** Limpeza atômica do Token JWT e e-mail no hardware seguro (`StorageService.clearAuthSession()`), invalidação de todas as consultas em memória do `QueryClient` e redirecionamento instantâneo para a tela inicial.

---

## 📋 4. Catálogo de Endpoints da API Integrados por Grupo

### Grupo 1: Autenticação & Restauração de Sessão
| Método | Endpoint | Finalidade no Mobile | Camada / Service |
| :---: | :--- | :--- | :--- |
| `POST` | `/login` | Autenticação com e-mail/senha; emite Token JWT assinado com RSA e perfil do usuário | `AuthService.login` |
| `GET` | `/usuarios/by-email` | Restaura a sessão ao reabrir o app utilizando o e-mail persistido no hardware seguro | `AuthService.getStoredSession` |
| `POST` | `/usuarios` | Onboarding de novos tutores com integração de CEP ao ViaCEP | `AuthService.register` |

### Grupo 2: Gestão de Pets & Pontuação de Bem-Estar (CRUD 1)
| Método | Endpoint | Finalidade no Mobile | Camada / Service |
| :---: | :--- | :--- | :--- |
| `GET` | `/pets/by-usuario` | Listagem dos pets vinculados ao tutor logado (como titular ou co-cuidador) | `PetService.getPetsPorUsuario` |
| `GET` | `/pets/{id}` | Busca os detalhes completos de um pet específico | `PetService.getPetById` |
| `GET` | `/pets/{id}/pontos` | Obtém o score consolidado de bem-estar do pet (rotinas + aulas) para o `PetScoreBar` | `PetService.getPetPontos` |
| `POST` | `/pets` | **[Create]** Cadastra novo pet e vincula o criador como responsável principal | `PetService.createPet` |
| `PUT` | `/pets/{id}` | **[Update]** Atualiza dados cadastrais do pet (porte, data de nascimento, castração) | `PetService.updatePet` |
| `DELETE`| `/pets/{id}` | **[Delete]** Exclui o pet do sistema (operação autorizada apenas ao titular) | `PetService.deletePet` |

### Grupo 3: Governança Familiar & Care Circle
| Método | Endpoint | Finalidade no Mobile | Camada / Service |
| :---: | :--- | :--- | :--- |
| `GET` | `/pets/{id}/cuidadores` | Lista todos os co-cuidadores e familiares vinculados ao animal | `PetService.getCuidadores` |
| `POST` | `/pets/{id}/cuidadores` | Convida um novo membro da família informando seu e-mail cadastrado | `PetService.convidarPorEmail` |
| `DELETE`| `/pets/{id}/cuidadores/{uId}` | Desvincula um co-cuidador da rede de cuidado do animal | `PetService.desvincularCuidador` |
| `PATCH`| `/pets/{id}/responsavel-principal` | Transfere atomicamente a titularidade principal para outro cuidador | `PetService.transferirResponsabilidade` |
| `GET` | `/usuarios/{id}/rede-cuidado` | Visão agregada completa da família: pets, co-cuidadores e tarefas | `UserService.getRedeCuidado` |

### Grupo 4: Rotinas, Tarefas & Gamificação (CRUD 2)
| Método | Endpoint | Finalidade no Mobile | Camada / Service |
| :---: | :--- | :--- | :--- |
| `GET` | `/tarefas/by-usuario` | Lista as tarefas de rotina do usuário com suporte a auto-expiração inteligente | `TaskService.getTarefasPorUsuario` |
| `GET` | `/tarefas/by-pet/{petId}` | Lista todas as tarefas ativas associadas a um animal | `TaskService.getTarefasPorPet` |
| `POST` | `/tarefas` | **[Create]** Agenda nova rotina (alimentar, medicar, passear) para o pet | `TaskService.createTarefa` |
| `PUT` | `/tarefas/{id}` | **[Update]** Edita parâmetros e prazos de uma tarefa existente | `TaskService.updateTarefa` |
| `PATCH`| `/tarefas/{id}/concluir` | **[Update]** Conclui a rotina, soma pontos ao tutor e atualiza a pontuação do pet | `TaskService.concluirTarefa` |
| `PATCH`| `/tarefas/{id}/desmarcar` | **[Update]** Desmarca a conclusão, retorna para `PENDENTE` e estorna os pontos | `TaskService.desmarcarTarefa` |
| `DELETE`| `/tarefas/{id}` | **[Delete]** Remove uma tarefa da rotina do pet | `TaskService.deleteTarefa` |
| `GET` | `/tarefas/by-usuario/pontos` | Retorna o total de pontos acumulados pelo cuidador para exibição no perfil | `TaskService.getPontosUsuario` |

### Grupo 5: Prontuário Clínico & Histórico de Saúde
| Método | Endpoint | Finalidade no Mobile | Camada / Service |
| :---: | :--- | :--- | :--- |
| `GET` | `/pets/{id}/historico` | Histórico consolidado de tarefas cumpridas e marcos de saúde | `PetService.getPetHistory` |
| `GET` | `/historicos/pet/{petId}` | Prontuário médico com registros clínicos de vacinas, exames e consultas | `HistoricoService.getHistoricosByPetId` |
| `POST` | `/historicos` | Cadastra novo evento de saúde no prontuário do animal | `HistoricoService.createHistorico` |
| `PUT` | `/historicos/{id}` | Atualiza informações de um registro clínico prévio | `HistoricoService.updateHistorico` |
| `DELETE`| `/historicos/{id}` | Remove um evento do prontuário médico | `HistoricoService.deleteHistorico` |

### Grupo 6: Trilhas Educativas de Adestramento
| Método | Endpoint | Finalidade no Mobile | Camada / Service |
| :---: | :--- | :--- | :--- |
| `GET` | `/trilhas/pet/{petId}` | Lista as trilhas de treinamento ativas atribuídas ao pet | `TrainingService.getTrilhas` |
| `GET` | `/modulos/trilha/{trilhaId}`| Carrega os módulos temáticos de uma trilha educativa | `TrainingService.getTrilhas` |
| `GET` | `/aulas/modulo/{moduloId}` | Carrega as lições práticas de adestramento do módulo | `TrainingService.getTrilhas` |
| `PATCH`| `/aulas/{id}/concluir` | Conclui lição educativa e soma pontos educacionais ao score do pet | `TrainingService.concluirLicao` |
| `PATCH`| `/aulas/{id}/desmarcar` | Desmarca lição e estorna os pontos de aprendizado do animal | `TrainingService.desmarcarLicao` |

### Grupo 7: Inteligência Artificial Preventiva & Sessões SQLite (Guardian AI / FastAPI Render)
| Método | Endpoint | Finalidade no Mobile | Camada / Service |
| :---: | :--- | :--- | :--- |
| `POST` | `/ai/chat` | Chat conversacional com Google Gemini recebendo o contexto do pet e sessionId | `AiService.enviarMensagem` |
| `POST` | `/ai/insights` | Análise preditiva e recomendações de bem-estar personalizadas por idade e porte | `AiService.getInsightsDoPet` |
| `GET` | `/ai/sessions` | Listagem de conversas anteriores do pet agrupadas por sessão (estilo ChatGPT/Claude) | `AiService.getSessoesDoPet` |
| `GET` | `/ai/history` | Recuperação das mensagens de uma conversa pelo ID da sessão para restaurar o chat | `AiService.getMensagensDaSessao` |
| `DELETE` | `/ai/sessions/{id}` | Exclusão permanente de uma conversa selecionada do histórico SQLite | `AiService.excluirSessao` |
| `GET` | `/` | Warm-up inteligente de cold-start da instância no Render | `AiService.ping` |

---

## 🏛️ 5. Arquitetura de Software e Organização de Diretórios

O projeto segue rigorosamente o princípio de separação de responsabilidades (Clean Architecture / SOLID / DRY), garantindo desacoplamento entre componentes de interface e regras de comunicação:

```text
src/
├── components/          → Componentes visuais atômicos e reutilizáveis (PetScoreBar, RoutineCard, StreakCard, Header, etc.)
├── config/              → Variáveis de ambiente dinâmicas com fallback para localhost e emuladores (env.ts)
├── constants/           → Tokens de design system, tipografia e paleta de cores institucional/gamificada (theme.ts com trainingPalette)
├── contexts/            → Gestão global de sessão e autenticação de usuários (AuthContext.tsx)
├── hooks/               → Custom hooks isolando TanStack Query, mutations, invalidações e formulários:
│   ├── useSession.ts    → Hook para consumo simplificado do estado de autenticação e dados do tutor
│   ├── usePets.ts       → Queries e mutations reativas de pets, histórico e co-cuidadores
│   ├── useTasks.ts      → Queries e mutations de tarefas da rotina, conclusão e pontuação
│   ├── useTrainings.ts  → Queries e mutations de trilhas e aulas educativas
│   ├── useUsers.ts      → Queries de perfil, dados de contato e visão agregada da rede
│   ├── useAiAssistant.ts → Hooks de integração com a IA (useAiChat, useAiInsights, useAiWarmup)
│   ├── useAiAssistantScreen.ts → Hook orquestrador de estado de tela, modal de histórico e pet ativo
│   ├── useLoginForm.ts  → Gerenciamento do formulário de login com validação Zod
│   └── useRegisterForm.ts → Gerenciamento do formulário de cadastro com validação Zod
├── lib/                 → Configurações de infraestrutura local:
│   ├── queryClient.ts   → Instância centralizada do QueryClient (TanStack Query) com cache padrão
│   └── queryKeys.ts     → Fábrica de chaves de query hierárquicas para invalidação cirúrgica de cache
├── routes/              → Configuração de rotas nativas com tipagens estritas:
│   ├── MainStack.tsx    → Roteador raiz condicional (exibe AuthStack se deslogado ou AppTabs se autenticado)
│   ├── tabs.tsx         → Navegação inferior por abas (Home, Família, Treino, IA, Perfil)
│   └── types.ts         → Tipagens estritas de parâmetros de todas as rotas da aplicação
├── screens/             → Telas da aplicação com responsabilidade focada exclusivamente na interface:
│   ├── Welcome/         → Tela de boas-vindas
│   ├── Login/           → Tela de login com validação de formulário
│   ├── Register/        → Tela de cadastro de usuário com busca ViaCEP
│   ├── Home/            → Dashboard central com seletor de pet e rotinas do dia
│   ├── FamilyPet/       → Gestão familiar de múltiplos pets e convite de cuidadores
│   ├── PetDetail/       → Ficha clínica, histórico de saúde e operações de CRUD do pet
│   ├── TrainingEducation/ → Trilhas educativas interativas e aulas de adestramento
│   ├── AiAssistant/     → Chat conversacional com IA Preventiva e triagem de sintomas
│   └── UserProfile/     → Perfil do tutor, extrato de pontuação real e logout
├── services/            → Camada de integração externa e hardware seguro:
│   ├── http.ts          → Cliente Axios centralizado com injeção de Bearer Token e interceptor global 401
│   ├── storage.ts       → Persistência no hardware seguro (expo-secure-store no Keychain/Keystore)
│   ├── auth.ts          → Métodos de login, cadastro, restore de sessão e logout
│   ├── pets.ts          → Serviços REST de pets, score e cuidadores
│   ├── tasks.ts         → Serviços REST de tarefas de rotina e gamificação
│   ├── users.ts         → Serviços REST de tutores e rede de cuidado
│   ├── historico.ts     → Serviços REST de prontuário clínico e eventos de saúde
│   ├── trainings.ts     → Serviços REST de trilhas e aulas didáticas
│   └── ai.ts            → Serviços REST do microsserviço Python de IA Preventiva no Render
├── types/               → Tipagens TypeScript estritas espelhando a API Java (zero any)
└── utils/               → Schemas Zod (schemas.ts), cálculo de idade, helpers de domínio e trilhas (trainingUtils.ts)
```

---

## 🔐 6. Segurança, Hardware Seguro e Tratamento de Sessão

Em total atendimento aos critérios da Sprint 3:
* **Zero Dados Mockados:** O aplicativo conecta-se com a API real Spring Boot no Railway (`https://java-advanced-production-35ab.up.railway.app`) ou em `localhost:8080`.
* **Hardware Seguro (`expo-secure-store`):**
  * O token JWT emitido com criptografia assimétrica RSA e o e-mail identificador são persistidos exclusivamente nas camadas nativas de hardware seguro: **Keychain (iOS)** e **Keystore (Android)**.
  * O aplicativo **não utiliza AsyncStorage para credenciais**, garantindo proteção contra ataques de extração de dados locais.
* **Injeção de Bearer Token:** O interceptor em [http.ts](./src/services/http.ts) injeta automaticamente `Authorization: Bearer <token>` em todas as requisições autenticadas.
* **Tratamento Global de Expiração (401 Unauthorized):**
  * Quando o token expira (tempo de vida de 1 hora configurado no Spring Security), o interceptor de resposta captura o status `401`.
  * A sessão é limpa de forma atômica no hardware seguro (`StorageService.clearAuthSession()`).
  * O estado global do `AuthContext` é resetado para `null`, invalidando o cache do `QueryClient` e redirecionando o usuário de volta à tela de login de forma automática e segura.

---

## 📦 7. Tecnologias Utilizadas e Versões Oficiais

| Tecnologia | Versão | Finalidade Técnica no Projeto |
|---|---|---|
| **React Native** | 0.86.3 | Framework oficial multiplataforma para execução mobile nativa |
| **Expo** | ~57.0.20 | Ambiente corporativo de desenvolvimento, execução e build nativo |
| **TypeScript** | ~6.0.3 | Tipagem estrita de contratos de domínio, interfaces e navegação |
| **expo-secure-store** | ~57.0.3 | Módulo de armazenamento criptografado no hardware nativo do aparelho |
| **TanStack React Query**| ^5.102.6 | Gestão de cache assíncrono, estados de loading e invalidações de mutação |
| **Axios** | ^1.20.0 | Cliente HTTP com suporte completo a interceptors de requisição e resposta |
| **React Navigation** | ^7.x | Navegação nativa declarativa (`@react-navigation/native-stack` e `@react-navigation/bottom-tabs`) |
| **React Context API** | Nativo | Provedor de contexto global para estado de sessão autenticada (`AuthContext`) |
| **Zod** | ^4.4.3 | Validação declarativa e fortemente tipada de formulários e schemas |
| **React Hook Form** | ^7.75.0 | Gerenciamento de alta performance para formulários controlados |
| **React Native Reanimated** | 4.5.1 | Biblioteca de animações a 60fps na thread de UI nativa |
| **@expo/vector-icons** | ^15.0.2 | Biblioteca de ícones vetoriais nativos |

---

## 🚀 8. Instruções de Execução

### Pré-requisitos
1. **Node.js** (versão 18+ LTS) e **npm** instalados.
2. Aplicativo **Expo Go** instalado no smartphone físico ou emulador Android/iOS configurado.
3. Backend Java (`Java-Advanced`) em execução na porta `8080` (ou conectado ao Railway em nuvem).

### Execução

```bash
# 1. Acesse o diretório da aplicação mobile
cd Mobile-Application-Development

# 2. Instale as dependências oficiais
npm install

# 3. Inicie o servidor de desenvolvimento do Expo
npx expo start
```

* **No Emulador Android:** Pressione `a` no terminal.
* **No Simulador iOS:** Pressione `i` no terminal.
* **No Smartphone Físico:** Abra a câmera (iOS) ou o app **Expo Go** (Android) e escaneie o QR Code gerado no terminal.