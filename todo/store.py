"""Store implementation for tasks."""
import json
from pathlib import Path
from typing import List, Optional

from .models import Task

DEFAULT_DB = Path.home() / ".todo.json"


class Store:
    def __init__(self, path: Path = DEFAULT_DB) -> None:
        self.path = Path(path)

    def _load(self) -> List[Task]:
        if not self.path.exists():
            return []
        data = json.loads(self.path.read_text())
        return [Task.from_dict(t) for t in data]

    def _save(self, tasks: List[Task]) -> None:
        self.path.write_text(json.dumps([t.__dict__ for t in tasks], indent=2))

    def add(self, title: str, priority: str = "medium", tags: Optional[List[str]] = None) -> int:
        tasks = self._load()
        next_id = max((t.id for t in tasks), default=0) + 1
        tasks.append(Task(id=next_id, title=title, priority=priority, tags=tags or []))
        self._save(tasks)
        return next_id

    def list(self) -> List[Task]:
        return self._load()

    def done(self, task_id: int) -> bool:
        tasks = self._load()
        for t in tasks:
            if t.id == task_id:
                t.done = True
                self._save(tasks)
                return True
        return False

    def remove(self, task_id: int) -> bool:
        tasks = self._load()
        new_tasks = [t for t in tasks if t.id != task_id]
        if len(new_tasks) == len(tasks):
            return False
        for i, t in enumerate(new_tasks, 1):
            t.id = i
        self._save(new_tasks)
        return True

    def search(self, query: str) -> List[Task]:
        tasks = self._load()
        query_lower = query.lower()
        return [t for t in tasks if query_lower in t.title.lower()]

    def filter(self, priority: Optional[str] = None, tag: Optional[str] = None) -> List[Task]:
        if priority is None and tag is None:
            raise ValueError("Must provide at least one of --priority or --tag")
        tasks = self._load()
        result = tasks
        if priority is not None:
            result = [t for t in result if t.priority == priority]
        if tag is not None:
            result = [t for t in result if tag in t.tags]
        return result
