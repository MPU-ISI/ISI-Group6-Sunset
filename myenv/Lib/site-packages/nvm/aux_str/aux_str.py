#!/usr/bin/env python3


import re
from typing import (
    List,
    Dict,
    Pattern,
    Union,
)

from .clean_str_mappings import (  # noqa: F401
    CLEAN_STR_MAPPINGS_DROP_HASHTAGS,
    CLEAN_STR_MAPPINGS_TINY,
    CLEAN_STR_MAPPINGS_LARGE,
    CLEAN_STR_MAPPINGS_HUGE,
    CLEAN_STR_MAPPINGS_SPACE,
)


def is_ascii(s: str) -> bool:
    """Check if the characters in string s are in ASCII.

    Parameters
    ----------
    s : str
        String to be checked if it contains only ASCII characters.

    Returns
    -------
    bool
        ``True`` if ``s`` contains only ASCII characters.

    Examples
    --------

    >>> from nvm.aux_str import is_ascii
    >>> assert is_ascii("abc 123")
    >>> assert not is_ascii("abc 123 ×")
    >>> assert not is_ascii("abc 123 ")

    """
    return all(ord(c) < 128 for c in s)


def is_ascii_alt(s: str) -> bool:
    """Check if the characters in string s are in ASCII, U+0-U+7F.

    Parameters
    ----------
    s : str
        String to be checked if it contains only ASCII characters.


    Returns
    -------
    bool
        ``True`` if ``s`` contains only ASCII characters.


    Examples
    --------

    >>> from nvm.aux_str import is_ascii_alt
    >>> assert is_ascii_alt("abc 123")
    >>> assert not is_ascii_alt("abc 123 ×")
    >>> assert not is_ascii_alt("abc 123 ")

    """
    return len(s) == len(s.encode())


def clean_str(
    text: str,
    mappings: List[Dict[str, List[Union[str, Pattern[str]]]]] = CLEAN_STR_MAPPINGS_TINY,
) -> str:
    """Clean string replacing any unwanted text with the desired.

    This function can be used to clean text from redundant whitespace characters
    and other common problems.

    Parameters
    ----------
    text : str
        Text to be cleaned.

    mappings : List[Dict[str, List[Union[str, Pattern[str]]]]], default=[{' ': ['\\n', '\\r', '\\t']}, {'-': ['−', '–', '—', '―', '﹣', '－']}]
        List of mappings to be used for text cleaning. This should be a list of
        dictionaries. Dictionary keys should contain strings that are used as
        replacement for matches of string patterns or regexes provided as list
        in dictionary key value. The default value is sourced from ``nvm.aux_str.clean_str_mappings.CLEAN_STR_MAPPINGS_TINY``.

    Returns
    -------
    str
        Clean text.

    Examples
    --------
    To clean a string use:

    >>> from nvm.aux_str import clean_str
    >>> text_dirty = "  one two  three\\t \\n\\n\\r four...  "
    >>> text_clean = clean_str(text=text_dirty)
    >>> # print(text_dirty)
    >>> print(text_clean)
    "one two three four..."

    This function can be applied to pandas dataframe column, for example:

    >>> # let df0 be a dataframe that contains text column "text"
    >>> # to clean its content in place we may run
    >>> text_field = "text"
    >>> df0[text_field] = df0[text_field].apply(clean_str)

    .. role:: python(code)
        :language: python


    The ``mappings`` argument should be a list of dictionaries that define
    string pattern- or regex-based replacements used for text cleaning.
    Dictionary keys should contain strings that are used as replacement for
    matches of patterns provided as list in corresponding (dictionary key) value
    (:python:`List[Dict[str, List[Union[str, Pattern[str]]]]]`).

    For example, to replace all occurrences of
    LF (Line Feed, ``"\\n"``),
    CR (Carriage Return, ``"\\r"``) and
    HT (Horizontal Tab, ``"\\t"``) with
    ``" "`` (space), as well as,
    replace all occurrences of some dash-like characters with ``"-"``,
    the following mapping can be used:

    >>> mappings = [
    >>>     {
    >>>         " ": [  # Unicode Character 'SPACE' (U+0020)
    >>>             "\\n",  # LF (Line Feed)
    >>>             "\\r",  # CR (Carriage Return)
    >>>             "\\t",  # HT (Horizontal Tab)
    >>>         ],
    >>>     },
    >>>     {
    >>>         "-": [  # Unicode Character 'HYPHEN-MINUS' (U+002D) # chr(45) ord("-") ord("\u002D")
    >>>             "\\u2212",  # Unicode Character 'MINUS SIGN' (U+2212)
    >>>             "\\u2013",  # Unicode Character 'EN DASH' (U+2013) # chr(8211) ↔ ord("–") ↔ ord("\u2013")
    >>>             "\\u2014",  # Unicode Character 'EM DASH' (U+2014)
    >>>             "\\u2015",  # Unicode Character 'HORIZONTAL BAR' (U+2015)
    >>>             "\\uFE63",  # Unicode Character 'SMALL HYPHEN-MINUS' (U+FE63)
    >>>             "\\uFF0D",  # Unicode Character 'FULLWIDTH HYPHEN-MINUS' (U+FF0D)
    >>>         ],
    >>>     },
    >>> ]


    .. note::
        **Hint:** an empty string can be used to remove text matching a regex, for
        example:

        >>> mappings = [{"": [re.compile(r"[0-9]")]}]  # remove digits


    :python:`nvm.aux_str` also provides few usefull mappings:

    >>> # Import example mappings:
    >>> from nvm.aux_str import CLEAN_STR_MAPPINGS_TINY
    >>> from nvm.aux_str import CLEAN_STR_MAPPINGS_LARGE
    >>> from nvm.aux_str import CLEAN_STR_MAPPINGS_HUGE
    >>> from nvm.aux_str import CLEAN_STR_MAPPINGS_SPACE
    >>> from nvm.aux_str import CLEAN_STR_MAPPINGS_DROP_HASHTAGS
    >>> # Display sample mapping as JSON:
    >>> import srsly
    >>> print(srsly.json_dumps(CLEAN_STR_MAPPINGS_TINY, indent=2))
    [
      {
        " ":[
          "\\n",
          "\\r",
          "\\t"
        ]
      },
      {
        "-":[
          "\\u2212",
          "\\u2013",
          "\\u2014",
          "\\u2015",
          "\\ufe63",
          "\\uff0d"
        ]
      }
    ]


    Note that we used |json_dumps|_ function from the |srsly|_ library
    to get indented JSON output.

    Drop hashtags

    >>> from nvm.aux_str import CLEAN_STR_MAPPINGS_DROP_HASHTAGS as map0
    >>> from nvm.aux_str import clean_str
    >>> text_dirty = "  #one\\ntwo\\n\\tthree #3443 #three434 #44ok \\t #four... five #hashTag comose text"
    >>> text_clean = clean_str(text=text_dirty, mappings=map0)
    >>> # print(text_dirty)
    >>> print(text_clean)
    "two three #3443 ... five comose text"


    .. |srsly| replace:: ``srsly``
    .. _srsly: https://github.com/explosion/srsly

    .. |json_dumps| replace:: ``json_dumps``
    .. _json_dumps: https://github.com/explosion/srsly/blob/136eb677604e65fd4f00ce9594c6f558b1fc2d3c/srsly/_json_api.py#L10  ## noqa: E501

    """
    # make sure that the text input is str
    text = str(text)
    # substitute each undesired str with the desired one
    for item in mappings:
        for key, val in item.items():
            for pattern in val:
                text = re.sub(pattern, key, text)

    # Finally remove repeated whitespace characters
    text = re.sub(r"\s\s+", " ", text)
    # and strip whitespace at the beginning and end of the output
    text = text.strip()
    return text


def _temp_test_awkward_mappings():
    # mappings = [{"a": list("ABC")}, {"x": list("XYZ")}]
    mappings = [{"a": list("ABC"), "x": list("XYZ")}]
    for item in mappings:
        for key, val in item.items():
            for pattern in val:
                print(pattern, key)
