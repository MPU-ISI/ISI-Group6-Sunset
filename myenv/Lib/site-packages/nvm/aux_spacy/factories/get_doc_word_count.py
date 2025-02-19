#!/usr/bin/env python3


import logging
from spacy.language import Language
from spacy.attrs import IS_ALPHA
from spacy.tokens import Doc


@Language.factory(
    "get_doc_word_count",
    default_config={
        "log0": logging.getLogger("dummy"),
    },
)
def get_doc_word_count_component(
    nlp: Language,
    name: str,
    log0: logging.Logger,
):
    """Get Doc word count.

    Examples
    --------
    >>> import spacy
    >>> from nvm.aux_spacy import get_doc_word_count_component
    >>> nlp = spacy.load("en_core_web_sm")
    >>> nlp.add_pipe("get_doc_word_count", "WC")
    >>> doc = nlp("One two three four five.")
    >>> assert doc._.word_count == 5
    >>> doc._.word_count

    """

    return DocWordCountComponent(
        nlp=nlp,
        log0=log0,
    )


class DocWordCountComponent:
    def __init__(
        self,
        nlp: Language,
        log0: logging.Logger = logging.getLogger("dummy"),
    ):
        extension = "word_count"
        log0.debug(f"Adding doc extension {extension}")
        if Doc.has_extension(extension):
            log0.warning(f"Doc extension {extension} was replaced.")
            Doc.remove_extension(extension)

        Doc.set_extension(extension, default=None, force=True)

    def __call__(self, doc: Doc) -> Doc:
        alpha_tokens_count = doc.count_by(IS_ALPHA)
        # INFO: alpha_tokens_count is a dict with two keys (0 and 1) for False and True
        doc._.word_count = (
            alpha_tokens_count[1] if (1 in alpha_tokens_count.keys()) else 0
        )
        return doc
