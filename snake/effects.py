"""Effect handlers."""
import curses
from typing import List, Optional

from .models import Drawable, EffectHandler, GameState


# ---------------------------------------------------------------------------
# Drawable that shows an effect indicator near the top‑right corner of the
# playable board.
# ---------------------------------------------------------------------------
class EffectIndicator:
    """A small indicator drawn near the board corner while an effect is active."""

    def __init__(self, state: GameState, symbol: str, color_pair: int) -> None:
        # Position relative to the board's top‑left corner.
        self._rel_x = state.board_w - 2
        self._rel_y = 1
        self._symbol = symbol
        self._color = color_pair

    def draw(self, window: curses.window, board_x: int, board_y: int) -> None:
        """Draw the indicator on the curses window."""
        y = board_y + self._rel_y
        x = board_x + self._rel_x
        try:
            window.addch(y, x, self._symbol, curses.color_pair(self._color))
        except curses.error:
            pass  # ignore drawing errors on edge of screen


# ---------------------------------------------------------------------------
# Single effect handler that handles all special bean types.
# ---------------------------------------------------------------------------
class GeneralEffectHandler:
    """Handles all effect types defined in the bean list."""

    # Mapping from effect_type → (symbol, color_pair)
    _EFFECT_DRAW = {
        "speed_up": ("S", 2),
        "slow_down": ("W", 3),
        "invert": ("I", 4),
        "shield": ("D", 5),
        "shrink": ("R", 6),
        "double_score": ("M", 7),
    }

    def apply(self, state: GameState, effect_type: str) -> None:
        """Immediate effect when the bean is eaten."""
        if effect_type == "shrink":
            # Remove the last two segments of the snake if possible.
            if len(state.snake) > 2:
                state.snake = state.snake[:-2]
        # Other effects are handled entirely via active_effects in the
        # integration loop; no immediate state change needed here.

    def get_drawable(
        self, state: GameState, effect_type: str
    ) -> Optional[Drawable]:
        """Return a drawable that will be shown while the effect is active."""
        entry = self._EFFECT_DRAW.get(effect_type)
        if entry is None:
            return None
        symbol, color = entry
        return EffectIndicator(state, symbol, color)


def init_effects() -> List[EffectHandler]:
    """Return all effect handler instances."""
    return [GeneralEffectHandler()]
