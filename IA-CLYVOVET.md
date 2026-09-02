# Componente de Inteligência Artificial — PetGuardian (CLYVO VET)

## 1. Problema de Negócio

Tutores de pets frequentemente têm dúvidas recorrentes sobre cuidados básicos (alimentação,
vacinação, higiene, comportamento) no dia a dia, mas nem sempre têm acesso imediato a um
médico veterinário para esclarecê-las. Isso gera duas consequências negativas:

- **Para o tutor**: insegurança na tomada de decisões de cuidado, atrasos em ações preventivas
  (ex: não perceber sinais de que o pet precisa de atenção) e sobrecarga de pesquisa em fontes
  não confiáveis na internet.
- **Para a clínica (CLYVO VET)**: menor engajamento do tutor com a jornada preventiva de saúde
  do pet, e falta de um canal de triagem inicial que direcione o tutor a buscar atendimento
  profissional quando necessário.

O componente de IA do PetGuardian resolve isso oferecendo **orientação preventiva imediata e
contextualizada**, dentro da jornada do tutor no app, sem substituir o atendimento veterinário —
pelo contrário, reforçando quando ele é necessário.

## 2. Papel da IA na Solução

A IA atua em dois pontos da jornada:

1. **Assistente conversacional (chat)**: o tutor pode tirar dúvidas em linguagem natural sobre
   cuidados com o pet (ração, vacinas, ansiedade, higiene, toxicidade de alimentos). O sistema
   responde com base em conhecimento veterinário preventivo consolidado.
2. **Insights preventivos automáticos**: com base nos dados já registrados no app (perfil do
   pet, histórico de tarefas concluídas, trilhas de aprendizado), o sistema gera recomendações
   personalizadas e proativas, sem que o tutor precise perguntar.

Isso contribui diretamente para:
- **Personalização**: os insights variam conforme o pet e o histórico de cuidados de cada
  usuário.
- **Priorização de ações**: o assistente pode reforçar tarefas de saúde que estão em atraso ou
  ainda não foram exploradas (ex: sugerir completar uma trilha de enriquecimento ambiental).
- **Apoio à tomada de decisão**: o tutor recebe uma orientação inicial confiável antes de decidir
  se precisa buscar atendimento presencial.

## 3. Abordagem de IA Escolhida e Justificativa

**Abordagem adotada: Motor de Regras Inteligentes (Rule-Based System)**, com processamento
simples de linguagem natural por correspondência de palavras-chave.

### Por que essa abordagem, e não um LLM/IA Generativa?

- **Segurança do domínio**: o assistente trata de orientação de saúde animal. Um modelo
  generativo (LLM) pode "alucinar" e fornecer uma recomendação incorreta ou perigosa (ex:
  dosagem errada, alimento não confirmado como tóxico). Um motor de regras garante que toda
  resposta vem de conteúdo previamente validado, sem risco de invenção.
- **Previsibilidade e auditabilidade**: cada resposta pode ser rastreada até a regra que a
  gerou, o que é importante num produto de saúde (mesmo que preventiva) — facilita auditoria
  e responsabilização técnica.
- **Custo e independência de infraestrutura externa**: não depende de chave de API paga, limite
  de requisições ou disponibilidade de terceiros, o que é adequado ao estágio atual do produto
  (MVP acadêmico) e evita custos recorrentes de operação.
- **Extensibilidade**: a arquitetura do serviço (`IaService`) permite evoluir facilmente para
  um sistema de recomendação mais sofisticado (ex: ranqueamento de insights por relevância) ou
  para incorporar uma LLM real no futuro como camada adicional (ex: para reformular a
  linguagem das respostas, mantendo o conteúdo controlado pelas regras).

## 4. Dados Utilizados

| Dado | Origem | Uso |
|---|---|---|
| Perfil do pet (nome, raça, idade, porte) | Cadastro do usuário (`Pet`) | Personalizar o texto dos insights e respostas |
| Histórico de tarefas concluídas | `Tarefa` / `TarefaRepository` | Base para insights sobre rotina e consistência de cuidados |
| Progresso em Trilhas de Aprendizado | `TrilhaEtapaConcluida` | Recomendar próximos passos educativos personalizados |
| Pergunta do tutor (texto livre) | Input do chat no app | Disparar a regra de resposta correspondente |

Nenhum dado sensível de saúde (diagnósticos clínicos, exames) é usado — o escopo é
estritamente preventivo e educativo, reforçando sempre a busca por um veterinário para
questões clínicas reais.

## 5. Arquitetura e Fluxo de Dados

```
┌──────────────────┐         ┌──────────────────────┐         ┌────────────────────┐
│   App Mobile      │  HTTP   │   Backend Spring Boot │         │   Banco de Dados    │
│  (React Native)   │ ──────► │                        │ ──────► │                     │
│                   │         │  IaController          │         │  Pet, Tarefa,       │
│  AiAssistantScreen│ ◄────── │  IaService             │ ◄────── │  TrilhaEtapa        │
│                   │  JSON   │  (motor de regras)     │         │  Concluida          │
└──────────────────┘         └──────────────────────┘         └────────────────────┘
```

**Fluxo — Chat:**
1. Tutor digita uma pergunta no `AiAssistantScreen`.
2. App envia `POST /ia/chat` com `{ petId, pergunta }`.
3. `IaService` normaliza o texto e casa com palavras-chave (ração, vacina, ansiedade, banho,
   tóxico) mapeadas para respostas pré-validadas.
4. Resposta retorna ao app e é exibida na interface de chat.

**Fluxo — Insights automáticos:**
1. App solicita `GET /ia/insights/{petId}` ao abrir a tela do assistente.
2. `IaService` busca o `Pet` no `PetRepository` e aplica regras sobre os dados disponíveis.
3. Lista de insights personalizados é retornada e exibida antes do chat.

## 6. Roadmap de Evolução (fora do escopo desta sprint)

- Adicionar um sistema de recomendação que pondere o histórico de tarefas para sugerir a
  próxima ação mais relevante (não apenas regras fixas).
- Avaliar incorporação de uma LLM (ex: Gemini API) como camada de reformulação de linguagem,
  mantendo o conteúdo restrito ao motor de regras por segurança.
- Expandir a base de regras com mais categorias (ex: comportamento por idade do pet).