# UV Environment Validation

Como o projeto utiliza `uv` para o gerenciamento ultrarrápido de dependências e ambientes virtuais Python, falhas em testes E2E frequentemente ocorrem por assincronia entre o `pyproject.toml` / `uv.lock` e o ambiente local.

## 🔍 Comandos de Validação

Antes de rodar a suíte de testes E2E, execute:

1. **Sincronização Padrão:**
   ```bash
   uv sync
   ```

*Garante que o ambiente `.venv` reflete exatamente o estado do `uv.lock`.*

2. **Verificação Estrita (CI/Pipeline Local):**
   ```bash
   uv sync --locked
   ```

*Falhará se o `uv.lock` estiver desatualizado em relação ao `pyproject.toml`. Ideal para garantir a integridade antes de testes pesados.*

## 🛠️ Resolução de Problemas
*   **Erro de Lock Desatualizado:** Se `uv sync --locked` falhar, significa que dependências foram alteradas. Rode `uv lock` para atualizar o arquivo de lock e, em seguida, `uv sync`.
*   **Ambiente Corrompido:** Caso existam conflitos persistentes, você pode forçar a recriação do ambiente virtual com `uv sync --reinstall`.
