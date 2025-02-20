#!/usr/bin/env python3

"""This module provides auxiliary stuff for spaCy.

"""


from .set_container_extensions import set_container_extensions_from_dict

from .factories.get_doc_word_count import get_doc_word_count_component
from .factories.get_doc_basic_metrics import get_doc_basic_metrics_component
from .factories.get_doc_count_of_dict_items import get_doc_count_of_dict_items_component
from .factories.get_doc_sentences import get_doc_sentences_as_list_component

from .factories.get_doc_summary_dict import get_doc_summary_dict_component
