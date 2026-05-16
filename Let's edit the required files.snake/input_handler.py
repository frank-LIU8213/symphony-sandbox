"""Input handling for the snake game."""
import curses
from .models import Direction, GameState


class InputHandler:
    def __init__(self, window: curses.window, state: GameState):
        self.window = window
        self.state = state

    def get_direction(self, current_dir: Direction) -> Direction:
        """Non-blocking read; return new direction if a valid key is pressed, else current."""
        key = self.window.getch()
        if key == -1:
            return current_dir

        # Map arrow keys to direction
        dir_map = {
            curses.KEY_UP: Direction.UP,
            curses.KEY_DOWN: Direction.DOWN,
            curses.KEY_LEFT: Direction.LEFT,
            curses.KEY_RIGHT: Direction.RIGHT,
        }
        new_dir = dir_map.get(key, None)
        if new_dir is None:
            return current_dir

        # Invert controls if the invert effect is active
        if getattr(self.state, "invert_controls", False):
            invert = {
                Direction.UP: Direction.DOWN,
                Direction.DOWN: Direction.UP,
                Direction.LEFT: Direction.RIGHT,
                Direction.RIGHT: Direction.LEFT,
            }
            new_dir = invert.get(new_dir, current_dir)

        return new_dir
