# utils/timing.py
import functools, time, inspect, logging
logger = logging.getLogger(__name__)

def _log_elapsed(qualname: str, elapsed_s: float):
    ms   = elapsed_s * 1000
    mins = int(elapsed_s // 60)
    secs = elapsed_s % 60
    if mins:
        human = f"{mins} min {secs:04.1f} s"
    else:
        human = f"{secs:04.1f} s"
    logger.info("⏱️  %s finished in %.0f ms  (%s)",
                qualname, ms, human)

def timed(fn):
    """Decorator: logs wall‑clock time for sync **or** async functions."""
    is_async = inspect.iscoroutinefunction(fn)

    if is_async:
        @functools.wraps(fn)
        async def _awrapper(*args, **kwargs):
            t0 = time.perf_counter()
            try:
                return await fn(*args, **kwargs)
            finally:
                _log_elapsed(fn.__qualname__, time.perf_counter() - t0)

        return _awrapper
    else:
        @functools.wraps(fn)
        def _swrapper(*args, **kwargs):
            t0 = time.perf_counter()
            try:
                return fn(*args, **kwargs)
            finally:
                _log_elapsed(fn.__qualname__, time.perf_counter() - t0)

        return _swrapper
