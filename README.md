# todo

A tiny single-file Python CLI for managing a personal todo list.

## Requirements

- Python 3.10+
- pytest (for running tests)

## Usage

```sh
python -m todo add "buy milk"
python -m todo add --priority high --tag work --tag urgent "walk dog"
python -m todo list
python -m todo done 1
python -m todo rm 2
python -m todo search milk
python -m todo filter --priority high --tag work
```

Tasks are stored in `~/.todo.json`.

## Tests

```sh
pip install pytest
pytest -v
```
