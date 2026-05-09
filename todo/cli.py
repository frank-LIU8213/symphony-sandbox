"""CLI argument parsing and execution."""
import argparse
import sys
from typing import List, Optional

from .models import Task
from .store import Store, DEFAULT_DB


def main(argv: Optional[List[str]] = None) -> None:
    parser = argparse.ArgumentParser(prog="todo")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_add = sub.add_parser("add", help="add a new task")
    p_add.add_argument("title")
    p_add.add_argument("--priority", default="medium", choices=["low", "medium", "high"])
    p_add.add_argument("--tag", action="append", default=[])

    sub.add_parser("list", help="list all tasks")

    p_done = sub.add_parser("done", help="mark a task as done")
    p_done.add_argument("id", type=int)

    p_rm = sub.add_parser("rm", help="remove a task")
    p_rm.add_argument("id", type=int)

    p_search = sub.add_parser("search", help="search tasks by title")
    p_search.add_argument("query")

    p_filter = sub.add_parser("filter", help="filter tasks by priority or tag")
    p_filter.add_argument("--priority", default=None, choices=["low", "medium", "high"])
    p_filter.add_argument("--tag", default=None)

    args = parser.parse_args(argv)
    store = Store(DEFAULT_DB)

    if args.cmd == "add":
        i = store.add(args.title, priority=args.priority, tags=args.tag)
        print(f"added #{i}")
    elif args.cmd == "list":
        for t in store.list():
            print(_format_task(t))
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
    elif args.cmd == "search":
        for t in store.search(args.query):
            print(_format_task(t))
    elif args.cmd == "filter":
        try:
            for t in store.filter(priority=args.priority, tag=args.tag):
                print(_format_task(t))
        except ValueError as e:
            print(str(e), file=sys.stderr)
            sys.exit(1)


def _format_task(t: Task) -> str:
    mark = "[x]" if t.done else "[ ]"
    tags_str = ",".join(t.tags)
    return f"#{t.id}  {mark}  {t.priority.upper()}  [{tags_str}]  {t.title}"
