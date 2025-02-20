#!/usr/bin/env python3

import logging
from spacy.language import Language
from spacy.attrs import IS_ALPHA
from spacy.tokens import Doc, Token

from ..set_container_extensions import set_container_extensions_from_dict


@Language.factory(
    "get_doc_basic_metrics",
    default_config={
        "log0": logging.getLogger("dummy"),
    },
)
def get_doc_basic_metrics_component(
    nlp: Language,
    name: str,
    log0: logging.Logger,
):
    """Get Doc basic metrics.

    Examples
    --------
    >>> import spacy
    >>> from dframcy import DframCy
    >>>
    >>> from nvm import disp_df
    >>> from nvm.aux_spacy import get_doc_basic_metrics_component
    >>>
    >>> nlp = spacy.load("en_core_web_sm")
    >>> nlp.add_pipe("get_doc_basic_metrics", "BASIC")
    >>>
    >>> dframcy = DframCy(nlp)
    >>>
    >>> doc = dframcy.nlp(
    >>>     "This sentence contains two verbs and this is how many verbs should be found."
    >>> )
    >>>
    >>> df0 = dframcy.to_dataframe(
    >>>     doc,
    >>>     columns=["text", "lemma_", "is_alpha", "pos_", "tag_", "is_sent_start"],
    >>>     custom_attributes=tok_exts[:12],
    >>> )
    >>> disp_df(df0)

    """
    return DocBasicMetricsComponent(
        nlp=nlp,
        log0=log0,
    )


class DocBasicMetricsComponent:
    """DocBasicMetricsComponent.

    Methods
    -------
    __call__:
        some description

    """

    def __init__(
        self,
        nlp: Language,
        log0: logging.Logger = logging.getLogger("dummy"),
    ):
        """DocBasicMetricsComponent."""
        # Placeholder dictionaries for new functions
        self.tok_fn_dict = dict()
        self.doc_fn_dict = dict()

        # Verb in base form (VB)
        self.tok_fn_dict["is_VB"] = lambda token: (token.tag_ == "VB") & (
            token.is_alpha
        )

        self.tok_fn_dict["is_VB_without_be_and_have"] = (
            lambda token: (token.tag_ == "VB")
            & (token.is_alpha)
            & (token.lemma_ not in ["be", "have"])
        )

        def WORD_count(doc):
            """Get word count for doc (based on IS_ALPHA attribute)."""
            alpha_tokens_count = doc.count_by(IS_ALPHA)
            word_count = (
                alpha_tokens_count[1] if (1 in alpha_tokens_count.keys()) else 0
            )
            return word_count

        self.doc_fn_dict["WORD_count"] = WORD_count

        def NOUN_count(doc):
            """Get noun count for Doc (based on POS attribute)."""
            # _counts = doc.count_by(POS)  # OPEN: efficiency
            # _noun_key = doc.vocab.strings["NOUN"]
            _counts = len([tk for tk in doc if (tk.pos_ == "NOUN") & (tk.is_alpha)])
            # return _counts[_noun_key] if _noun_key in _counts.keys() else 0
            return _counts

        self.doc_fn_dict["NOUN_count"] = NOUN_count

        def ADJ_count(doc):
            """Get adjective count for Doc (based on POS attribute)."""
            # _counts = doc.count_by(POS)  # OPEN: efficiency
            # _adjective_key = doc.vocab.strings["ADJ"]
            _counts = len([tk for tk in doc if (tk.pos_ == "ADJ") & (tk.is_alpha)])
            # return _counts[_adjective_key] if _adjective_key in _counts.keys() else 0
            return _counts

        self.doc_fn_dict["ADJ_count"] = ADJ_count

        def VERB_count(doc):
            """Get verb count for Doc (based on POS attribute)."""
            # _counts = doc.count_by(POS)
            # _verb_key = doc.vocab.strings["VERB"]
            _counts = len([tk for tk in doc if (tk.pos_ == "VERB") & (tk.is_alpha)])
            # return _counts[_verb_key] if _verb_key in _counts.keys() else 0
            return _counts

        self.doc_fn_dict["VERB_count"] = VERB_count

        def VERB_count_without_be_and_have(doc):
            """Get verb count for doc (based on POS attribute) but exclude
            "be" and "have".

            """
            _counts = len(
                [
                    tk
                    for tk in doc
                    if (tk.pos_ == "VERB")
                    & (tk.is_alpha)
                    & (tk.lemma_ not in ["be", "have"])
                ]
            )
            return _counts

        self.doc_fn_dict[
            "VERB_count_without_be_and_have"
        ] = VERB_count_without_be_and_have

        def VB_count(doc):
            """Get VB count for spacy.Doc (using TAG attribute)."""
            _counts = len([tk for tk in doc if (tk.tag_ == "VB") & (tk.is_alpha)])
            return _counts

        self.doc_fn_dict["VB_count"] = VB_count

        def VB_count_without_be_and_have(doc):
            """Get VB count for spacy.Doc (using TAG attribute) but exclude
            "be" and "have".
            """
            _counts = len(
                [
                    tk
                    for tk in doc
                    if (tk.tag_ == "VB")
                    & (tk.is_alpha)
                    & (tk.lemma_ not in ["be", "have"])
                ]
            )
            return _counts

        self.doc_fn_dict["VB_count_without_be_and_have"] = VB_count_without_be_and_have

        def JJ_count(doc):
            """Get JJ count for spacy.Doc (using TAG attribute)."""
            _counts = len([tk for tk in doc if (tk.tag_ == "JJ") & (tk.is_alpha)])
            return _counts

        self.doc_fn_dict["JJ_count"] = JJ_count

        def JJRs_count(doc):
            """Get JJR count for spacy.Doc (using TAG attribute)."""
            _counts = len([tk for tk in doc if (tk.tag_ == "JJR") & (tk.is_alpha)])
            return _counts

        self.doc_fn_dict["JJRs_count"] = JJRs_count

        def JJSs_count(doc):
            """Get JJS count for spacy.Doc (using TAG attribute)."""
            _counts = len([tk for tk in doc if (tk.tag_ == "JJS") & (tk.is_alpha)])
            return _counts

        self.doc_fn_dict["JJSs_count"] = JJSs_count

        # Update Token and Doc extensions.
        set_container_extensions_from_dict(Token, self.tok_fn_dict, log0=log0)
        set_container_extensions_from_dict(Doc, self.doc_fn_dict, log0=log0)

    def __call__(self, doc: Doc) -> Doc:
        """DocBasicMetricsComponent."""
        return doc
