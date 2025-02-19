#!/usr/bin/env python3

import re
import logging
from spacy.language import Language
from spacy.tokens import Doc, Token
from spacy.glossary import GLOSSARY
from typing import (
    List,
    Optional,
    Dict,
)

from ..set_container_extensions import set_container_extensions_from_dict


@Language.factory(
    "get_doc_count_of_dict_items",
    default_config={
        "prefix": None,
        "suffix": None,
        "exclude": None,
        "pos": None,
        "tag": None,
        "log0": logging.getLogger("dummy"),
    },
)
def get_doc_count_of_dict_items_component(
    nlp: Language,
    name: str,
    dict0: Dict,
    prefix: Optional[str],
    suffix: Optional[str],
    exclude: Optional[List[str]],
    pos: Optional[List[str]],
    tag: Optional[List[str]],
    log0: logging.Logger,
):
    return CountDictItemsComponent(
        nlp=nlp,
        dict0=dict0,
        name=name,  # WARNING: name for variable/column (not for pipeline element)!
        prefix=prefix,
        suffix=suffix,
        exclude=exclude,
        pos=pos,
        tag=tag,
        log0=log0,
    )


class CountDictItemsComponent:
    """Get counts of items from arbitrary LIWC-like dictionary.

    Examples
    --------
    >>> from nvm import disp_df
    >>> from nvm import Log0
    >>> logZ = Log0()
    >>> log0 = logZ.logger
    >>>
    >>> import textwrap
    >>> import srsly
    >>> import spacy
    >>> from spacy.tokens.underscore import Underscore
    >>>
    >>> from dframcy import DframCy
    >>>
    >>> from nvm import jsonable
    >>> from nvm.aux_spacy import get_doc_count_of_dict_items_component
    >>> from nvm.aux_spacy import get_doc_summary_dict_component
    >>>
    >>> dict0 = {"pos": ["good", "marvel*"], "neg": ["bad", "awful*"]}
    >>>
    >>> config0 = dict(
    >>>     dict0=dict0,
    >>> )
    >>> config1 = dict(
    >>>     dict0=dict0,
    >>>     pos = ["PROPN"],
    >>> )
    >>> nlp = spacy.load("en_core_web_sm")
    >>>
    >>> nlp.add_pipe("get_doc_count_of_dict_items", "LEX0", config=config0)
    >>> nlp.add_pipe("get_doc_count_of_dict_items", "LEX1", config=config1)
    >>> nlp.add_pipe("get_doc_summary_dict", "SUMMARY")
    >>>
    >>> dframcy = DframCy(nlp)
    >>>
    >>> doc = dframcy.nlp(
    >>>     "GoOd. Bad Good WhatEver Awful Marvelous."
    >>>     "toobad not-marvelous unmarvel goodyear badZ bAD."
    >>>     "Bad Bad WhatEver Awful Marvelous."
    >>> )
    >>>
    >>> tok_exts = list(Underscore.token_extensions.keys())
    >>> doc_exts = list(Underscore.doc_extensions.keys())
    >>>
    >>> df0 = dframcy.to_dataframe(
    >>>     doc,
    >>>     columns=["text", "lemma_", "pos_", "tag_"],
    >>>     custom_attributes=tok_exts[:12],
    >>> )
    >>> disp_df(df0)
    >>>
    >>> print(nlp.pipe_names)
    >>> print(tok_exts)
    >>> print(doc_exts)
    >>>
    >>> print(textwrap.indent(srsly.yaml_dumps(jsonable(dict(doc._.SUMMARY))), '   '))

    """

    def __init__(
        self,
        nlp: Language,
        dict0: Dict,
        name: str,
        prefix: str = None,
        suffix: str = None,
        exclude: Optional[List[str]] = None,
        pos: Optional[List[str]] = None,
        tag: Optional[List[str]] = None,
        log0: logging.Logger = logging.getLogger("dummy"),
    ):
        prefix = "" if prefix is None else prefix
        suffix = "" if suffix is None else suffix
        exclude = [] if exclude is None else exclude
        pos = [] if pos is None else pos
        tag = [] if tag is None else tag

        assert all(
            item in GLOSSARY.keys() for item in pos
        ), "Problem: Got 'pos' item that is not part of the SpaCy GLOSSARY."
        assert all(
            item in GLOSSARY.keys() for item in tag
        ), "Problem: Got 'tag' item that is not part of the SpaCy GLOSSARY."

        def key_str(key0):
            return "_".join(list(filter(None, [prefix, key0, "from", name, suffix])))

        # Dictionary of token regexps
        tok_re_dict = dict()
        for key0, val0 in dict0.items():
            tok_re_dict[key0] = re.compile(
                r"|".join(
                    [
                        "^{}$".format(re.escape(item0).replace("\\*", "[a-z]*"))
                        for item0 in val0
                    ]
                ),
                re.IGNORECASE,
            )
        """
        # same as the above but using dictionary comprehension
        tok_re_dict = {
            key0: re.compile(
                r"|".join(
                    [
                        "^{}$".format(re.escape(item0).replace("\\*", "[a-z]*"))
                        for item0 in val0
                    ]
                ),
                re.IGNORECASE,
            )
            for key0, val0 in dict0.items()
        }
        """
        log0.debug(tok_re_dict)

        # WARNING: the `key=key' and `val=val' statements below are used to alleviate
        # problems that result from argument mutability (DO NOT REMOVE).
        # Produce a dictionary of token functions
        tok_fn_dict = dict()
        for key_tok_re, val_tok_re in tok_re_dict.items():
            key_doc_fn = f"is_{key_str(key_tok_re)}"
            tok_fn_dict[key_doc_fn] = lambda token, val_tok_re=val_tok_re: bool(
                (
                    bool(val_tok_re.search(token.text))
                    | bool(val_tok_re.search(token.lemma_))
                )
                & ((not exclude) | (token.lemma_ not in exclude))
                & ((not pos) | (token.pos_ in pos))
                & ((not tag) | (token.tag_ in tag))
                & True
            )
        """
        # similar to the above but using dictionary comprehension
        # NOTE: this does not contain exclude, pos and tag checks
        tok_fn_dict = {
            f"token_is_{'_'.join(list(filter(None, [prefix, key_tok_re, name, suffix])))}": (
                lambda token, val_tok_re=val_tok_re: bool(val_tok_re.search(token.text))
            )
            for key_tok_re, val_tok_re in tok_re_dict.items()
        }
        """
        log0.debug(tok_fn_dict)

        # Produce a dictionary of doc functions
        doc_fn_dict = dict()
        for key_tok_fn in tok_fn_dict.keys():
            key_doc_fn = f"count_of_{key_tok_fn}"
            doc_fn_dict[key_doc_fn] = lambda doc, key_tok_fn=key_tok_fn: sum(
                [getattr(tk._, key_tok_fn) for tk in doc]
            )
        """
        # same as the above but using dictionary comprehension
        doc_fn_dict = {
            f"doc_get_count_of_{'_'.join(list(filter(None, [prefix, key0])))}": (
                lambda doc, key0=key0: sum(
                    [
                        getattr(
                            tk._,
                            f"token_is_{'_'.join(list(filter(None, [prefix, key0, name, suffix])))}",
                        )
                        for tk in doc
                    ]
                )
            )
            for key0 in tok_re_dict.keys()
        }
        """
        log0.debug(tok_fn_dict)

        # Update Token extensions
        set_container_extensions_from_dict(Token, fn_dict=tok_fn_dict)
        """
        for key_tok_fn, val_tok_fn in tok_fn_dict.items():
            log0.debug(f"Adding token extension {key_tok_fn!r}")
            if Token.has_extension(key_tok_fn):
                log0.warning(f"Token extension {key_tok_fn!r} was replaced.")
                Token.remove_extension(key_tok_fn)

            Token.set_extension(key_tok_fn, getter=val_tok_fn)
        """

        # Update Doc extensions
        set_container_extensions_from_dict(Doc, fn_dict=doc_fn_dict)
        """
        for key_doc_fn, val_doc_fn in doc_fn_dict.items():
            log0.debug(f"Adding doc extension {key_doc_fn!r}")
            if Doc.has_extension(key_doc_fn):
                log0.warning(f"Doc extension {key_doc_fn!r} was replaced.")
                Doc.remove_extension(key_doc_fn)

            Doc.set_extension(key_doc_fn, getter=val_doc_fn)
        """

    def __call__(self, doc: Doc) -> Doc:
        return doc
