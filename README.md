# Antigravity LGPD & Context-First

[🇧🇷 Versão em Português](#-versão-em-português)

A robust, enterprise-grade version of Antigravity Superpowers optimized for **LGPD compliance**, **mandatory project context**, and **single-flow execution**.

## 🛡️ Core Pillars

### 1. LGPD Guardrail
LGPD (Brazil's data protection law) compliance is native. The AI has specific skills (`handling-personal-data`) that activate whenever sensitive data (CPF, email, passwords, etc.) is being handled, enforcing anonymization and security by default.

### 2. Context First
Unlike other AI tools, this engine is prevented from generating code "in the dark". The `project-onboarding` skill is mandatory for new repositories, ensuring the AI understands the architecture and conventions before suggesting any changes.

### 3. Single-Flow Execution
Focused on sequential, structured execution through `implementation plans`. This drastically reduces context hallucinations and ensures each task is verified and validated before completion.

### 4. Clean Architecture Enforcer
Includes an architecture validator that enforces strict layer separation (Entities, Use Cases, Adapters), keeping code maintainable and scalable for enterprise use.

## 🚀 Getting Started

### Global Install
```bash
npm install -g .
```

### Initialize in Your Project
```bash
antigravity-lgpd init
```

### Validate Profile
```bash
antigravity-lgpd validate
```

### Diagnose Issues
```bash
antigravity-lgpd doctor
```

## 🛠️ CLI Commands

| Command | Description |
|---------|-------------|
| `init [dir] [--force] [--dry-run]` | Initialize `.agent` profile in a project |
| `validate [dir]` | Validate an installed `.agent` profile |
| `doctor [dir]` | Diagnose common configuration issues |

## 📁 Boilerplate Templates
The system provides automatic base templates for:
- `architecture.md`: Clean Architecture focused
- `conventions.md`: Python/JavaScript & Conventional Commits

## 🔄 Workflows

- `/brainstorm`: Explore requirements and design before implementation
- `/write-plan`: Create detailed implementation plans with atomic tasks
- `/execute-plan`: Execute the plan in a structured way

---

## 🇧🇷 Versão em Português

Uma versão robusta e corporativa do Antigravity Superpowers, otimizada para conformidade **LGPD**, **Contexto de Projeto Obrigatório** e **Execução em Fluxo Único (Single-Flow)**.

### 🛡️ Pilares Principais

#### 1. LGPD Guardrail
A conformidade com a Lei Geral de Proteção de Dados é nativa. A IA possui skills específicas (`handling-personal-data`) que são ativadas sempre que dados sensíveis (CPF, e-mail, senhas, etc.) são manipulados, garantindo anonimização e segurança por padrão.

#### 2. Context First
Diferente de outras ferramentas de IA, este motor é impedido de gerar código "no escuro". O uso da skill `project-onboarding` é mandatário para novos repositórios, garantindo que a IA entenda a arquitetura e as convenções antes de sugerir qualquer alteração.

#### 3. Single-Flow Execution
Focado em execução sequencial e estruturada através de `implementation plans`. Isto reduz drasticamente alucinações de contexto e garante que cada tarefa seja verificada e validada antes da conclusão.

#### 4. Clean Architecture Enforcer
Inclui um validador de arquitetura que obriga a separação estrita de camadas (Entities, Use Cases, Adapters), mantendo o código manutenível e escalável para nível corporativo.

### 🚀 Como Começar

```bash
# Instalar globalmente
npm install -g .

# Inicializar no projeto
antigravity-lgpd init

# Validar perfil
antigravity-lgpd validate

# Diagnosticar problemas
antigravity-lgpd doctor
```

### 🛠️ Ferramentas e Workflows

- `/brainstorm`: Explore requisitos e design antes da implementação.
- `/write-plan`: Crie planos detalhados de implementação com tarefas atômicas.
- `/execute-plan`: Execute o plano de forma estruturada.

### 📁 Estrutura de Boilerplate
O sistema fornece modelos base automáticos para:
- `architecture.md`: Focado em Clean Architecture.
- `conventions.md`: Focado em Python/JavaScript e Conventional Commits.

---

*Ensuring security and code quality through specialized AI agents.*
