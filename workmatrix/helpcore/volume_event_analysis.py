from typing import List, Dict, Any

def detect_volume_bursts(
    volumes: List[float],
    threshold_ratio: float = 1.5,
    min_interval: int = 1
) -> List[Dict[str, Any]]:
    """
    Identify indices where volume jumps by threshold_ratio over previous value.
    Returns list of dicts: {index, previous, current, ratio, delta}.
    """
    events: List[Dict[str, Any]] = []
    last_idx = -min_interval

    for i in range(1, len(volumes)):
        prev, curr = volumes[i - 1], volumes[i]
        ratio = (curr / prev) if prev > 0 else float("inf")
        delta = curr - prev

        if ratio >= threshold_ratio and (i - last_idx) >= min_interval:
            events.append({
                "index": float(i),
                "previous": prev,
                "current": curr,
                "ratio": round(ratio, 4),
                "delta": delta
            })
            last_idx = i

    return events

def summarize_burst_events(events: List[Dict[str, Any]]) -> Dict[str, float]:
    """
    Provide a summary of detected burst events.
    Returns {count, avg_ratio, max_ratio, avg_delta, max_delta}.
    """
    if not events:
        return {
            "count": 0,
            "avg_ratio": 0.0,
            "max_ratio": 0.0,
            "avg_delta": 0.0,
            "max_delta": 0.0
        }

    count = len(events)
    avg_ratio = sum(e["ratio"] for e in events) / count
    max_ratio = max(e["ratio"] for e in events)
    avg_delta = sum(e["delta"] for e in events) / count
    max_delta = max(e["delta"] for e in events)

    return {
        "count": count,
        "avg_ratio": round(avg_ratio, 4),
        "max_ratio": round(max_ratio, 4),
        "avg_delta": round(avg_delta, 4),
        "max_delta": round(max_delta, 4)
    }
