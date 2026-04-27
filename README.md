# Antigravity LGPD & Context-First

[![CI](https://github.com/stefanprati-rgb/antigravity-superpowers-lgpd/actions/workflows/test.yml/badge.svg)](https://github.com/stefanprati-rgb/antigravity-superpowers-lgpd/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

[🇧🇷 Versão em Português](#-versão-em-português)

A robust, enterprise-grade version of Antigravity Superpowers optimized for **LGPD guardrails**, **enhanced project context**, and **single-flow execution**.

## 🛡️ Core Pillars

### 1. LGPD Guardrail
The system provides guardrails for LGPD (Brazil's data protection law) compliance. The AI includes specialized skills (`handling-personal-data`) designed to activate when sensitive data (CPF, email, passwords, etc.) is handled, helping enforce anonymization and security best practices.

### 2. Context First
Unlike other AI tools, this engine is configured to avoid generating code "in the dark". The `project-onboarding` skill is recommended for new repositories, helping the AI understand the architecture and conventions before suggesting changes.

### 3. Persistent Memory System
The system integrates an "antcrash" memory architecture. By initializing with `--with-memory`, the agent maintains a dense active memory (`memory.md`) and append-only daily session logs (`sessions/`). This is designed to help maintain context between days or crashes, with hooks to redact PII before saving logs.

### 4. Single-Flow Execution
Focused on sequential, structured execution through `implementation plans`. This drastically reduces context hallucinations and ensures each task is verified and validated before completion.

### 5. Clean Architecture Enforcer
Includes an architecture validator that helps enforce layer separation (Entities, Use Cases, Adapters), promoting maintainable and scalable code for enterprise use.

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
| `init [dir] [--force] [--dry-run] [--with-memory]` | Initialize `.agent` profile in a project |
| `validate [dir]` | Validate an installed `.agent` profile |
| `doctor [dir]` | Diagnose common configuration issues |
| `purge-sessions [dir]` | Remove session logs older than `log_retention_days` |

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

Uma versão robusta e corporativa do Antigravity Superpowers, otimizada para **LGPD guardrails**, **Contexto de Projeto Aprimorado** e **Execução em Fluxo Único (Single-Flow)**.

### 🛡️ Pilares Principais

#### 1. LGPD Guardrail
O sistema fornece trilhos (guardrails) para conformidade com a Lei Geral de Proteção de Dados. A IA inclui skills específicas (`handling-personal-data`) projetadas para serem ativadas sempre que dados sensíveis (CPF, e-mail, senhas, etc.) são manipulados, auxiliando na anonimização e segurança.

#### 2. Context First
Diferente de outras ferramentas de IA, este motor é configurado para evitar gerar código "no escuro". O uso da skill `project-onboarding` é altamente recomendado para novos repositórios, ajudando a IA a entender a arquitetura e as convenções antes de sugerir alterações.

#### 3. Persistent Memory System (Memória de Longo Prazo)
O sistema integra uma arquitetura de memória "antcrash". Ao inicializar com `--with-memory`, o agente mantém uma memória ativa compacta (`memory.md`) e logs de sessão diários (`sessions/`). Isso ajuda a manter o contexto da IA entre dias de trabalho ou travamentos, com hooks para redigir dados PII antes de salvar os arquivos.

#### 4. Single-Flow Execution
Focado em execução sequencial e estruturada através de `implementation plans`. Isto reduz drasticamente alucinações de contexto e garante que cada tarefa seja verificada e validada antes da conclusão.

#### 5. Clean Architecture Enforcer
Inclui um validador de arquitetura que incentiva a separação de camadas (Entities, Use Cases, Adapters), ajudando a manter o código manutenível e escalável.

### 🚀 Como Começar

```bash
# Instalar globalmente
npm install -g .

# Inicializar no projeto (com memória persistente)
antigravity-lgpd init --with-memory

# Expurgo de histórico LGPD (Apagar sessões velhas)
antigravity-lgpd purge-sessions

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
