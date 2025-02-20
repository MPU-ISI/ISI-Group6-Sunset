#!/usr/bin/env python3

import re
import pytest  # noqa: F401
from nvm import nvm  # noqa: F401

from nvm.aux_str import clean_str
from nvm.aux_str import CLEAN_STR_MAPPINGS_TINY
from nvm.aux_str import REGEX_ABC_DASH_XYZ_ASTERISK as re0

from nvm.aux_str import is_ascii
from nvm.aux_str import is_ascii_alt


class TestAuxStr:
    def test_clean_str_one(self):
        text_dirty = "  one two  three\t \n\n\r four...  "
        text_clean = clean_str(text=text_dirty, mappings=CLEAN_STR_MAPPINGS_TINY)
        assert text_clean == "one two three four..."

    def test_clean_str_zero(self):
        mappings = [{"": [re.compile(r".*")]}]
        text_dirty = "abcABC"
        text_clean = clean_str(text=text_dirty, mappings=mappings)
        assert text_clean == ""

    def test_clean_str_re(self):
        mappings = [{"": [re.compile(r"[abc]")]}]
        text_dirty = "abcABC"
        text_clean = clean_str(text=text_dirty, mappings=mappings)
        assert text_clean == "ABC"

    def test_clean_str_rei(self):
        mappings = [{"": [re.compile(r"[abc]", re.I)]}]
        text_dirty = "abcABC"
        text_clean = clean_str(text=text_dirty, mappings=mappings)
        assert text_clean == ""

    def test_clean_str_non_awkward_mappings(self):
        mappings = [{"a": list("ABC")}, {"e": list("EFG")}]
        text_dirty = "ABCEFG"
        text_clean = clean_str(text=text_dirty, mappings=mappings)
        assert text_clean == "aaaeee"

    def test_clean_str_awkward_mappings(self):
        mappings = [{"a": list("ABC"), "e": list("EFG")}]
        text_dirty = "ABCEFG"
        text_clean = clean_str(text=text_dirty, mappings=mappings)
        assert text_clean == "aaaeee"

    def test_REGEX_ABC_DASH_XYZ_ASTERISK(self):
        assert bool(re0.match("i"))
        assert bool(re0.match("abc"))
        assert bool(re0.match("abc*"))
        assert bool(re0.match("abc-xyz"))
        assert bool(re0.match("abc-xyz*"))
        assert not bool(re0.match("-abc"))
        assert not bool(re0.match("*abc"))
        assert not bool(re0.match("xyz-"))
        assert not bool(re0.match("abc--xyz"))
        assert not bool(re0.match("abc*xyz"))

    def test_is_ascii(self):
        assert is_ascii("abc 123")
        assert not is_ascii("abc 123 ×")
        assert not is_ascii("abc 123 ")

    def test_is_ascii_alt(self):
        assert is_ascii_alt("abc 123")
        assert not is_ascii_alt("abc 123 ×")
        assert not is_ascii_alt("abc 123 ")
