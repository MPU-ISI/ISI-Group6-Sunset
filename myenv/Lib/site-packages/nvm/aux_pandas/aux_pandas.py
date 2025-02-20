#!/usr/bin/env python3

import numpy as np
import pandas as pd
from contextlib import ExitStack
from IPython.core.display import display

from sklearn.datasets import load_wine


wine_ds = load_wine()
wine_df = pd.DataFrame(
    data=np.c_[wine_ds["data"], wine_ds["target"]],
    columns=wine_ds["feature_names"] + ["target"],
)


def fix_column_names(df0, lowercase=False):
    df0.columns = df0.columns.str.strip()
    df0.columns = df0.columns.map(lambda x: x.replace(" ", "_"))
    df0.columns = df0.columns.map(lambda x: x.replace("-", "_"))
    df0.columns = df0.columns.map(lambda x: x.replace(".", "_"))
    if lowercase:
        df0.columns = df0.columns.map(str.lower)

    return df0


def _context_pandas(
    max_columns=222,
    max_colwidth=44,
    width=2222,
    max_rows=44,
    min_rows=33,
):
    """Apply custom context to dataframe representation (ExitStack)."""
    return [
        pd.option_context("display.max_columns", max_columns),
        pd.option_context("display.max_colwidth", max_colwidth),
        pd.option_context("display.width", width),
        pd.option_context("display.max_rows", max_rows),
        pd.option_context("display.min_rows", min_rows),
    ]


def disp_df(df0, **opt):
    """Display DF using custom formatting context.

    Examples
    --------
    >>> import numpy as np
    >>> import pandas as pd
    >>> from nvm import disp_df
    >>> from nvm.aux_pandas import wine_df
    >>> disp_df(df0)

    """
    with ExitStack() as stack:
        _ = [stack.enter_context(cont) for cont in _context_pandas(**opt)]
        display(df0)


def repr_df(df0, **opt):
    """Get DF repr using custom formatting context.

    Examples
    --------
    >>> import numpy as np
    >>> import pandas as pd
    >>> from nvm import disp_df
    >>> from nvm.aux_pandas import wine_df
    >>> print(repr_df(df0))

    """
    with ExitStack() as stack:
        _ = [stack.enter_context(cont) for cont in _context_pandas(**opt)]
        return str(df0)
