"""Entry point for the snake game."""
import curses
from snake.menu import title_screen
from snake.game import Game


def main():
    curses.wrapper(_main)


def _main(stdscr):
    while True:
        choice = title_screen(stdscr)
        if choice == "start":
            game = Game(stdscr)
            replay = game.run()
            if not replay:
                break
            # else loop back to start a new game (replay = True)
        elif choice == "highscores":
            from snake.highscore import get_high_scores
            _show_highscores(stdscr, get_high_scores())
            # After viewing, return to title screen
        else:
            # None → quit
            break


def _show_highscores(stdscr, scores):
    height, width = stdscr.getmaxyx()
    stdscr.clear()
    title = "High Scores"
    x_title = (width - len(title)) // 2
    try:
        stdscr.addstr(0, x_title, title)
    except curses.error:
        pass

    row = 2
    for name, score in scores:
        text = f"{name}: {score}"
        try:
            stdscr.addstr(row, (width - len(text)) // 2, text)
        except curses.error:
            pass
        row += 1
        if row >= height - 1:
            break

    prompt = "Press any key to return"
    try:
        stdscr.addstr(row + 2, (width - len(prompt)) // 2, prompt)
    except curses.error:
        pass
    stdscr.refresh()
    stdscr.getch()


if __name__ == "__main__":
    main()
