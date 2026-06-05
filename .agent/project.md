# Project Metadata: Raízen Power Extractor

## Overview
The main goal of this project is a system for automated extraction of client and contract data from PDF files (Distributed Generation and Free Energy Market). This includes automatic classification by distributor, key fields validation (CNPJ, CPF, business rules), and exporting standardized datasets (CSV, XLSX) and visual reports.

## Stack
- **Language**: Python (PEP 8, type hints)
- **Environment & Dependency Manager**: `uv` with `pyproject.toml` and `uv.lock`
- **Testing**: `pytest`
- **Main Libraries**: `PyMuPDF` (fitz) for PDF manipulation, `pandas`/`openpyxl` for spreadsheet processing, Gemini API for AI-based recovery/extraction.

## LGPD / Personal Data
Yes, this project processes Personal Data (CPF, name, address, electricity consumer unit details). LGPD compliance must be enforced. No PII should be logged or exposed.
