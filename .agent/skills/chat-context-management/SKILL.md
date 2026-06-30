---
name: chat-context-management
description: Consolida o estado da sessão, tarefas pendentes e decisões no final de cada iteração para manter o contexto no chat e no repositório.
---

# Chat Context Management

## 🎯 Trigger
Esta habilidade deve ser ativada automaticamente quando uma sessão de codificação estiver chegando ao fim, um grande marco (milestone) for atingido, ou quando o controle da execução for devolvido ao usuário.

## 📝 Regras de Ouro
1. **Zero Ferramentas Externas:** Todo o contexto, anotações e listas de pendências devem ser registrados exclusivamente aqui no chat e nos arquivos de sessão do repositório.
2. **Sincronização:** O resumo gerado deve ser apensado ao arquivo de log diário correspondente em `.agent/sessions/YYYY-MM-DD.md` e refletido no `task.json` / `task.md`.

## 📦 Output Block Template
O agente deve gerar o seguinte bloco Markdown ao finalizar o turno:

```markdown
### 🛑 Resumo da Sessão
* **O que foi concluído:** [Lista concisa das entregas]
* **Status do Codebase:** [Estado dos commits, testes passando/falhando]
* **Decisões Arquiteturais:** [Breve resumo de escolhas técnicas feitas]

### ⏳ Pendências (Next Steps)
- [ ] Tarefa 1
- [ ] Tarefa 2

### 🚀 Prompt de Retomada
*Copie e cole o texto abaixo na próxima sessão para restaurar o contexto imediatamente:*
> "Retomando do ponto em que paramos: concluímos [X] e precisamos focar em resolver [Y]. O ambiente já está rodando. Pode puxar o contexto do arquivo `YYYY-MM-DD.md` e iniciar a primeira pendência."
```
