#!/usr/bin/env python3

"""This module contains some useful regular expressions.

Examples
--------

>>> from nvm.aux_str.regex import REGEX_ABC_DASH_XYZ_ASTERISK as re0
>>> re0.pattern
'^[a-z]+(\\-[a-z]+)*\\*?$'

"""


import re

# "abc[-]xyz[*]"-like
REGEX_ABC_DASH_XYZ_ASTERISK = re.compile(r"^[a-z]+(\-[a-z]+)*\*?$", re.IGNORECASE)
