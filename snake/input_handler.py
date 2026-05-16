"""Input handling for the snake game."""
import curses
from .models import Direction


class InputHandler:
    def __init__(self, window: curses.window):
        self.window = window

    # Arrow keys + WASD → Direction. 180° reversal is rejected by the
    # caller (Game.run), so this only maps the raw requested direction.
    _KEY_MAP = {
        curses.KEY_UP: Direction.UP,
        curses.KEY_DOWN: Direction.DOWN,
        curses.KEY_LEFT: Direction.LEFT,
        curses.KEY_RIGHT: Direction.RIGHT,
        ord("w"): Direction.UP,
        ord("s"): Direction.DOWN,
        ord("a"): Direction.LEFT,
        ord("d"): Direction.RIGHT,
        ord("W"): Direction.UP,
        ord("S"): Direction.DOWN,
        ord("A"): Direction.LEFT,
        ord("D"): Direction.RIGHT,
    }

    def get_direction(self, current_dir: Direction) -> Direction:
        """Non-blocking read; return new direction if a valid key is
        pressed, else the current direction. Game.run() puts the window
        in nodelay mode, so getch() returns -1 when no key is queued.
        Drains the input buffer so only the latest keypress wins."""
        new_dir = current_dir
        while True:
            key = self.window.getch()
            if key == -1:
                break
            mapped = self._KEY_MAP.get(key)
            if mapped is not None:
                new_dir = mapped
        return new_dir
