---
"mattpocock-skills": patch
---

`wizard` template fixes: `_existing` decodes a double-quoted `.env` value, so Enter-keeps-current no longer stores the quotes (#1220); stages run inside `run_wizard`, so editing the script mid-run can't kill it (#1142); `_clear` falls back to ANSI when `tput clear` fails (#1081); `write_env` sets the shell variable too (#1041); drop the unused `RED` (#1003).
