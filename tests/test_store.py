"""Tests for the todo CLI store."""
import pytest

from todo.models import Task
from todo.store import Store


@pytest.fixture
def store(tmp_path):
    return Store(tmp_path / "todo.json")


def test_add_first_task_gets_id(store):
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


# New tests
def test_add_default_priority(store):
    store.add("task1")
    tasks = store.list()
    assert tasks[0].priority == "medium"


def test_add_custom_priority_and_tags(store):
    store.add("task1", priority="high", tags=["work", "urgent"])
    tasks = store.list()
    assert tasks[0].priority == "high"
    assert tasks[0].tags == ["work", "urgent"]


def test_tags_persisted(store):
    store.add("task1", tags=["a", "b"])
    store.add("task2", tags=["c"])
    tasks = store.list()
    assert tasks[0].tags == ["a", "b"]
    assert tasks[1].tags == ["c"]


def test_search_case_insensitive(store):
    store.add("Buy Milk")
    store.add("walk dog")
    assert len(store.search("milk")) == 1
    assert len(store.search("WALK")) == 1


def test_filter_priority_and_tag(store):
    store.add("a", priority="high", tags=["work"])
    store.add("b", priority="low", tags=["personal"])
    store.add("c", priority="high", tags=["personal"])
    
    res = store.filter(priority="high", tag="work")
    assert len(res) == 1
    assert res[0].title == "a"
    
    res = store.filter(priority="high", tag="personal")
    assert len(res) == 1
    assert res[0].title == "c"


def test_filter_no_args_raises(store):
    with pytest.raises(ValueError, match="Must provide at least one"):
        store.filter()


def test_list_format_with_tags(store):
    store.add("buy milk", priority="high", tags=["work", "urgent"])
    tasks = store.list()
    assert tasks[0].priority == "high"
    assert tasks[0].tags == ["work", "urgent"]
