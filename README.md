# todo

A tiny single-file Python CLI for managing a personal todo list.

## Requirements

- Python 3.10+
- pytest (for running tests)

## Usage

```sh
python todo.py add "buy milk"
python todo.py add "walk dog"
python todo.py list
python todo.py done 1
python todo.py rm 2
```

Tasks are stored in `~/.todo.json`.

## Tests

```sh
pip install pytest
pytest -v
```
