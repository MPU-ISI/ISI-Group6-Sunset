#!/usr/bin/env python3

"""
Example use:
------------

**WARNING:** Due to the licensing issues the raw data for LIWC categories
cannot be distributed with NVM package (unfortunately, you have to get
the data yourself).

>>> import srsly
>>> from nvm.aux_spacy.data.PennebakerEtAl2015a import liwc_dict
>>> print(srsly.yaml_dumps(liwc_dict))
>>> print(srsly.yaml_dumps(list(liwc_dict.keys())))

"""

import srsly
from importlib import resources


try:
    with resources.path(
        "nvm.aux_spacy.data.PennebakerEtAl2015a", "liwc2015a.json"
    ) as if0:
        liwc_dict = srsly.read_json(if0)
except FileNotFoundError as e:
    print(str(e))
    print(
        " ".join(
            [
                "Due to licensing issues, we cannot distribute LIWC raw data with the NVM package.",
                "Unfortunately, you need to get the raw data for LIWC categories at your own.",
            ]
        )
    )
    liwc_dict = None
