# Antigravity LGPD & Context-First (Hube Energy Edition)

Uma versão robusta e corporativa do Antigravity Superpowers, otimizada para conformidade **LGPD**, **Contexto de Projeto Obrigatório** e **Execução em Fluxo Único (Single-Flow)**.

## 🛡️ Pilares Principais

### 1. LGPD Guardrail
A conformidade com a Lei Geral de Proteção de Dados é nativa. A IA possui skills específicas (`handling-personal-data`) que são ativadas sempre que dados sensíveis (CPF, e-mail, senhas, etc.) são manipulados, garantindo anonimização e segurança por padrão.

### 2. Context First
Diferente de outras ferramentas de IA, este motor é impedido de gerar código "no escuro". O uso da skill `project-onboarding` é mandatário para novos repositórios, garantindo que a IA entenda a arquitetura e as convenções antes de sugerir qualquer alteração.

### 3. Single-Flow Execution
Focado em execução sequencial e estruturada através de `implementation plans`. Isto reduz drasticamente alucinações de contexto e garante que cada tarefa seja verificada e validada antes da conclusão.

### 4. Clean Architecture Enforcer
Inclui um validador de arquitetura que obriga a separação estrita de camadas (Entities, Use Cases, Adapters), mantendo o código manutenível e escalável para nível corporativo.

## 🚀 Como Começar (Hube Energy)

### Instalação Global
```bash
npm install -g .
```

### Inicializar no Projeto
```bash
antigravity-lgpd init
```

## 🛠️ Ferramentas e Workflows

- `/brainstorm`: Explore requisitos e design antes da implementação.
- `/write-plan`: Crie planos detalhados de implementação com tarefas atômicas.
- `/execute-plan`: Execute o plano de forma estruturada.

## 📁 Estrutura de Boilerplate
O sistema fornece modelos base automáticos para:
- `architecture.md`: Focado em Clean Architecture.
- `conventions.md`: Focado em Python/JavaScript e Conventional Commits.

---

*Desenvolvido para uso corporativo na Hube Energy, garantindo segurança e qualidade de código através de agentes especializados.*
