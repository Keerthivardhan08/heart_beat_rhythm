
"""Dataset audit starter. Fill in after verifying the real dataset schema."""

from pathlib import Path
import pandas as pd


def load_csv(path: str | Path) -> pd.DataFrame:
    """Load a CSV for an authorized research dataset."""
    return pd.read_csv(path)


def summarize_dataframe(df: pd.DataFrame) -> dict:
    """Return basic data-quality statistics without exposing row contents."""
    return {
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "column_names": [str(c) for c in df.columns],
        "missing_by_column": {str(k): int(v) for k, v in df.isna().sum().items()},
        "duplicate_rows": int(df.duplicated().sum()),
    }


if __name__ == "__main__":
    raise SystemExit(
        "Import load_csv/summarize_dataframe from a notebook or add a CLI after "
        "confirming the dataset path and schema."
    )
