
"""Leakage-safe preprocessing helpers.

Build preprocessing inside an sklearn Pipeline/ColumnTransformer and fit it only
on each training fold. Do not define columns until the dataset audit is complete.
"""

def build_preprocessor(*args, **kwargs):
    raise NotImplementedError(
        "Define numeric/categorical columns from the verified feature manifest first."
    )
