"""Shared types for the snake game."""
from dataclasses import dataclass
from enum import Enum, auto
from typing import List, Optional, Tuple, Protocol
import curses


class Direction(Enum):
    UP = auto()
    DOWN = auto()
    LEFT = auto()
    RIGHT = auto()


@dataclass
class BeanType:
    name: str
    symbol: str
    color: int  # curses color pair number
    effect: Optional[str] = None
    probability: float = 1.0


@dataclass
class Bean:
    x: int
    y: int
    type: BeanType


class Drawable(Protocol):
    def draw(self, window: curses.window, board_x: int, board_y: int) -> None:
        ...


class EffectHandler(Protocol):
    def apply(self, state: "GameState", effect_type: str) -> None:
        ...

    def get_drawable(self, state: "GameState", effect_type: str) -> Optional[Drawable]:
        ...
