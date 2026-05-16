"""Core game logic and state."""
import curses
import random
import time
from typing import List, Tuple, Optional, Dict
from .models import Direction, Bean, Drawable, EffectHandler, BeanType
from . import beans as beans_module
from . import effects as effects_module

DIR_VECTORS = {
    Direction.UP: (0, -1),
    Direction.DOWN: (0, 1),
    Direction.LEFT: (-1, 0),
    Direction.RIGHT: (1, 0),
}

EFFECT_COLOR_MAP = {
    "speed_up": curses.COLOR_YELLOW,
    "slow_down": curses.COLOR_CYAN,
    "invert_controls": curses.COLOR_RED,
    "shield": curses.COLOR_GREEN,
}


class GameState:
    def __init__(self):
        self.snake: List[Tuple[int, int]] = [(10, 10)]
        self.direction: Direction = Direction.RIGHT
        self.beans: List[Bean] = []
        self.score: int = 0
        self.game_over: bool = False
        self.base_tick_interval: int = 200  # ms, unmodified speed
        self.tick_interval: int = self.base_tick_interval
        self.drawables: List[Drawable] = []
        self.effects_handlers: List[EffectHandler] = []
        self.active_effects: List[Tuple[str, int]] = []  # (effect_type, remaining_ticks)
        self.board_w: int = 40
        self.board_h: int = 20
        self._effect_drawables: Dict[str, Drawable] = {}

        # Effect flags, recalculated every tick
        self.invert_controls: bool = False
        self.shield_active: bool = False
        self.score_multiplier: int = 1

    def _find_handler(self, effect_type: str) -> Optional[EffectHandler]:
        for handler in self.effects_handlers:
            if getattr(handler, "effect_type", "") == effect_type:
                return handler
        return None

    def add_drawable(self, d: Drawable) -> None:
        self.drawables.append(d)

    def remove_drawable(self, d: Drawable) -> None:
        if d in self.drawables:
            self.drawables.remove(d)

    def add_effect(self, effect_type: str, duration_ticks: int) -> None:
        handler = self._find_handler(effect_type)
        if handler is not None:
            drawable = handler.get_drawable(self, effect_type)
            if drawable is not None:
                self.add_drawable(drawable)
                self._effect_drawables[effect_type] = drawable
        self.active_effects.append((effect_type, duration_ticks))

    def tick_effects(self) -> None:
        new_active: List[Tuple[str, int]] = []
        for etype, remaining in self.active_effects:
            remaining -= 1
            if remaining > 0:
                new_active.append((etype, remaining))
            else:
                # Effect expired → remove its drawable if it still exists
                drawable = self._effect_drawables.pop(etype, None)
                if drawable is not None:
                    self.remove_drawable(drawable)
        self.active_effects = new_active

    def apply_effect(self, effect_type: str) -> None:
        handler = self._find_handler(effect_type)
        if handler is not None:
            handler.apply(self, effect_type)


class Game:
    def __init__(self, stdscr: curses.window):
        self.stdscr = stdscr
        self.state = GameState()

    def run(self) -> bool:
        """Run one game session. Returns True if the player wants a replay."""
        from .renderer import Renderer
        from .input_handler import InputHandler

        bean_types = beans_module.init_beans()
        # Initialise colour pairs for bean types
        initialized_colors = set()
        for bt in bean_types:
            if bt.color not in initialized_colors:
                if bt.effect is not None:
                    fg = EFFECT_COLOR_MAP.get(bt.effect, curses.COLOR_WHITE)
                else:
                    fg = curses.COLOR_WHITE
                curses.init_pair(bt.color, fg, curses.COLOR_BLACK)
                initialized_colors.add(bt.color)

        self.state.effects_handlers = effects_module.init_effects()

        # Determine board dimensions from terminal
        max_y, max_x = self.stdscr.getmaxyx()
        self.state.board_w = max(10, max_x - 2)
        self.state.board_h = max(8, max_y - 3)

        renderer = Renderer(self.stdscr)
        self.renderer = renderer
        input_handler = InputHandler(self.stdscr, self.state)
        self.input_handler = input_handler

        curses.curs_set(0)
        self.stdscr.nodelay(True)

        self.state.tick_interval = self.state.base_tick_interval

        # Spawn a few initial beans
        for _ in range(3):
            self._spawn_bean(bean_types)

        # Main game loop
        while not self.state.game_over:
            # ---- INPUT ---------------------------------------------------
            old_dir = self.state.direction
            new_dir = self.input_handler.get_direction(self.state.direction)
            # Prevent 180° reversal
            if (new_dir == Direction.UP and old_dir != Direction.DOWN) or \
               (new_dir == Direction.DOWN and old_dir != Direction.UP) or \
               (new_dir == Direction.LEFT and old_dir != Direction.RIGHT) or \
               (new_dir == Direction.RIGHT and old_dir != Direction.LEFT):
                self.state.direction = new_dir

            # ---- MOVE ---------------------------------------------------
            head = self.state.snake[0]
            dx, dy = DIR_VECTORS[self.state.direction]
            new_head = (head[0] + dx, head[1] + dy)

            # Wall collision
            collision = (
                new_head[0] < 0
                or new_head[0] >= self.state.board_w
                or new_head[1] < 0
                or new_head[1] >= self.state.board_h
            )
            if collision and not self.state.shield_active:
                self.state.game_over = True
                break
            # Self collision
            if new_head in self.state.snake and not self.state.shield_active:
                self.state.game_over = True
                break

            # Insert new head (may be out of bounds if shielded)
            self.state.snake.insert(0, new_head)

            # ---- EAT BEAN -----------------------------------------------
            bean_eaten = None
            for bean in self.state.beans:
                if bean.x == new_head[0] and bean.y == new_head[1]:
                    bean_eaten = bean
                    break
            if bean_eaten is not None:
                multiplier = 2 if any(e == "double_score" for e, _ in self.state.active_effects) else 1
                if bean_eaten.type.effect is None:
                    # Normal bean
                    self.state.score += 10 * multiplier
                else:
                    # Special bean
                    self.state.apply_effect(bean_eaten.type.effect)
                    self.state.add_effect(bean_eaten.type.effect, 30)
                    # Recalculate multiplier including the newly added effect
                    multiplier = 2 if any(e == "double_score" for e, _ in self.state.active_effects) else 1
                    self.state.score += 10 * multiplier
                self.state.beans.remove(bean_eaten)
                # Don't pop tail → snake grows
            else:
                # No bean eaten → remove tail
                self.state.snake.pop()

            # ---- EFFECTS ------------------------------------------------
            self.state.tick_effects()

            # Recalculate game parameters from active effects
            active = self.state.active_effects

            # Speed factor
            speed_factor = 1.0
            if any(e == "speed_up" for e, _ in active):
                speed_factor = 0.5
            elif any(e == "slow_down" for e, _ in active):
                speed_factor = 2.0
            self.state.tick_interval = int(self.state.base_tick_interval * speed_factor)

            # Flags
            self.state.invert_controls = any(e == "invert" for e, _ in active)
            self.state.shield_active = any(e == "shield" for e, _ in active)
            self.state.score_multiplier = 2 if any(e == "double_score" for e, _ in active) else 1

            # ---- SPAWN BEANS --------------------------------------------
            if len(self.state.beans) < 5 and random.random() < 0.3:
                self._spawn_bean(bean_types)

            # ---- RENDER -------------------------------------------------
            if self.renderer:
                self.renderer.draw(self.state)

            # ---- TICK DELAY ---------------------------------------------
            curses.napms(self.state.tick_interval)

        # ---- GAME OVER --------------------------------------------------
        # Save a high score (default name for now)
        from .highscore import save_high_score
        try:
            save_high_score("Player", self.state.score)
        except Exception:
            pass

        from .menu import game_over_screen
        replay = game_over_screen(self.stdscr, self.state.score)
        return bool(replay)

    def _spawn_bean(self, bean_types: List["BeanType"]) -> None:
        weights = [bt.probability for bt in bean_types]
        chosen = random.choices(bean_types, weights=weights, k=1)[0]
        occupied = set(self.state.snake)
        occupied |= {(b.x, b.y) for b in self.state.beans}
        for _ in range(50):  # try up to 50 times
            x = random.randint(0, self.state.board_w - 1)
            y = random.randint(0, self.state.board_h - 1)
            if (x, y) not in occupied:
                self.state.beans.append(Bean(x=x, y=y, type=chosen))
                break
