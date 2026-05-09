"""Tiny CLI todo manager."""
import argparse
import json
import sys
from dataclasses import dataclass, asdict, field
from datetime import datetime, timezone
from pathlib import Path

DEFAULT_DB = Path.home() / ".todo.json"


@dataclass
class Task:
    id: int
    title: str
    done: bool = False
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class Store:
    def __init__(self, path):
        self.path = Path(path)

    def _load(self):
        if not self.path.exists():
            return []
        data = json.loads(self.path.read_text())
        return [Task(**t) for t in data]

    def _save(self, tasks):
        self.path.write_text(json.dumps([asdict(t) for t in tasks], indent=2))

    def add(self, title):
        tasks = self._load()
        next_id = max([t.id for t in tasks], default=0) + 1
        tasks.append(Task(id=next_id, title=title))
        self._save(tasks)
        return next_id

    def list(self):
        return self._load()

    def done(self, task_id):
        tasks = self._load()
        for t in tasks:
            if t.id == task_id:
                t.done = True
                self._save(tasks)
                return True
        return False

    def remove(self, task_id):
        tasks = self._load()
        new_tasks = [t for t in tasks if t.id != task_id]
        if len(new_tasks) == len(tasks):
            return False
        for i, t in enumerate(new_tasks, 1):
            t.id = i
        self._save(new_tasks)
        return True


def main(argv=None):
    parser = argparse.ArgumentParser(prog="todo")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_add = sub.add_parser("add", help="add a new task")
    p_add.add_argument("title")

    sub.add_parser("list", help="list all tasks")

    p_done = sub.add_parser("done", help="mark a task as done")
    p_done.add_argument("id", type=int)

    p_rm = sub.add_parser("rm", help="remove a task")
    p_rm.add_argument("id", type=int)

    args = parser.parse_args(argv)
    store = Store(DEFAULT_DB)

    if args.cmd == "add":
        i = store.add(args.title)
        print(f"added #{i}")
    elif args.cmd == "list":
        for t in store.list():
            mark = "[x]" if t.done else "[ ]"
            print(f"#{t.id}  {mark}  {t.title}")
    elif args.cmd == "done":
        if not store.done(args.id):
            print("not found", file=sys.stderr)
            sys.exit(1)
        print("ok")
    elif args.cmd == "rm":
        if not store.remove(args.id):
            print("not found", file=sys.stderr)
            sys.exit(1)
        print("ok")


if __name__ == "__main__":
    main()
