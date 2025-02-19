#!/usr/bin/env python3

"""
Example use:
------------

>>> import srsly
>>> from nvm.aux_spacy.data.NicolasEtAl2019a import nico_dict
>>> print(srsly.yaml_dumps(nico_dict))
>>> print(srsly.yaml_dumps(list(nico_dict.keys())))

"""


import srsly
from importlib import resources


with resources.path("nvm.aux_spacy.data.NicolasEtAl2019a", "data.json") as if0:
    nico_dict = srsly.read_json(if0)
