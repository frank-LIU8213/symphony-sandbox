"""Tests for the todo CLI store."""
import pytest

from todo import Store


@pytest.fixture
def store(tmp_path):
    return Store(tmp_path / "test.json")


def test_add_first_task_gets_id_one(store):
    assert store.add("first") == 1


def test_add_increments_id(store):
    store.add("a")
    assert store.add("b") == 2


def test_list_returns_tasks_in_insertion_order(store):
    store.add("first")
    store.add("second")
    titles = [t.title for t in store.list()]
    assert titles == ["first", "second"]


def test_done_marks_existing_task(store):
    i = store.add("a")
    assert store.done(i) is True
    assert store.list()[0].done is True


def test_done_returns_false_for_missing_id(store):
    assert store.done(999) is False


def test_remove_drops_existing_task(store):
    store.add("a")
    store.add("b")
    assert store.remove(1) is True
    remaining = store.list()
    assert len(remaining) == 1
    assert remaining[0].title == "b"


def test_remove_returns_false_for_missing_id(store):
    assert store.remove(999) is False
