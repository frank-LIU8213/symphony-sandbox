"""Data models for the todo application."""
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Optional


@dataclass
class Task:
    id: int
    title: str
    done: bool = False
    priority: str = "medium"
    tags: List[str] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    @classmethod
    def from_dict(cls, data: dict) -> "Task":
        """Backward-compatible deserialization."""
        return cls(
            id=data["id"],
            title=data["title"],
            done=data.get("done", False),
            priority=data.get("priority", "medium"),
            tags=data.get("tags", []),
            created_at=data.get("created_at", datetime.now(timezone.utc).isoformat()),
        )
