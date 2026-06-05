# Architecture Patterns — Raízen Power Extractor

This project follows clean code and layered structures to ensure maintainability, testability, and independence from external frameworks.

## Project Structure

- `src/raizen_power/`: Main source code package
  - `core/`: Orchestration and global configurations (`main.py`, `config.py`)
  - `extraction/`: Extractors specific to distributor types and layout types (e.g., `uc_multi_extractor.py`, `extractor.py`, `gemini_client.py`)
  - `utils/`: Helpers for validation (DVs, CPF, CNPJ), text parsing, and PDF operations.
- `scripts/`: Supporting automations, runners, and analytical scripts.
  - `runners/`: Scripts for executing pipelines.
  - `analysis/`: Auditing and data quality scripts.
  - `tools/`: Utilities (CEP correction, PDF organization, etc.)

## Extraction Pipeline Flow

1. **Input & Config**: Read input files and configurations.
2. **Classification**: Determine distributor and model structural type (Visual, Tabular, etc.).
3. **Extraction**:
   - Primary: Regex patterns (`patterns.yaml`).
   - Secondary: Table-based extraction (`table_extractor.py`).
   - Tertiary / Recovery: AI-based extraction (Gemini Client).
4. **Validation**: DV validator, CPF/CNPJ checker, data normalizers.
5. **Output**: Consolidated CSV/XLSX.
