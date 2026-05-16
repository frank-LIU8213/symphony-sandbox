"""Rendering utilities for the snake game."""
import curses
from .game import GameState


class Renderer:
    def __init__(self, window: curses.window) -> None:
        self.window = window

    def draw(self, state: GameState) -> None:
        self.window.clear()

        # ---- snake -------------------------------------------------------
        for idx, (x, y) in enumerate(state.snake):
            ch = "O" if idx == 0 else "o"
            self.window.addch(y, x, ch)

        # ---- beans -------------------------------------------------------
        for bean in state.beans:
            self.window.attron(curses.color_pair(bean.type.color))
            self.window.addch(bean.y, bean.x, bean.type.symbol)
            self.window.attroff(curses.color_pair(bean.type.color))

        # ---- extra drawables --------------------------------------------
        for d in state.drawables:
            d.draw(self.window, board_x=0, board_y=0)

        # ---- score / info -----------------------------------------------
        active_info = ', '.join(et for et, _ in state.active_effects) if state.active_effects else "none"
        info = f"Score: {state.score}   Effects: {active_info}"
        self.window.addstr(state.board_h, 0, info)

        self.window.refresh()
