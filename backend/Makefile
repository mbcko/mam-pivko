.PHONY: run test test-cov lint type-check

run:
	uvicorn mam_pivko.main:app --reload --host 0.0.0.0 --port 8000

test:
	pytest

test-cov:
	pytest --cov=mam_pivko --cov-report=term-missing

lint:
	ruff check src/ tests/

type-check:
	mypy src/
