# 🐾 PetGuardian — Mobile Application Development

> **Arquitetura Pet-Centric & Cuidado Familiar Colaborativo**
> 
> *Projeto desenvolvido para a 3ª Sprint do Challenge Clyvo 2026 (FIAP — 2TDSPG).*

---

## Repositório Github e Vídeo de Demonstração

[Repositório Github](https://github.com/Challenge-Pet-Guardian-3/Mobile-Application-Development) | [Vídeo de Demonstração no YouTube]()

---

## 📱 Sobre o Projeto

O **PetGuardian** é um aplicativo mobile desenvolvido em **React Native com Expo e TypeScript**, estruturado sob as diretrizes da **Arquitetura Pet-Centric (Mentoria Clyvo 2026)**. O aplicativo centraliza o cuidado, a saúde e a gamificação no próprio animal, permitindo que os membros da família sincronizem a rotina diária, acessem prontuários clínicos e clínicas 24h, e conversem com a assistente de inteligência artificial preventiva.

---

## 🗺️ Telas e Navegação

O aplicativo utiliza navegação nativa com `@react-navigation/native-stack` e `@react-navigation/bottom-tabs`:

```text
RootNavigator
├── AuthStack (Rotas Públicas)
│   ├── WelcomeScreen         → Ponto de entrada com introdução ao ecossistema
│   ├── LoginScreen           → Autenticação real JWT consumindo API Java (/auth/login)
│   └── RegisterScreen        → Cadastro com validação Zod e emissão de token (/auth/register)
│
└── AppStack (Rotas Protegidas com Abas Inferiores)
    ├── 🏠 HomeScreen         → Resumo do Pet ativo, barra PetScoreBar, tarefas de hoje e atalhos de emergência
    ├── 🐾 PetDetailScreen    → Ficha completa do Pet com histórico clínico, vacinas e pesagens
    ├── 👨‍👩‍👧 FamilyPetScreen    → Gestão de múltiplos pets, cadastro de novos animais e co-cuidadores
    ├── 🎓 TrainingScreen     → Módulos de treino e adestramento que somam pontos ao Score do Pet
    ├── 🏥 ClinicsScreen      → Busca de clínicas veterinárias com filtro de emergência/pronto-socorro 24h
    ├── 🤖 AiAssistantScreen  → Chat inteligente com RAG baseado no histórico do Pet
    └── 👤 UserProfileScreen  → Perfil do tutor, configurações da conta e Logout
```

---

## 📋 Funcionalidades Principais & Arquitetura Pet-Centric

### 🏠 Painel Home Pet-Centric
- **Seletor de Pet Ativo:** Alternância rápida entre os animais da família.
- **Barra de Score do Pet (`PetScoreBar`):** Visualização imediata do nível de bem-estar acumulado no animal.
- **Rotina Diária Familiar:** Tarefas diárias de cuidado com conclusão reativa via TanStack Query (`useMutation`).
- **Atalhos Rápidos:** Acesso direto ao chat com IA e busca de clínicas de emergência 24h.

### 🐾 Ficha e Prontuário Dedicado (`PetDetailScreen`)
- **Histórico Clínico:** Consultas, diagnósticos e tratamentos do animal sem poluir a Home.
- **Carteira de Vacinação:** Controle de imunizações e próximas doses.
- **Evolução de Peso:** Histórico de pesagens com indicadores de saúde.

### 🎮 Gamificação Pet-Centric
- **Score no Pet:** Cada tarefa de rotina cumprida e treino finalizado soma pontos diretamente ao animal.
- **Ofensiva (Streak):** Acompanhamento da consistência no cuidado da família.

### 👤 Perfil do Usuário
- **Dados da Conta:** Informações do tutor e co-cuidadores vinculados.
- **Logout Seguro:** Limpeza total do token JWT no AsyncStorage e reset de cache do TanStack Query.

---

## 📦 Tecnologias Utilizadas

| Tecnologia | Finalidade |
|-----------|-----------|
| React Native | Framework principal do projeto |
| Expo | Plataforma de desenvolvimento e execução nativa |
| React Navigation | Navegação entre telas (Stack e Tabs) |
| AsyncStorage | Banco de dados local para persistência de informações |
| Zod | Validação de formulários (Login, Register e edição de perfil) |
| Reanimated 3 | Animações suaves de interface (FadeInDown, ZoomIn) |
| @expo/vector-icons | Biblioteca de ícones vetoriais |

---

## 💾 Dados Persistidos (AsyncStorage)

| Chave | Conteúdo |
|-------|----------|
| `@PetGuardian_UserData` | Dados da conta (Nome, E-mail, Senha) |
| `@PetGuardian_Logado` | Status da sessão ativa |
| `@PetGuardian_ListaPets` | Lista de todos os animais cadastrados |
| `@Familia_Cuidadores` | Membros da família e seus respectivos XPs |
| `@Familia_Recados` | Conteúdo do mural colaborativo |
| `@PetGuardian_FamiliaAtiva` | Se o usuário pertence a uma família |
| `@PetGuardian_NomeFamilia` | Nome da família |
| `@PetGuardian_CodigoFamilia` | Código de convite gerado |
| `@PetGuardian_PontosXP` | XP total acumulado pelo usuário |
| `@PetGuardian_OfensivaDias` | Contador de dias consecutivos de cuidado |
| `@PetGuardian_FamiliaTarefas` | Tarefas criadas para a Familia |
| `@PetGuardian_Progresso_<data>` | Progresso diário das tarefas (reset automático) |

---

## 🚀 Como Executar o Projeto

### Pré-requisito

- Aplicativo **Expo Go** instalado no celular físico ou emulador configurado

### Instalação e Execução

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git

# Acesse a pasta
cd Mobile-Application-Development

# Instale as dependências
npm install

# Inicie o servidor
npx expo start
```

Escaneie o QR Code com o **Expo Go** para visualizar o app.

---

## 👥 Equipe de Desenvolvimento


<table>
<tr>
<th>Nome</th>
<th>RM</th>
<th>Turma</th>
<th>GitHub</th>
<th>LinkedIn</th>
</tr>

<tr>
<td>Enzo Okuizumi</td>
<td>561432</td>
<td>2TDSPG</td>
<td><a href="https://github.com/EnzoOkuizumiFiap">EnzoOkuizumiFiap</a></td>
<td><a href="https://www.linkedin.com/in/enzo-okuizumi-b60292256/">Enzo Okuizumi</a></td>
</tr>

<tr>
<td>Gustavo Okada</td>
<td>563428</td>
<td>2TDSPG</td>
<td><a href="https://github.com/Gdev3356">Gustavo Okada</a></td>
<td><a href="https://www.linkedin.com/in/gustavo-okada-53a3b8359/">Gustavo Okada</a></td>
</tr>

<tr>
<td>Lucas Barros Gouveia</td>
<td>566422</td>
<td>2TDSPG</td>
<td><a href="https://github.com/LuzBGouveia">LuzBGouveia</a></td>
<td><a href="https://www.linkedin.com/in/lucas-barros-gouveia-09b147355/">Lucas Barros Gouveia</a></td>
</tr>

<tr>
<td>Luna de Carvalho Guimarães</td>
<td>562290</td>
<td>2TDSPG</td>
<td><a href="https://github.com/lunaguima">lunaguima</a></td>
<td><a href="https://www.linkedin.com/in/luna-m-guimar%C3%A3es-1850ab173/">Luna M. Guimarães</a></td>
</tr>

<tr>
<td>Milton Marcelino</td>
<td>564836</td>
<td>2TDSPG</td>
<td><a href="https://github.com/MiltonMarcelino">MiltonMarcelino</a></td>
<td><a href="http://linkedin.com/in/milton-marcelino-250298142">Milton Marcelino</a></td>
</tr>

</table>
