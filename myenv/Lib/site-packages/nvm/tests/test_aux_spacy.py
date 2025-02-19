#!/usr/bin/env python3

import pytest  # noqa: F401
from nvm import nvm  # noqa: F401

import spacy  # noqa: F401
from spacy.tokens import Doc, Span, Token  # noqa: F401

from nvm.aux_spacy import (  # noqa: F401
    set_container_extensions_from_dict,
    get_doc_sentences_as_list_component,
    get_doc_word_count_component,
    get_doc_basic_metrics_component,
)


if "en_core_web_sm" not in spacy.info()["pipelines"].keys():
    spacy.cli.download("en_core_web_sm")


class TestAuxSpacy:
    def test_update_object_extensions_from_dict_for_tok(self):
        tok_fn_dict = dict(
            is_good_color=lambda token: token.text in ("black", "blue", "orange"),
            is_good_fruit=lambda token: token.text in ("apple", "pear", "orange"),
        )
        set_container_extensions_from_dict(Token, tok_fn_dict)

        nlp = spacy.blank("en")
        doc = nlp("I have an orange orange and a pink apple in the black box")
        assert doc[3]._.is_good_fruit
        assert doc[3]._.is_good_color
        assert doc[4]._.is_good_fruit
        assert doc[4]._.is_good_color
        assert not doc[7]._.is_good_color
        assert doc[8]._.is_good_fruit
        assert doc[11]._.is_good_color
        assert not doc[12]._.is_good_fruit
        assert not doc[12]._.is_good_color

    def test_update_object_extensions_from_dict_for_doc(self):
        doc_fn_dict = dict(
            has_good_fruit=lambda doc: any(
                fruit in doc.text for fruit in ("apple", "pear", "orange")
            ),
            has_good_color=lambda doc: any(
                color in doc.text for color in ("black", "blue", "orange")
            ),
        )
        set_container_extensions_from_dict(Doc, fn_dict=doc_fn_dict)

        nlp = spacy.blank("en")
        doc = nlp("I have an orange orange and a pink apple in the black box")
        assert doc._.has_good_fruit
        assert doc._.has_good_color
        doc = nlp("No fruits and no colors")
        assert not doc._.has_good_fruit
        assert not doc._.has_good_color

    def test_update_object_extensions_from_dict_for_spn(self):
        spn_fn_dict = dict(
            has_good_fruit=lambda span: any(
                fruit in span.text for fruit in ("apple", "pear", "orange")
            ),
            has_good_color=lambda span: any(
                color in span.text for color in ("black", "blue", "orange")
            ),
        )
        set_container_extensions_from_dict(Span, fn_dict=spn_fn_dict)
        nlp = spacy.blank("en")
        doc = nlp("I have an orange orange and a pink apple in the black box")
        assert doc[0:4]._.has_good_fruit
        assert doc[0:4]._.has_good_color
        assert not doc[0:2]._.has_good_fruit
        assert not doc[0:2]._.has_good_color

    def test_get_doc_sentences_as_list_component(self):
        nlp = spacy.load("en_core_web_sm")
        nlp.add_pipe("get_doc_sentences_as_list", "SENTS")
        doc = nlp("This is the first sentence. This is the second sentence.")
        assert len(doc._.sents) == 2

    def test_get_doc_word_count_component(self):
        nlp = spacy.load("en_core_web_sm")
        nlp.add_pipe("get_doc_word_count", "WC")

        doc = nlp("One two three four five.")
        assert doc._.word_count == 5

        doc = nlp("")
        assert doc._.word_count == 0

        doc = nlp("! --- ...")
        assert doc._.word_count == 0

    def test_get_doc_basic_metrics_component_and_word_count(
        self,
    ):
        nlp = spacy.load("en_core_web_sm")
        nlp.add_pipe("get_doc_word_count", "WC")
        nlp.add_pipe("get_doc_basic_metrics", "BASICS")

        doc = nlp("One two thee four.")
        assert doc._.word_count == 4
        assert doc._.WORD_count == 4

        doc = nlp("")
        assert doc._.word_count == 0
        assert doc._.WORD_count == 0

        doc = nlp("! --- ...")
        assert doc._.word_count == 0
        assert doc._.WORD_count == 0

    def test_get_doc_basic_metrics_component_BASICS(self):
        nlp = spacy.load("en_core_web_sm")
        nlp.add_pipe("get_doc_basic_metrics", "BASIC")

        doc = nlp("I have something to do here! He pleaded.")
        # "I" is not a verb at all
        idx0 = 0
        token0 = doc[idx0]
        assert token0.text == "I"
        assert not token0._.is_VB
        assert not token0._.is_VB_without_be_and_have

        # "have" is actually a VBP (verb, present tense, not 3rd person singular)
        # TODO: produce a better text for test.
        # TODO: consider removing this special-case fnction alltogether if it is not necessary.
        # TODO: consult a linguist.
        idx0 = 1
        token0 = doc[idx0]
        assert token0.text == "have"
        assert not token0._.is_VB_without_be_and_have

        # "do" is VB
        idx0 = 4
        token0 = doc[idx0]
        assert token0.text == "do"
        assert token0._.is_VB_without_be_and_have

        # "pleaded" is VBD (verb, past tense)
        idx0 = 8
        token0 = doc[idx0]
        assert token0.text == "pleaded"
        assert not token0._.is_VB_without_be_and_have

    def test_get_doc_basic_metrics_component_NOUNS(self):
        nlp = spacy.load("en_core_web_sm")
        nlp.add_pipe("get_doc_basic_metrics", "BASICS")

        doc = nlp("This sentence has two nouns.")
        assert doc._.NOUN_count == 2

        doc = nlp("One two thee four.")
        assert doc._.NOUN_count == 0

    def test_get_doc_basic_metrics_component_VERBS(self):
        nlp = spacy.load("en_core_web_sm")
        nlp.add_pipe("get_doc_basic_metrics", "BASICS")

        # TODO: checkup
        doc = nlp(
            "This sentence contains two verbs and this is how many verbs should be found."
        )
        assert doc._.VERB_count == 2

        doc = nlp("One two thee four.")
        assert doc._.VERB_count == 0

    def test_get_doc_basic_metrics_component_VBS(self):
        nlp = spacy.load("en_core_web_sm")
        nlp.add_pipe("get_doc_basic_metrics", "BASICS")

        doc = nlp("I want to make a sentence and I want it to contain exactly two VBs.")
        assert doc._.VB_count_without_be_and_have == 2

        doc = nlp("One two thee four.")
        assert doc._.VB_count_without_be_and_have == 0
