.PHONY: run test test-cov lint type-check ci

run:
	uv run uvicorn mam_pivko.main:app --reload --host 0.0.0.0 --port 8000

test:
	uv run pytest

test-cov:
	uv run pytest --cov=mam_pivko --cov-report=term-missing

lint:
	uv run ruff check src/ tests/

type-check:
	uv run mypy src/

ci: lint type-check test
