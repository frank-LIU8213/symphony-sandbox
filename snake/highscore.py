"""High score persistence."""
import json
from pathlib import Path
from typing import List, Tuple

HIGHSCORE_FILE = Path.home() / ".snake_highscores.json"


def save_high_score(name: str, score: int) -> None:
    """Append score to persistent storage."""
    scores = _load_all()
    scores.append((name, score))
    scores.sort(key=lambda x: x[1], reverse=True)
    _save_all(scores)


def get_high_scores() -> List[Tuple[str, int]]:
    """Return sorted list of (name, score)."""
    return _load_all()


def _load_all() -> List[Tuple[str, int]]:
    if not HIGHSCORE_FILE.exists():
        return []
    try:
        data = json.loads(HIGHSCORE_FILE.read_text())
        # data is expected to be a list of [name, score] pairs
        return [(item[0], item[1]) for item in data if isinstance(item, list) and len(item) == 2]
    except (json.JSONDecodeError, IndexError, TypeError):
        return []


def _save_all(scores: List[Tuple[str, int]]) -> None:
    data = [[name, score] for name, score in scores]
    HIGHSCORE_FILE.write_text(json.dumps(data))
