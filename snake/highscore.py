"""High score persistence."""
from typing import List, Tuple


def save_high_score(name: str, score: int) -> None:
    """Append score to persistent storage."""
    raise NotImplementedError


def get_high_scores() -> List[Tuple[str, int]]:
    """Return sorted list of (name, score)."""
    raise NotImplementedError
