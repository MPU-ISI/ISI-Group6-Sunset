#!/usr/bin/env python3

"""
Example use:
------------

>>> import srsly
>>> from nvm.aux_spacy.data.PietraszkiewiczEtAl2019a import big2_dict
>>> print(srsly.yaml_dumps(big2_dict))
>>> print(srsly.yaml_dumps(list(big2_dict.keys())))

"""

import srsly
from importlib import resources


with resources.path("nvm.aux_spacy.data.PietraszkiewiczEtAl2019a", "data.json") as if0:
    big2_dict = srsly.read_json(if0)

with resources.path(
    "nvm.aux_spacy.data.PietraszkiewiczEtAl2019a", "data_liwc.json"
) as if0:
    big2_liwc_dict = srsly.read_json(if0)
