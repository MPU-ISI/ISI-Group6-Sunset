#!/usr/bin/env python3

import logging
from spacy.tokens import Doc
from spacy.language import Language

from ..set_container_extensions import set_container_extensions_from_dict


@Language.factory(
    "get_doc_sentences_as_list",
    default_config={
        "log0": logging.getLogger("dummy"),
    },
)
def get_doc_sentences_as_list_component(
    nlp: Language,
    name: str,
    log0: logging.Logger,
):
    """Get document sentences as a list.


    Examples
    --------
    >>> import spacy
    >>> from nvm.aux_spacy import get_doc_sentences_as_list_component
    >>> # nlp = spacy.blank("en")
    >>> nlp = spacy.load("en_core_web_sm")
    >>> nlp.add_pipe("get_doc_sentences_as_list", "SENTS")
    >>> doc = nlp("This is the first sentence. This is the second sentence.")
    >>> assert len(doc._.sents) == 2
    >>> doc._.sents
    ['This is the first sentence.', 'This is the second sentence.']

    """
    return DocSentsAsListComponent(
        nlp=nlp,
        log0=log0,
    )


class DocSentsAsListComponent:
    def __init__(
        self,
        nlp: Language,
        log0: logging.Logger = logging.getLogger("dummy"),
    ):
        # Language, at least nlp = spacy.load("en_core_web_sm")
        nlp.enable_pipe("senter")

        # Placeholder dictionary for new functions
        self.doc_fn_dict = dict()

        # Function
        def sents_as_list(doc):
            """Get sentences as list of strings."""
            sents = [sent.text for sent in doc.sents]
            return sents

        # Add function do dictionary
        self.doc_fn_dict["sents"] = sents_as_list

        # Update Doc extensions.
        set_container_extensions_from_dict(Doc, self.doc_fn_dict, log0=log0)

    def __call__(self, doc: Doc) -> Doc:
        return doc
