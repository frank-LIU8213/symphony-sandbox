"""Title screen and game over screen."""
from typing import Optional
import curses


def title_screen(stdscr: curses.window) -> Optional[str]:
    """Show title screen, return 'start' to play, 'highscores' to view, or None to quit."""
    height, width = stdscr.getmaxyx()
    title = "=== SNAKE ==="
    start_msg = "Press SPACE to start"
    highscores_msg = "Press H for High Scores"
    quit_msg = "Press Q to quit"

    while True:
        stdscr.clear()
        y = height // 2 - 4
        x_title = (width - len(title)) // 2
        try:
            stdscr.addstr(y, x_title, title)
            y += 2
            x_start = (width - len(start_msg)) // 2
            stdscr.addstr(y, x_start, start_msg)
            y += 1
            x_hs = (width - len(highscores_msg)) // 2
            stdscr.addstr(y, x_hs, highscores_msg)
            y += 1
            x_quit = (width - len(quit_msg)) // 2
            stdscr.addstr(y, x_quit, quit_msg)
        except curses.error:
            # Terminal too small — just show minimal prompt
            stdscr.addstr(0, 0, "SNAKE")
            stdscr.addstr(2, 0, "SPACE=start  H=highscores  Q=quit")
        stdscr.refresh()

        key = stdscr.getch()
        if key == ord(' '):
            return "start"
        if key in (ord('h'), ord('H')):
            return "highscores"
        if key in (ord('q'), ord('Q')):
            return None


def game_over_screen(stdscr: curses.window, score: int) -> bool:
    """Show game over screen with score, return True to play again."""
    height, width = stdscr.getmaxyx()
    msg = "GAME OVER"
    score_msg = f"Score: {score}"
    prompt = "Play again? (y/n)"

    while True:
        stdscr.clear()
        y = height // 2 - 2
        x_msg = (width - len(msg)) // 2
        try:
            stdscr.addstr(y, x_msg, msg)
            y += 2
            x_score = (width - len(score_msg)) // 2
            stdscr.addstr(y, x_score, score_msg)
            y += 1
            x_prompt = (width - len(prompt)) // 2
            stdscr.addstr(y, x_prompt, prompt)
        except curses.error:
            stdscr.addstr(0, 0, "GAME OVER")
            stdscr.addstr(2, 0, score_msg)
            stdscr.addstr(4, 0, prompt)
        stdscr.refresh()

        key = stdscr.getch()
        if key in (ord('y'), ord('Y')):
            return True
        if key in (ord('n'), ord('N')):
            return False
