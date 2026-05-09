"""Tests for the todo CLI layer."""
import pytest
from unittest.mock import patch
from todo.cli import main
from todo.store import Store


@pytest.fixture
def db_path(tmp_path):
    p = str(tmp_path / "todo.json")
    with patch("todo.cli.DEFAULT_DB", p):
        yield p


def test_list_output_format(db_path, capsys):
    store = Store(db_path)
    store.add("buy milk")
    store.add("walk dog")
    store.done(2)
    main(["list"])
    captured = capsys.readouterr()
    lines = captured.out.strip().split("\n")
    assert lines[0] == "#1  [ ]  MEDIUM  []  buy milk"
    assert lines[1] == "#2  [x]  MEDIUM  []  walk dog"


def test_add_with_priority_and_tags(db_path, capsys):
    main(["add", "--priority", "high", "--tag", "work", "--tag", "urgent", "buy milk"])
    captured = capsys.readouterr()
    assert "added #1" in captured.out
    
    main(["list"])
    captured = capsys.readouterr()
    lines = captured.out.strip().split("\n")
    assert lines[0] == "#1  [ ]  HIGH  [work,urgent]  buy milk"


def test_search(db_path, capsys):
    store = Store(db_path)
    store.add("Buy Milk")
    store.add("Walk Dog")
    main(["search", "milk"])
    captured = capsys.readouterr()
    lines = captured.out.strip().split("\n")
    assert len(lines) == 1
    assert "Buy Milk" in lines[0]


def test_filter_priority(db_path, capsys):
    store = Store(db_path)
    store.add("task1", priority="high")
    store.add("task2", priority="low")
    main(["filter", "--priority", "high"])
    captured = capsys.readouterr()
    lines = captured.out.strip().split("\n")
    assert len(lines) == 1
    assert "task1" in lines[0]


def test_filter_tag(db_path, capsys):
    store = Store(db_path)
    store.add("task1", tags=["work"])
    store.add("task2", tags=["personal"])
    main(["filter", "--tag", "work"])
    captured = capsys.readouterr()
    lines = captured.out.strip().split("\n")
    assert len(lines) == 1
    assert "task1" in lines[0]


def test_filter_no_args_exits_with_error(db_path, capsys):
    with pytest.raises(SystemExit) as exc_info:
        main(["filter"])
    assert exc_info.value.code == 1
