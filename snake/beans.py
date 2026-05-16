"""Bean types and spawner."""
from typing import List
from .models import BeanType


def init_beans() -> List[BeanType]:
    """Return all available bean types with probabilities."""
    return [
        BeanType(
            name="normal",
            symbol="O",
            color=1,
            effect=None,
            probability=0.50,
        ),
        BeanType(
            name="speed_up",
            symbol="S",
            color=2,
            effect="speed_up",
            probability=0.10,
        ),
        BeanType(
            name="slow_down",
            symbol="W",
            color=3,
            effect="slow_down",
            probability=0.10,
        ),
        BeanType(
            name="invert",
            symbol="I",
            color=4,
            effect="invert",
            probability=0.08,
        ),
        BeanType(
            name="shield",
            symbol="D",
            color=5,
            effect="shield",
            probability=0.08,
        ),
        BeanType(
            name="shrink",
            symbol="R",
            color=6,
            effect="shrink",
            probability=0.07,
        ),
        BeanType(
            name="double_score",
            symbol="M",
            color=7,
            effect="double_score",
            probability=0.07,
        ),
    ]
