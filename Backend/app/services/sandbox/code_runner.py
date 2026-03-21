import subprocess
import tempfile
import os
from pathlib import Path

#Allows which language the sandbox environemnt can run
ALLOWED_LANGUAGES = {
    "python": {
        "extension": ".py",
        "command": ["python", "-u"],
        "timeout": 10,
    },
}


def run_code(language: str, code: str, stdin_input: str = "") -> dict:
    lang_config = ALLOWED_LANGUAGES.get(language)
    if not lang_config:
        return {
            "stdout": "",
            "stderr": f"Unsupported language: {language}. Supported: {', '.join(ALLOWED_LANGUAGES.keys())}",
            "exit_code": 1,
            "timed_out": False,
        }

    #Same thing as creating a main.py file and running it, except its temporary for the code environment to run in a sandbox.
    #Mode w means write, suffix is the file extension based on the language above, delete = delete file after runnign the code
    with tempfile.NamedTemporaryFile(
        mode="w",
        suffix=lang_config["extension"],
        delete=False,
    ) as f:
        f.write(code)
        temp_path = f.name

    try:
        #this basically says ["python", "-u", "/tmp/some_random_name.py"]
        cmd = lang_config["command"] + [temp_path] 

        #create env variables and tells python not to create boilerplate like pycache files
        env = {
            "PATH": os.environ.get("PATH", ""),
            "PYTHONDONTWRITEBYTECODE": "1",
        }

        proc = subprocess.run(
        cmd,                              #the command to execute
        input=stdin_input,                #text fed to the program's stdin (like typing into it)
        capture_output=True,              #capture stdout and stderr instead of printing to terminal
        text=True,                        #treat input/output as strings, not raw bytes
        timeout=lang_config["timeout"],   #kill the process after 10 seconds
        env=env,                          #the restricted environment from above
        cwd=tempfile.gettempdir(),        #run in the temp directory (e.g. /tmp)
    )
        #end program after 10000 chars of stdout or 5000 chars of stderr to prevent flooding the response with too much data
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
    #Cleanup the temp file after execution to prevent buildup of files on the server.
    finally:
        Path(temp_path).unlink(missing_ok=True)
