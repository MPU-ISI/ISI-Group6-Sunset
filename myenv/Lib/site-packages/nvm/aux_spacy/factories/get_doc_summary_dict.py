#!/usr/bin/env python3

import logging
from spacy.language import Language
from spacy.tokens import Doc
from spacy.tokens.underscore import Underscore
from typing import (
    List,
    Optional,
)


@Language.factory(
    "get_doc_summary_dict",
    default_config={
        "exclude": ["concr_spans"],  # TODO check mutability
        "add_text": False,
        "log0": logging.getLogger("dummy"),
    },
)
def get_doc_summary_dict_component(
    nlp: Language,
    name: str,
    exclude: Optional[List[str]],
    add_text: bool,
    log0: logging.Logger,
):
    """Get underscore attributes as dictionary.


    .. important::
        **CAUTION:** Add this to ``nlp.pipe`` **after** elements that need to be in the summary dictionary.


    Examples
    --------
    >>> import textwrap
    >>> import srsly
    >>> import spacy
    >>> from nvm import jsonable
    >>> from nvm.aux_spacy import get_doc_summary_dict_component
    >>> from nvm.aux_spacy import get_doc_basic_metrics_component
    >>>
    >>> nlp = spacy.load("en_core_web_sm")
    >>> nlp.add_pipe("get_doc_basic_metrics", "BASIC")
    >>> nlp.add_pipe("get_doc_summary_dict", "SUMMARY", last=True)  # Add AFTER other elements
    >>>
    >>> doc = nlp("This is the first sentence. This is the second sentence.")
    >>>
    >>> print(textwrap.indent(srsly.yaml_dumps(jsonable(dict(doc._.SUMMARY))), '   '))

    """
    return DocSummaryDictComponent(
        nlp=nlp,
        exclude=exclude,
        add_text=add_text,
        log0=log0,
    )


class DocSummaryDictComponent:
    def __init__(
        self,
        nlp: Language,
        exclude: Optional[List[str]] = None,
        add_text: bool = False,
        log0: logging.Logger = logging.getLogger("dummy"),
    ):
        self.exclude = [] if exclude is None else exclude
        self.add_text = add_text
        extension = "SUMMARY"
        log0.debug(f"Adding doc extension {extension}")
        if Doc.has_extension(extension):
            log0.warning(f"Doc extension {extension} was replaced.")
            Doc.remove_extension(extension)

        Doc.set_extension(extension, default=None, force=True)

    def __call__(self, doc: Doc) -> Doc:
        doc._.SUMMARY = dict()

        if self.add_text:
            doc._.SUMMARY["text"] = doc.text

        for ext0 in list(Underscore.doc_extensions):
            if ext0 not in (["SUMMARY"] + self.exclude):
                doc._.SUMMARY[ext0] = getattr(doc._, ext0)

        return doc
