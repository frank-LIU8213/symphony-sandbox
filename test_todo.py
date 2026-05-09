"""Tests for the todo CLI store."""
import pytest

from todo import Store, main


@pytest.fixture
def store(tmp_path):
    return Store(tmp_path / "todo.json")


def test_add_first_task_gets_id_one(store):
    assert store.add("task1") == 1


def test_add_increments_id(store):
    store.add("task1")
    assert store.add("task2") == 2


def test_list_returns_tasks_in_insertion_order(store):
    store.add("a")
    store.add("b")
    store.add("c")
    tasks = store.list()
    assert [t.title for t in tasks] == ["a", "b", "c"]


def test_done_marks_existing_task(store):
    store.add("task1")
    assert store.done(1) is True
    tasks = store.list()
    assert tasks[0].done is True


def test_done_returns_false_for_missing_id(store):
    assert store.done(99) is False


def test_remove_drops_existing_task(store):
    store.add("a")
    store.add("b")
    assert store.remove(1) is True
    remaining = store.list()
    assert len(remaining) == 1
    assert remaining[0].title == "b"
    assert remaining[0].id == 1


def test_remove_returns_false_for_missing_id(store):
    assert store.remove(99) is False


def test_remove_renumbers_remaining_tasks(store):
    store.add("a")
    store.add("b")
    store.add("c")
    assert store.remove(2) is True
    tasks = store.list()
    assert len(tasks) == 2
    assert tasks[0].id == 1
    assert tasks[0].title == "a"
    assert tasks[1].id == 2
    assert tasks[1].title == "c"


def test_add_after_remove_continues_from_max_id(store):
    store.add("a")
    store.add("b")
    store.add("c")
    store.remove(2)
    assert store.add("d") == 3


def test_list_output_format(store, capsys):
    store.add("buy milk")
    store.add("walk dog")
    store.done(2)
    main(["list"])
    captured = capsys.readouterr()
    lines = captured.out.strip().split("\n")
    assert lines[0] == "#1  [ ]  buy milk"
    assert lines[1] == "#2  [x]  walk dog"
