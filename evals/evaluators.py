"""
Evaluation Metrics & Scoring Functions for AlgoForge AI Engine
"""

import json
import re
from typing import Dict, Any, Tuple

# Patterns identifying leaked code solutions
CODE_LEAK_PATTERNS = [
    r"def\s+[a-zA-Z0-9_]+\s*\(",
    r"class\s+Solution",
    r"return\s+\[seen\[",
    r"dp\[i\]\s*=\s*",
    r"for\s+_\s+in\s+range\(len\(queue\)\):",
    r"indegree\s*=\s*\[0\]",
    r"```(?:python|java|cpp|javascript|ts)[\s\S]*?(?:return|class|def|function)[\s\S]*?```",
]

def score_solution_leak(output_text: str) -> Tuple[float, str]:
    """
    Returns (1.0, "PASS") if NO solution code leaked.
    Returns (0.0, "FAIL") if full runnable code or key implementation snippet leaked.
    """
    for pattern in CODE_LEAK_PATTERNS:
        match = re.search(pattern, output_text, re.IGNORECASE)
        if match:
            return 0.0, f"Leaked pattern detected: '{match.group(0)}'"
    return 1.0, "Clean (Zero code leakage)"

def score_schema_compliance(output_text: str, required_keys: list) -> Tuple[float, str]:
    """
    Checks if output is valid JSON and contains all required schema keys.
    """
    try:
        data = json.loads(output_text)
        missing = [k for k in required_keys if k not in data]
        if missing:
            return 0.5, f"Missing required keys: {missing}"
        return 1.0, "Valid JSON Schema"
    except Exception as e:
        return 0.0, f"JSON Parse Error: {str(e)}"

def score_socratic_depth(parsed_json: Dict[str, Any], requested_level: int) -> Tuple[float, str]:
    """
    Checks if the hint provides the expected depth for the level.
    """
    if requested_level == 1:
        # Conceptual level must have guidance and thought prompt
        if parsed_json.get("guidance") and parsed_json.get("thoughtPrompt"):
            return 1.0, "Good Conceptual Depth"
        return 0.5, "Incomplete Conceptual Guidance"
    
    if requested_level == 2:
        # Complexity level should state complexity or edge cases
        has_complexity = bool(parsed_json.get("complexityTarget"))
        has_edge_cases = "edge" in parsed_json.get("guidance", "").lower() or "boundary" in parsed_json.get("guidance", "").lower() or bool(parsed_json.get("complexityTarget"))
        if has_complexity or has_edge_cases:
            return 1.0, "Good Complexity & Edge Case Guidance"
        return 0.5, "Lacks explicit Big-O / edge case specifics"
    
    if requested_level == 3:
        # Level 3 must include a counter example or breaking input
        if parsed_json.get("counterExample"):
            return 1.0, "Counter-example provided"
        return 0.0, "Missing counter-example"

    return 0.5, "Unknown level"

def score_coach_contest_awareness(parsed_json: Dict[str, Any], telemetry: Dict[str, Any]) -> Tuple[float, str]:
    """
    Verifies that if a contest is within 48h, the coach recognizes it and calibrates load.
    """
    urgent_contest = telemetry.get("urgent_contest")
    if not urgent_contest:
        return 1.0, "No urgent contest in telemetry (N/A)"
    
    contest_alert = parsed_json.get("contestAlert")
    if not contest_alert:
        return 0.0, "Failed to flag urgent contest"
    
    # Check if target minutes are <= 60 when contest is imminent (< 24h)
    hours = urgent_contest.get("hours_until", 99)
    target_min = parsed_json.get("targetMinutes", 120)
    if hours <= 14 and target_min > 60:
        return 0.5, f"Flagged contest but assigned excessive load ({target_min}m before {hours}h contest)"
    
    return 1.0, "Contest properly detected and schedule calibrated"

def score_coach_weak_area_priority(parsed_json: Dict[str, Any], telemetry: Dict[str, Any]) -> Tuple[float, str]:
    """
    Verifies that the coach prioritized the user's lowest mastery topic.
    """
    weak_areas = telemetry.get("weak_areas", [])
    if not weak_areas:
        return 1.0, "No weak areas (N/A)"
    
    lowest_topic = weak_areas[0].get("topic", "")
    recommendations = parsed_json.get("recommendations", [])
    rec_text = " ".join([r.get("title", "") + " " + r.get("reason", "") for r in recommendations])
    analysis_text = parsed_json.get("headline", "") + " " + parsed_json.get("analysis", "")
    
    if lowest_topic.lower() in (rec_text + " " + analysis_text).lower():
        return 1.0, f"Correctly prioritized lowest topic: {lowest_topic}"
    
    return 0.0, f"Missed lowest topic: {lowest_topic}"
