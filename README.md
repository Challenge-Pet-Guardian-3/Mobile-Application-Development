# 🐾 PetGuardian — Mobile Application Development

> **Arquitetura Pet-Centric & Cuidado Familiar Colaborativo**  
> *Projeto desenvolvido para a 3ª Sprint do Challenge Clyvo 2026 (FIAP — 2TDSPG).*

---

## 🔗 Repositório GitHub e Vídeo de Demonstração

[Repositório GitHub](https://github.com/Challenge-Pet-Guardian-3/Mobile-Application-Development) | [Vídeo de Demonstração no YouTube]()

---

## 📱 Sobre o Projeto

O **PetGuardian** é um aplicativo mobile desenvolvido em **React Native com Expo e TypeScript**, integrado à **API RESTful Spring Boot (Java Advanced)** e estruturado sob as diretrizes da **Arquitetura Pet-Centric (Mentoria Clyvo 2026)**.

O aplicativo centraliza o cuidado, a saúde e a gamificação no próprio animal, permitindo que os membros da família sincronizem a rotina diária, acessem prontuários clínicos e clínicas 24h, treinem seus animais em trilhas gamificadas (estilo Duolingo) e conversem com a assistente de inteligência artificial preventiva.

---

## 🏛️ Arquitetura e Estrutura do Código

```text
src/
├── components/          → Componentes reutilizáveis (PetScoreBar, RoutineCard, Header, EmptyState, etc.)
├── constants/           → Constantes de storage (Keys.ts) e avatares visuais (Avatares.ts)
├── contexts/            → Gerenciamento global de sessão (AuthContext.tsx com React Context API)
├── hooks/               → Custom hooks com TanStack Query (useSession, usePets, useTasks, useClinics, useAi)
├── lib/                 → Configuração do TanStack Query (queryClient.ts e queryKeys.ts)
├── routes/              → Navegação nativa (MainStack.tsx, tabs.tsx, types.ts)
├── screens/             → Telas da aplicação (Home, PetDetail, FamilyPet, Training, Clinics, AI, Profile, Auth)
├── services/            → Camada HTTP REST (http.ts com Axios Interceptors, auth, pets, tasks, users, clinics, ai)
├── types/               → Tipagens TypeScript estritas espelhando a API Java (api, auth, user, pet, task, clinic, training, ai)
└── utils/               → Schemas de validação Zod (schemas.ts)
```

---

## 🗺️ Telas e Navegação

O aplicativo utiliza navegação nativa com `@react-navigation/native-stack` e `@react-navigation/bottom-tabs`:

```text
RootNavigator (MainStack)
├── AuthStack (Rotas Públicas — Quando Deslogado)
│   ├── WelcomeScreen         → Ponto de entrada com introdução ao ecossistema
│   ├── LoginScreen           → Autenticação real com a API Java Spring Boot (/usuarios/by-email)
│   └── RegisterScreen        → Cadastro com validação Zod e endereço completo (/usuarios)
│
└── AppTabs (Rotas Protegidas — Quando Autenticado com Token JWT)
    ├── 🏠 HomeScreen           → Resumo do Pet ativo, barra PetScoreBar, rotina de tarefas e atalhos rápidos
    ├── 👥 FamilyStack          → Gestão de múltiplos pets, cadastro de animais e co-cuidadores
    │   └── 🐾 PetDetailScreen  → Ficha completa do Pet com histórico clínico consolidado (GET /pets/{id}/historico) e edição
    ├── 🤖 AiAssistantScreen    → (Botão Central) Chat com Inteligência Artificial para dicas e cuidados
    ├── 🎓 TrainingScreen       → Módulos de treino e adestramento estilo Duolingo que somam pontos ao Pet
    └── 👤 UserProfileScreen    → Perfil do tutor, pontos reais da API Java, Clínicas 24h e Logout
        └── 🏥 ClinicsSearchScreen → Busca de clínicas com filtro de emergência/pronto-socorro 24h (Método iFood)
```

---

## 📋 Integração com a API Java Spring Boot (Java-Advanced)

| Recurso | Método & Endpoint | Descrição no Mobile |
| :--- | :--- | :--- |
| **Cadastro de Usuário** | `POST /usuarios` | Cadastro de tutor com validação de CEP, telefone e senha |
| **Login do Usuário** | `GET /usuarios/by-email` | Autenticação por e-mail e emissão de sessão |
| **Rede de Cuidados** | `GET /usuarios/{id}/rede-cuidado` | Exibição de pets, co-cuidadores e métricas familiares |
| **Cadastro de Pet** | `POST /pets` | Criação de novo animal vinculado ao tutor logado |
| **Listagem de Pets** | `GET /pets` | Listagem paginada e seleção de pet ativo |
| **Histórico Consolidado** | `GET /pets/{id}/historico` | Prontuário de cuidados na tela dedicada `PetDetailScreen` |
| **Atualização do Pet** | `PUT /pets/{id}` | Edição de dados do pet (porte, idade, sexo, castração) |
| **Exclusão do Pet** | `DELETE /pets/{id}` | Remoção do animal com invalidação de cache reativo |
| **Rotina de Tarefas** | `GET /tarefas` | Listagem das rotinas com status de conclusão |
| **Criação de Tarefa** | `POST /tarefas` | Nova tarefa vinculada ao pet selecionado |
| **Conclusão de Tarefa** | `PATCH /tarefas/{id}/concluir` | Conclusão em 1 toque com incremento de pontos no `PetScoreBar` |
| **Pontos Totais** | `GET /tarefas/by-usuario/pontos` | Pontuação real exibida no Perfil do tutor |

---

## 📦 Tecnologias Utilizadas

| Tecnologia | Finalidade |
|---|---|
| **React Native (0.83.6)** | Framework principal mobile |
| **Expo (v57)** | Plataforma de desenvolvimento e execução nativa |
| **TypeScript (v5.9)** | Tipagem estrita de ponta a ponta sem `any` |
| **TanStack React Query (v5)** | Gerenciamento de cache assíncrono, queries e mutations |
| **Axios** | Cliente HTTP centralizado com interceptors de JWT e 401 |
| **React Context API** | Gerenciamento global de sessão e autenticação |
| **React Navigation (v7)** | Navegação nativa em Stacks e Bottom Tabs |
| **AsyncStorage** | Armazenamento seguro de Token JWT e dados locais |
| **Zod** | Validação de formulários |
| **Reanimated 3** | Animações suaves de interface |
| **@expo/vector-icons** | Biblioteca de ícones vetoriais |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
1. **Node.js** e **npm** instalados.
2. Aplicativo **Expo Go** instalado no celular ou emulador Android/iOS configurado.
3. API Spring Boot do projeto `Java-Advanced` em execução na porta `8080`.

### Execução

```bash
# Acesse o diretório do projeto mobile
cd Mobile-Application-Development

# Instale as dependências
npm install

# Inicie o Expo
npx expo start
```

---

## 👥 Equipe de Desenvolvimento (Ordem Alfabética Estrita)

| Nome | RM | Turma | Papel Principal | GitHub | LinkedIn |
| :--- | :---: | :---: | :--- | :--- | :--- |
| **Enzo Okuizumi** | 561432 | 2TDSPG | Mobile Development, TanStack Query & Integração Java | [EnzoOkuizumiFiap](https://github.com/EnzoOkuizumiFiap) | [LinkedIn](https://www.linkedin.com/in/enzo-okuizumi-b60292256/) |
| **Gustavo Okada** | 563428 | 2TDSPG | Java Advanced & .NET Observabilidade | [Gdev3356](https://github.com/Gdev3356) | [LinkedIn](https://www.linkedin.com/in/gustavo-okada-53a3b8359/) |
| **Lucas Barros Gouveia** | 566422 | 2TDSPG | Database Advanced (Oracle PL/SQL) | [LuzBGouveia](https://github.com/LuzBGouveia) | [LinkedIn](https://www.linkedin.com/in/lucas-barros-gouveia-09b147355/) |
| **Luna de Carvalho Guimarães** | 562290 | 2TDSPG | Disruptive Architectures (IA/IoT) & QA | [lunaguima](https://github.com/lunaguima) | [LinkedIn](https://www.linkedin.com/in/luna-m-guimar%C3%A3es-1850ab173/) |
| **Milton Marcelino** | 564836 | 2TDSPG | DevOps Tools & Cloud Computing | [MiltonMarcelino](https://github.com/MiltonMarcelino) | [LinkedIn](http://linkedin.com/in/milton-marcelino-250298142) |
