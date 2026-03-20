"""Sandboxed code execution service for technical interview coding questions."""

import subprocess
import tempfile
import os
from pathlib import Path


ALLOWED_LANGUAGES = {
    "python": {
        "extension": ".py",
        "command": ["python", "-u"],
        "timeout": 10,
    },
}


def run_code(language: str, code: str, stdin_input: str = "") -> dict:
    """Execute code in a sandboxed subprocess and return the result.

    Args:
        language: Programming language (currently only "python").
        code: Source code to execute.
        stdin_input: Optional stdin input for the program.

    Returns:
        Dict with keys: stdout, stderr, exit_code, timed_out
    """
    lang_config = ALLOWED_LANGUAGES.get(language)
    if not lang_config:
        return {
            "stdout": "",
            "stderr": f"Unsupported language: {language}. Supported: {', '.join(ALLOWED_LANGUAGES.keys())}",
            "exit_code": 1,
            "timed_out": False,
        }

    # Write code to a temporary file
    with tempfile.NamedTemporaryFile(
        mode="w",
        suffix=lang_config["extension"],
        delete=False,
    ) as f:
        f.write(code)
        temp_path = f.name

    try:
        cmd = lang_config["command"] + [temp_path]
        env = {
            "PATH": os.environ.get("PATH", ""),
            "PYTHONDONTWRITEBYTECODE": "1",
        }

        proc = subprocess.run(
            cmd,
            input=stdin_input,
            capture_output=True,
            text=True,
            timeout=lang_config["timeout"],
            env=env,
            cwd=tempfile.gettempdir(),
        )

        return {
            "stdout": proc.stdout[:10000],
            "stderr": proc.stderr[:5000],
            "exit_code": proc.returncode,
            "timed_out": False,
        }
    except subprocess.TimeoutExpired:
        return {
            "stdout": "",
            "stderr": f"Execution timed out after {lang_config['timeout']} seconds.",
            "exit_code": -1,
            "timed_out": True,
        }
    finally:
        Path(temp_path).unlink(missing_ok=True)
