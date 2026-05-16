"""Input handling for the snake game."""
import curses
from .models import Direction


class InputHandler:
    def __init__(self, window: curses.window):
        self.window = window

    def get_direction(self, current_dir: Direction) -> Direction:
        """Non-blocking read; return new direction if a valid key is pressed, else current."""
        raise NotImplementedError
