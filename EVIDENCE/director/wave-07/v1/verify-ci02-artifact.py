from pathlib import Path
from zipfile import ZipFile
import hashlib
import json

root = Path(__file__).parent
def sha(data):
    return hashlib.sha256(data).hexdigest()

report = json.loads((root / "CI02-hosted-run.json").read_bytes())
bundle = root / "CI02-hosted-artifact.zip"
assert sha(bundle.read_bytes()) == report["artifact"]["sha256"]
with ZipFile(bundle) as archive:
    summary = json.loads(archive.read("summary.json"))
    names = set(archive.namelist())
    assert names == {"summary.json", *(case["log"] for case in summary["cases"])}
    assert summary["source"] == report["candidate"] == report["sourceCheckoutSha"]
    assert report["hosted"]["conclusion"] == "success" and summary["verdict"] == "PASS"
    tests = {case["id"]: case for case in summary["cases"]}
    assert {key: tests[key]["passed"] for key in ("maintained","launch-focused","pi03-contact","director-compatibility")} == {
        "maintained": 245, "launch-focused": 11, "pi03-contact": 9, "director-compatibility": 9}
    exceptions = [case["id"] for case in summary["cases"] if case["verdict"] == "BASELINE_EXCEPTION"]
    assert set(exceptions) == {"smokeLS1E1", "smokeLS1E2"}
    for name in exceptions:
        assert tests[name]["expected"].encode() in archive.read(tests[name]["log"])
    absolute_build = root / "baseline-dist"
    windows = {f.relative_to(absolute_build).as_posix(): sha(f.read_bytes()) for f in absolute_build.rglob("*") if f.is_file()}
    linux = {v["path"]: v["sha256"] for v in summary["buildFiles"]}
    changes = [n for n in windows.keys() | linux.keys() if windows.get(n) != linux.get(n)]
    report["counts"] = {key:tests[key]["passed"] for key in ("maintained","launch-focused","pi03-contact","director-compatibility")}
    report["supplementalChecks"] = sum(case["passed"] == 0 and case["verdict"] == "PASS" and case["id"] != "production-build" for case in summary["cases"])
    report["baselineExceptions"] = {name:tests[name]["expected"] for name in exceptions}
    report["pinnedNode"] = summary["node"]
    report["buildComparison"] = {"windowsIN01":len(windows), "hostedCI02":len(linux),
                                 "differingFiles":changes,"exactParity":not changes}
    report["hostedArtifactContents"] = [dict(name=name, sha256=sha(archive.read(name))) for name in sorted(names)]
    report["buildFileSHA256"] = summary["buildFiles"]
(root / "CI02-hosted-verification.json").write_text(json.dumps(report, indent=2) + "\n",encoding="utf-8")
print(json.dumps({key:report[key] for key in ("counts","supplementalChecks","baselineExceptions","buildComparison")}))
