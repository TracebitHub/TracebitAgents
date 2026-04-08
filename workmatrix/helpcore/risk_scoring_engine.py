import math
from typing import Dict

def calculate_risk_score(price_change_pct: float, liquidity_usd: float, flags_mask: int) -> float:
    """
    Compute a 0–100 risk score.
    - price_change_pct: percent change over period (e.g. +5.0 for +5%).
    - liquidity_usd: total liquidity in USD.
    - flags_mask: integer bitmask of risk flags; each set bit adds a penalty.
    """
    # volatility component (max 50)
    vol_score = min(abs(price_change_pct) / 10, 1) * 50

    # liquidity component: more liquidity = lower risk, up to 30
    if liquidity_usd > 0:
        liq_score = max(0.0, 30 - (math.log10(liquidity_usd) * 5))
    else:
        liq_score = 30.0

    # flag penalty: 5 points per bit set
    flag_count = bin(flags_mask).count("1")
    flag_score = flag_count * 5

    raw_score = vol_score + liq_score + flag_score
    return min(round(raw_score, 2), 100.0)

def detailed_risk_report(price_change_pct: float, liquidity_usd: float, flags_mask: int) -> Dict[str, float]:
    """
    Generate a detailed breakdown of the risk score components.
    """
    vol_score = min(abs(price_change_pct) / 10, 1) * 50
    liq_score = max(0.0, 30 - (math.log10(liquidity_usd) * 5)) if liquidity_usd > 0 else 30.0
    flag_count = bin(flags_mask).count("1")
    flag_score = flag_count * 5

    final_score = min(round(vol_score + liq_score + flag_score, 2), 100.0)

    return {
        "volatility_score": round(vol_score, 2),
        "liquidity_score": round(liq_score, 2),
        "flag_penalty": round(flag_score, 2),
        "final_score": final_score,
    }

def classify_risk_level(score: float) -> str:
    """
    Classify risk level based on score.
    """
    if score < 30:
        return "Low"
    elif score < 60:
        return "Medium"
    elif score < 85:
        return "High"
    return "Critical"
