"""Core game logic and state."""
import curses
from typing import List, Tuple, Optional
from .models import Direction, Bean, Drawable, EffectHandler


class GameState:
    def __init__(self):
        self.snake: List[Tuple[int, int]] = [(10, 10)]
        self.direction: Direction = Direction.RIGHT
        self.beans: List[Bean] = []
        self.score: int = 0
        self.game_over: bool = False
        self.tick_interval: int = 200  # ms
        self.drawables: List[Drawable] = []
        self.effects_handlers: List[EffectHandler] = []
        self.active_effects: List[Tuple[str, int]] = []  # (effect_type, remaining_ticks)
        self.board_w: int = 40
        self.board_h: int = 20

    def add_drawable(self, d: Drawable) -> None:
        self.drawables.append(d)

    def remove_drawable(self, d: Drawable) -> None:
        if d in self.drawables:
            self.drawables.remove(d)

    def add_effect(self, effect_type: str, duration_ticks: int) -> None:
        # Add or refresh the effect; logic will be implemented by integrator
        raise NotImplementedError

    def tick_effects(self) -> None:
        # Decrement durations, remove expired effects and their drawables
        raise NotImplementedError

    def apply_effect(self, effect_type: str) -> None:
        # Find the appropriate handler and invoke apply()
        raise NotImplementedError


class Game:
    def __init__(self, stdscr: curses.window):
        self.stdscr = stdscr
        self.state = GameState()
        from .renderer import Renderer
        from .input_handler import InputHandler
        self.renderer = Renderer()
        self.input_handler = InputHandler(stdscr)

    def run(self) -> None:
        """Main game loop. To be implemented by integrator."""
        raise NotImplementedError
