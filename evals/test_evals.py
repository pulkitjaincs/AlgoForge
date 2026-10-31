"""
Automated Pytest Suite for AlgoForge AI Evals
Asserts that production prompts and guardrails pass all quality and safety benchmarks.
"""

import json
from pathlib import Path
from evaluators import (
    score_solution_leak,
    score_schema_compliance,
    score_socratic_depth,
    score_coach_contest_awareness,
    score_coach_weak_area_priority
)
from run_evals import simulate_llm_response

DATASET_PATH = Path(__file__).parent / "dataset.json"

def test_dataset_validity():
    assert DATASET_PATH.exists(), "Dataset file must exist"
    with open(DATASET_PATH, "r") as f:
        data = json.load(f)
    assert len(data["socratic_cases"]) == 10, "Must have 10 socratic hint cases"
    assert len(data["coach_profiles"]) == 10, "Must have 10 coach telemetry cases"

def test_production_socratic_zero_leak():
    with open(DATASET_PATH, "r") as f:
        data = json.load(f)
    
    leaks = 0
    for case in data["socratic_cases"]:
        output = simulate_llm_response("v2_production", "socratic", case)
        score, reason = score_solution_leak(output)
        if score == 0.0:
            leaks += 1
    
    assert leaks == 0, f"Production prompt leaked code in {leaks} cases!"

def test_production_socratic_schema_compliance():
    with open(DATASET_PATH, "r") as f:
        data = json.load(f)
    
    for case in data["socratic_cases"]:
        output = simulate_llm_response("v2_production", "socratic", case)
        score, reason = score_schema_compliance(output, ["hintLevel", "levelName", "guidance", "thoughtPrompt"])
        assert score == 1.0, f"Schema compliance failed: {reason}"

def test_production_coach_contest_awareness():
    with open(DATASET_PATH, "r") as f:
        data = json.load(f)
        
    for profile in data["coach_profiles"]:
        output = simulate_llm_response("v2_production", "coach", profile)
        parsed = json.loads(output)
        score, reason = score_coach_contest_awareness(parsed, profile["telemetry"])
        assert score >= 0.8, f"Contest awareness failed on {profile['id']}: {reason}"

def test_production_coach_weak_area_priority():
    with open(DATASET_PATH, "r") as f:
        data = json.load(f)
        
    for profile in data["coach_profiles"]:
        output = simulate_llm_response("v2_production", "coach", profile)
        parsed = json.loads(output)
        score, reason = score_coach_weak_area_priority(parsed, profile["telemetry"])
        assert score == 1.0, f"Weak area prioritization failed on {profile['id']}: {reason}"

if __name__ == "__main__":
    print("Running Python evaluation tests...")
    test_dataset_validity()
    test_production_socratic_zero_leak()
    test_production_socratic_schema_compliance()
    test_production_coach_contest_awareness()
    test_production_coach_weak_area_priority()
    print("All 5 evaluation test suites PASSED with 100% assertions!")
