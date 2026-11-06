from pathlib import Path
import hashlib,sys
p=Path("src/ecology/OrbiterSystem.js")
if not p.is_file(): sys.exit("ERROR: run from repository root; OrbiterSystem.js missing")
current=p.read_bytes()
expected="c925854d4c5127788420967b27523ca9c6cd56cef93e6b30c51ef9884eeae5dd"
if hashlib.sha256(current).hexdigest()!=expected:
    sys.exit("ERROR: source differs from reviewed src.zip. No changes made; supply current source for rebase.")
replacement=Path(__file__).with_name("OrbiterSystem.js").read_bytes()
backup=p.with_suffix(".js.GSL4E2F.bak")
if backup.exists(): sys.exit("ERROR: backup already exists; no changes made")
backup.write_bytes(current)
p.write_bytes(replacement)
print("GSL-4E2F installed; original backed up to", backup)
