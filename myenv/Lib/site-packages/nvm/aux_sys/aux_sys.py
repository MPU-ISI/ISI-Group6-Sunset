#!/usr/bin/env python3

import os
import sys
import pwd
import socket
import pathlib
import logging
import contextlib


from typing import (
    Dict,
    Union,
    Optional,
)


def chdir(
    locations: Dict[str, Dict[str, Union[str, pathlib.Path]]],
    log0: Optional[logging.Logger] = logging.getLogger("dummy"),
) -> str:
    """Change current directory according to hostname and username.

    Target directory path is relative to user's ``${HOME}`` directory.

    Parameters
    ----------
    locations : Dict[str, Dict[str, Union[str, pathlib.Path]]]
        Dictionary containing locations, usernames and paths.
    log0 : Optional[logging.Logger]
        Logger.

    Examples
    --------
    >>> import srsly
    >>> import nvm
    >>> locations = \'\'\'
    >>> stardust7:
    >>>   jiko: cc/dev/
    >>> buka2:
    >>>   jiko: cc/cfg/
    >>> \'\'\'
    >>> locations = srsly.yaml_loads(locations)
    >>> print(nvm.chdir(locations))

    """
    hostname = str(socket.gethostname())
    username = str(pwd.getpwuid(os.getuid()).pw_name)
    log0.debug(f"{hostname = }")
    log0.debug(f"{username = }")
    # TODO: add warning if mach is found for hostname or username
    if hostname in locations.keys():
        if username in locations[hostname].keys():
            os.chdir(pathlib.Path.home() / locations[hostname][username])
            log0.info(f"{os.getcwd() = }")

    return pathlib.Path.cwd()


@contextlib.contextmanager
def pushdir(new_dir: Union[str, pathlib.Path]) -> None:
    """Change dir context (non thread-safe).

    Parameters
    ----------
    new_dir : Union[str, pathlib.Path]
        New (temporary path) paths.


    .. warning::
         This function is not thread-safe.


    Examples
    --------
    >>> import os
    >>> from nvm import pushdir
    >>> print(os.getcwd())
    >>> with pushdir('/home/'):
    >>>     print(os.getcwd())
    >>>
    >>> print(os.getcwd())

    """
    old_dir = os.getcwd()
    try:
        os.chdir(new_dir)
        sys.path.insert(0, new_dir)
        yield
    finally:
        del sys.path[0]
        os.chdir(old_dir)
