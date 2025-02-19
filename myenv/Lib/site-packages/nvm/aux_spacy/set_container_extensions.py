#!/usr/bin/env python3

import logging
from spacy.tokens import Doc, Span, Token
from typing import Callable, Optional, Dict, Union

# TODOs:
# from typing import Union
# from sklearn.utils import Bunch


def set_container_extensions_from_dict(
    container: Union[Doc, Span, Token],
    fn_dict: Dict[str, Callable],
    log0: Optional[logging.Logger] = logging.getLogger("dummy"),
):
    """Update Token extensions based on dictionary of functions.

    Parameters
    ----------
    container : Union[Doc, Span, Token]
        SpaCy container to set extensions to (``Doc``, ``Span`` or ``Token``).

    fn_dict : Dict[str, Callable]
        Dictionary of functions. Extensions will be named after keys in the
        dictionary.

    log0 : Optional[logging.Logger]
        Logger (optional)


    Examples
    --------
    For ``Token``

    >>> import spacy
    >>> from spacy.tokens import Token
    >>> from nvm.aux_spacy import set_container_extensions_from_dict
    >>>
    >>> tok_fn_dict = dict(
    >>>     is_good_color=lambda token: token.text in ("black", "blue", "orange"),
    >>>     is_good_fruit=lambda token: token.text in ("apple", "pear", "orange"),
    >>> )
    >>> set_container_extensions_from_dict(Token, fn_dict=tok_fn_dict)
    >>>
    >>> nlp = spacy.blank("en")
    >>> doc = nlp("I have an orange orange and a pink apple in the black box")
    >>> assert doc[3]._.is_good_fruit
    >>> assert doc[3]._.is_good_color
    >>> assert doc[4]._.is_good_fruit
    >>> assert doc[4]._.is_good_color
    >>> assert not doc[7]._.is_good_color
    >>> assert doc[8]._.is_good_fruit
    >>> assert doc[11]._.is_good_color
    >>> assert not doc[12]._.is_good_fruit
    >>> assert not doc[12]._.is_good_color

    For ``Doc``

    >>> import spacy
    >>> from spacy.tokens import Doc
    >>> from nvm.aux_spacy import set_container_extensions_from_dict
    >>>
    >>> doc_fn_dict = dict(
    >>>     has_good_fruit=lambda doc: any(
    >>>         fruit in doc.text for fruit in ("apple", "pear", "orange")
    >>>     ),
    >>>     has_good_color=lambda doc: any(
    >>>         color in doc.text for color in ("black", "blue", "orange")
    >>>     ),
    >>> )
    >>> set_container_extensions_from_dict(Doc, fn_dict=doc_fn_dict)
    >>>
    >>> nlp = spacy.blank("en")
    >>> doc = nlp("I have an orange orange and a pink apple in the black box")
    >>> assert doc._.has_good_fruit
    >>> assert doc._.has_good_color
    >>> doc = nlp("No fruits and no colors")
    >>> assert not doc._.has_good_fruit
    >>> assert not doc._.has_good_color

    For ``Span``

    >>> import spacy
    >>> from spacy.tokens import Span
    >>> from nvm.aux_spacy import set_container_extensions_from_dict
    >>>
    >>> spn_fn_dict = dict(
    >>>     has_good_fruit=lambda span: any(
    >>>         fruit in span.text for fruit in ("apple", "pear", "orange")
    >>>     ),
    >>>     has_good_color=lambda span: any(
    >>>         color in span.text for color in ("black", "blue", "orange")
    >>>     ),
    >>> )
    >>> set_container_extensions_from_dict(Span, fn_dict=spn_fn_dict)
    >>>
    >>> nlp = spacy.blank("en")
    >>> doc = nlp("I have an orange orange and a pink apple in the black box")
    >>> assert doc[0:4]._.has_good_fruit
    >>> assert doc[0:4]._.has_good_color
    >>> assert not doc[0:2]._.has_good_fruit
    >>> assert not doc[0:2]._.has_good_color

    """
    for key1, val1 in fn_dict.items():
        log0.debug(f"Adding {container!r} extension {key1!r}")
        if container.has_extension(key1):
            log0.warning(f"{container!r} extension {key1!r} was replaced.")
            container.remove_extension(key1)

        container.set_extension(key1, getter=val1)
