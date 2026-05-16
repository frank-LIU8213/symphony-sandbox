"""Title screen and game over screen."""
from typing import Optional
import curses


def title_screen(stdscr: curses.window) -> Optional[str]:
    """Show title screen, return 'start' to play, 'highscores' to view, or None to quit."""
    raise NotImplementedError


def game_over_screen(stdscr: curses.window, score: int) -> bool:
    """Show game over screen with score, return True to play again."""
    raise NotImplementedError
