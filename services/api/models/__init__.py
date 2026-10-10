"""Auto-import every model module (CONTRACT.md section 3).

FROZEN after step B0: a new model file (e.g. models/exams.py) registers itself
simply by existing in this package. One broken file is logged and skipped so it
never blocks startup or the other models.
"""
import importlib
import logging
import pkgutil

log = logging.getLogger("movelingo.models")

for _info in pkgutil.iter_modules(__path__):
    if _info.name == "__init__":
        continue
    try:
        importlib.import_module(f"{__name__}.{_info.name}")
    except Exception:  # noqa: BLE001 - one broken model must not block the rest
        log.exception("models: FAILED to import %s - skipping", _info.name)
