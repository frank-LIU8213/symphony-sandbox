"""Rendering utilities for the snake game."""
import curses
from .models import Drawable
from .game import GameState


class Renderer:
    def draw(self, state: GameState) -> None:
        """Draw the board, snake, beans, score, and extra drawables."""
        raise NotImplementedError
