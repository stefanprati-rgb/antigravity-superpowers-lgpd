# Superpowers Agent Profile (LGPD & Context-First)

[![CI](https://github.com/stefanprati-rgb/antigravity-superpowers-lgpd/actions/workflows/test.yml/badge.svg)](https://github.com/stefanprati-rgb/antigravity-superpowers-lgpd/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

[🇧🇷 Versão em Português](#-versão-em-português)

A robust, enterprise-grade agent profile optimized for **LGPD guardrails**, **enhanced project context**, and **multi-agent single-flow execution** (Codex, Antigravity, Claude).

## 🛡️ Core Pillars

### 1. LGPD Guardrail
The system provides guardrails for LGPD (Brazil's data protection law) compliance. The AI includes specialized skills (`handling-personal-data`) designed to activate when sensitive data (CPF, email, passwords, etc.) is handled, helping enforce anonymization and security best practices.

### 2. Context First
Unlike other AI tools, this engine is configured to avoid generating code "in the dark". The `project-onboarding` skill is recommended for new repositories, helping the AI understand the architecture and conventions before suggesting changes.

### 3. Persistent Memory System
The system integrates an "antcrash" memory architecture. By initializing with `--with-memory`, the agent maintains a dense active memory (`memory.md`) and append-only daily session logs (`sessions/`). `purge-sessions` summarizes old logs into memory before deleting them, preserving architectural context without bloating future prompts.

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
| `purge-sessions [dir]` | Summarize then remove session logs older than `log_retention_days` |
| `skills search/show/import` | Search ECC skills online and import selected skills locally for review |

## Remote Skill Scout

The CLI can use the ECC repository as an online skill catalog without executing remote prompts directly:

```bash
antigravity-lgpd skills search "regression testing"
antigravity-lgpd skills show ecc/ai-regression-testing
antigravity-lgpd skills import ecc/ai-regression-testing --dry-run
antigravity-lgpd skills import ecc/ai-regression-testing
```

Imported skills are copied into `.agent/skills/<name>/` with an `ORIGIN.md` file that records the ECC source URL, source ref, Codex/Gemini adaptation note, and `Reviewed: false`. Review imported content before relying on it, especially for Claude-specific tool names or workflows.

## 📁 Boilerplate Templates
The system provides automatic base templates for:
- `architecture.md`: Clean Architecture focused
- `conventions.md`: Python/JavaScript, `uv`, and Conventional Commits

## Security and Tracking

- `init` installs a local LGPD pre-commit scanner when a git repository is present and no existing hook would be overwritten.
- Task state lives in `docs/plans/task.json`; `docs/plans/task.md` is generated for human reading.
- Profile tests include static prompt regressions for the LGPD fatal-block behavior.

## 🔄 Workflows

- `/brainstorm`: Explore requirements and design before implementation
- `/write-plan`: Create detailed implementation plans with atomic tasks
- `/execute-plan`: Execute the plan in a structured way

---

## 🇧🇷 Versão em Português

Uma versão robusta e corporativa de perfil de agente, otimizada para **LGPD guardrails**, **Contexto de Projeto Aprimorado** e **Execução Multi-Agente em Fluxo Único** (Codex, Antigravity, Claude).

Este projeto entrega um CLI (`antigravity-lgpd`) e um pacote de templates `.agent` para instalar, validar e manter um perfil de agente com:

- Skills versionadas para execução disciplinada, LGPD, onboarding e arquitetura limpa.
- Validação local do perfil instalado (`validate`, `doctor` e testes internos).
- Memória persistente opcional com sumarização de sessões antigas antes da purga.
- Tracking estruturado em JSON, com Markdown gerado apenas para leitura humana.
- Hook local de pre-commit para bloquear vazamento acidental de dados pessoais ou segredos.

### 🛡️ Pilares Principais

#### 1. LGPD Guardrail
O sistema fornece trilhos (guardrails) para conformidade com a Lei Geral de Proteção de Dados. A IA inclui skills específicas (`handling-personal-data`) projetadas para serem ativadas sempre que dados sensíveis (CPF, e-mail, senhas, etc.) são manipulados, auxiliando na anonimização e segurança. O perfil também inclui um scanner local de pre-commit como defesa em profundidade.

#### 2. Context First
Diferente de outras ferramentas de IA, este motor é configurado para evitar gerar código "no escuro". O uso da skill `project-onboarding` é altamente recomendado para novos repositórios, ajudando a IA a entender a arquitetura e as convenções antes de sugerir alterações.

#### 3. Persistent Memory System (Memória de Longo Prazo)
O sistema integra uma arquitetura de memória "antcrash". Ao inicializar com `--with-memory`, o agente mantém uma memória ativa compacta (`memory.md`) e logs de sessão diários (`sessions/`). O `purge-sessions` resume sessões antigas em `.agent/memory.md` antes de apagar os logs antigos, preservando decisões arquiteturais sem inflar o contexto futuro.

#### 4. Single-Flow Execution
Focado em execução sequencial e estruturada através de `implementation plans`. O estado vivo das tarefas fica em `docs/plans/task.json`; o `docs/plans/task.md` é uma visualização gerada para humanos. Isto reduz alucinações de contexto e garante que cada tarefa seja verificada e validada antes da conclusão.

#### 5. Clean Architecture Enforcer
Inclui um validador de arquitetura que incentiva a separação de camadas (Entities, Use Cases, Adapters), ajudando a manter o código manutenível e escalável.

### 🚀 Como Começar

```bash
# Instalar globalmente
npm install -g .

# Inicializar no projeto (com memória persistente)
antigravity-lgpd init --with-memory

# Expurgo de histórico LGPD (Sumarizar e apagar sessões velhas)
antigravity-lgpd purge-sessions

# Validar perfil
antigravity-lgpd validate

# Diagnosticar problemas
antigravity-lgpd doctor
```

### 🛠️ Comandos do CLI

| Comando | Descrição |
|---------|-----------|
| `init [dir] [--force] [--dry-run] [--with-memory]` | Instala o perfil `.agent` no projeto |
| `validate [dir]` | Valida se o perfil instalado possui os arquivos e skills esperados |
| `doctor [dir]` | Diagnostica problemas comuns de ambiente, tracking e segurança |
| `purge-sessions [dir]` | Resume sessões antigas em `memory.md` e remove logs fora da retenção |
| `skills search/show/import` | Consulta skills do ECC online e importa skills selecionadas localmente para revisão |

### 🔎 Skill Scout Remoto

O CLI pode usar o repositório ECC como catálogo online de skills, sem executar prompts remotos diretamente:

```bash
antigravity-lgpd skills search "regression testing"
antigravity-lgpd skills show ecc/ai-regression-testing
antigravity-lgpd skills import ecc/ai-regression-testing --dry-run
antigravity-lgpd skills import ecc/ai-regression-testing
```

Skills importadas são copiadas para `.agent/skills/<nome>/` com um `ORIGIN.md` registrando URL de origem, ref de origem, nota de adaptação para Codex/Gemini e `Reviewed: false`. Revise o conteúdo antes de usar, especialmente quando houver nomes de ferramentas ou fluxos específicos do Claude.

### 🔄 Atualizar Projetos Já Instalados

Em cada projeto que já possui uma pasta `.agent`, rode:

```bash
antigravity-lgpd init --force
```

O comando cria um backup da configuração atual antes de substituir o perfil, em uma pasta como:

```text
.agent-backup-2026-05-26T...
```

Se o projeto usa memória persistente, rode:

```bash
antigravity-lgpd init --force --with-memory
```

Importante: `--force` substitui a pasta `.agent` ativa. A memória antiga fica preservada no backup, não é mesclada automaticamente no novo `memory.md`. Se houver conteúdo manual importante em `.agent/memory.md` ou `.agent/USER.md`, revise o backup e copie apenas o que ainda for útil.

Depois da atualização, valide o perfil:

```bash
antigravity-lgpd validate
antigravity-lgpd doctor
bash .agent/tests/run-tests.sh
```

Projetos antigos que usavam apenas `docs/plans/task.md` devem migrar o estado vivo das tarefas para `docs/plans/task.json`. O `task.md` passa a ser a versão gerada para leitura humana.

Para renderizar o Markdown a partir do JSON:

```bash
node .agent/tools/render-task-md.mjs
```

### 🔐 Segurança e Tracking

- O `init` instala um scanner LGPD em `.git/hooks/pre-commit` quando o projeto é um repositório git e não existe hook anterior.
- Se já existir um hook, ele não é sobrescrito. Encadeie manualmente `node .agent/tools/lgpd-pre-commit.mjs` no hook existente.
- O scanner bloqueia commits com CPF, e-mails reais, tokens, chaves de API ou credenciais Firebase detectáveis localmente.
- O estado de execução vive em `docs/plans/task.json`; o Markdown é apenas uma renderização para humanos.
- Os testes do perfil incluem regressões estáticas para garantir que o bloqueio fatal de LGPD continue presente.

### 🛠️ Ferramentas e Workflows

- `/brainstorm`: Explore requisitos e design antes da implementação.
- `/write-plan`: Crie planos detalhados de implementação com tarefas atômicas.
- `/execute-plan`: Execute o plano de forma estruturada.

### 📁 Estrutura de Boilerplate
O sistema fornece modelos base automáticos para:
- `architecture.md`: Focado em Clean Architecture.
- `conventions.md`: Focado em Python/JavaScript, `uv` e Conventional Commits.

---

*Ensuring security and code quality through specialized AI agents.*
