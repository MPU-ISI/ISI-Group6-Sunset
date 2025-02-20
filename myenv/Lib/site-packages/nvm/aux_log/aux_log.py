#!/usr/bin/env python3

"""Logger that handles two outputs (stdout and file)."""

import logging
import pathlib

from datetime import datetime as dt
from pytz import timezone as tz

tz0 = tz("Europe/Berlin")


# LOGGING_LEVELS = ["CRITICAL", "ERROR", "WARNING", "INFO", "DEBUG"]


class Log0:
    """Log0: logger that handles two outputs (stdout and file)."""

    def __init__(
        self,
        dir0="logs",
        fn0=None,
        write=False,
        stream_lvl="INFO",
        file_lvl="DEBUG",
    ):
        """
        Initialize Log0 class.

        Examples
        --------

        Without writing to log file.

        >>> import nvm
        >>> logZ = nvm.Log0(
        >>>     write=False,
        >>>     stream_lvl="INFO",
        >>>     file_lvl="DEBUG",
        >>> )
        >>> log0 = logZ.logger
        >>> # Check log file location
        >>> log0.info(f"{logZ.of0 = }")

        Or simply

        >>> import nvm
        >>> import pathlib
        >>> logZ = nvm.Log0()
        >>> log0 = logZ.logger
        >>> log0.info(f"{pathlib.Path.cwd() = }")


        With writing to log file.

        >>> import nvm
        >>> logZ = nvm.Log0(
        >>>     write=True,
        >>>     stream_lvl="INFO",
        >>>     file_lvl="DEBUG",
        >>> )
        >>> log0 = logZ.logger
        >>> # Check log file location
        >>> log0.info(f"{logZ.of0 = }")

        Change logging levels.

        >>> # Check levels
        >>> log0.info(f"handler0: {logZ.logging.getLevelName(logZ.handler0)}")
        >>> log0.info(f"handler1: {logZ.logging.getLevelName(logZ.handler1)}")
        >>> log0.info(f"logger: {logZ.logging.getLevelName(log0)}")
        >>> # Set levels
        >>> logZ.handler0.setLevel("DEBUG")
        >>> # Check levels again
        >>> log0.info(f"handler0: {logZ.logging.getLevelName(logZ.handler0)}")
        >>> log0.info(f"handler1: {logZ.logging.getLevelName(logZ.handler1)}")
        >>> log0.info(f"logger: {logZ.logging.getLevelName(log0)}")
        >>> # Set overall ogging level
        >>> log0.setLevel("CRITICAL")
        >>> log0.info(f"handler0: {logZ.logging.getLevelName(logZ.handler0)}")
        >>> log0.info(f"handler1: {logZ.logging.getLevelName(logZ.handler1)}")
        >>> log0.info(f"logger: {logZ.logging.getLevelName(log0)}")
        >>> # no output expected from log0.info after setting "CRITICAL" logging level

        """
        # Loggig levels
        """
        self.logger.setLevel(logging.CRITICAL) # 50
        self.logger.setLevel(logging.ERROR)    # 40
        self.logger.setLevel(logging.WARNING)  # 30
        self.logger.setLevel(logging.INFO)     # 20
        self.logger.setLevel(logging.DEBUG)    # 10
        self.logger.setLevel(logging.NOTSET)   # 00
        """
        # Setup logging stream handler
        self.handler0 = logging.StreamHandler()
        self.handler0.setFormatter(
            logging.Formatter(
                " ".join(
                    [
                        # "%(asctime)s",
                        # "%(name)s",
                        "%(levelname).1s:",
                        # "%(module)s",
                        # "%(funcName)-16s ",
                        "%(message)s",
                    ]
                ),
                datefmt="%Y%m%dT%H%M%S",
            )
        )
        self.file_lvl = file_lvl
        self.stream_lvl = stream_lvl
        self.logging = logging  # module accessible from instance
        self.logger = logging.getLogger(__name__)
        self.handler0.setLevel(self.stream_lvl)
        self.logger.setLevel(self.handler0.level)

        # Detach any old handlers
        for handler in self.logger.handlers[:]:
            self.logger.removeHandler(handler)

        # Attach new handle
        self.logger.addHandler(self.handler0)

        if not write:
            self.of0 = None
        else:
            self.dir0 = pathlib.Path(dir0)
            self.fn0 = (
                str(fn0)
                if fn0 is not None
                else f"{dt.now(tz0).strftime('%Y%m%dT%H%M%S')}.log"
            )
            self.of0 = self.dir0 / self.fn0
            self.dir0.mkdir(mode=0o700, parents=True, exist_ok=True)
            # Setup logging file handler
            self.handler1 = logging.FileHandler(self.of0)
            self.handler1.setFormatter(
                logging.Formatter(
                    " ".join(
                        [
                            "%(asctime)s",
                            # "%(name)s",
                            "%(levelname).1s:",
                            # "%(module)s",
                            "%(funcName)-16s ",
                            "%(message)s",
                        ]
                    ),
                    datefmt="%Y%m%dT%H%M%S",
                )
            )

            # Set logging levels
            self.handler1.setLevel(self.file_lvl)
            self.logger.setLevel(min(self.handler0.level, self.handler1.level))
            # Attach new handle
            self.logger.addHandler(self.handler1)
