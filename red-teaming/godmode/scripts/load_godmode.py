"""
Loader for G0DM0D3 scripts. Handles the exec-scoping issues.

Usage in execute_code:
    exec(open(os.path.expanduser(
        "~/.hermes/skills/red-teaming/godmode/scripts/load_godmode.py"
    )).read())
    
    # Now all functions are available:
    # - auto_jailbreak(), undo_jailbreak()
    # - race_models(), race_godmode_classic()
    # - generate_variants(), obfuscate_query(), detect_triggers()
    # - score_response(), is_refusal(), count_hedges()
    # - escalate_encoding()
"""

import os, sys
from pathlib import Path

_gm_scripts_dir = Path(os.getenv("HERMES_HOME", Path.home() / ".hermes")) / "skills" / "red-teaming" / "godmode" / "scripts"

_gm_old_argv = sys.argv
sys.argv = ["_godmode_loader"]

def _gm_load(path):
    ns = dict(globals())
    ns["__name__"] = "_godmode_module"
    ns["__file__"] = str(path)
    exec(compile(open(path).read(), str(path), 'exec'), ns)
    return ns

for _gm_script in ["parseltongue.py", "godmode_race.py", "auto_jailbreak.py"]:
    _gm_path = _gm_scripts_dir / _gm_script
    if _gm_path.exists():
        _gm_ns = _gm_load(_gm_path)
        for _gm_k, _gm_v in _gm_ns.items():
            if not _gm_k.startswith('_gm_') and (callable(_gm_v) or _gm_k.isupper()):
                globals()[_gm_k] = _gm_v

sys.argv = _gm_old_argv

# Cleanup loader vars
for _gm_cleanup in ['_gm_scripts_dir', '_gm_old_argv', '_gm_load', '_gm_ns', '_gm_k',
                     '_gm_v', '_gm_script', '_gm_path', '_gm_cleanup']:
    globals().pop(_gm_cleanup, None)
