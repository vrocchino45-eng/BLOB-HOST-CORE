# BLOB BOT1-D11M Windows newline test-only hotfix

The screenshot shows 15/16 tests with only `test_installer_apply_idempotent_undo_drift` failing. On Windows, Python `Path.write_text` with newline=None converts LF fixtures to CRLF. The previous test compared a byte-exact rollback to the *unconverted LF* literal. This was an incorrect fixture expectation, not a proven rollback bug.

This hotfix changes ONLY `BLOB_BOT1_REAL_INPUT_HARNESS/scripts/test_bot1d11m.py`. Its fixture now uses `write_bytes` and tests both LF and CRLF explicitly. It does **not** update `D11M_APPLY.py`, the installed D11M probe, movement/contact owners, or any gameplay mechanics. The patch stops if the existing test differs from the shipped D11M test, and backs up the original test before replacement.

From the BLOB-HOST-CORE repository root in PowerShell:

```powershell
Expand-Archive -LiteralPath '.\BLOB_BOT1_D11M_WINDOWS_TEST_HOTFIX.zip' -DestinationPath '.' -Force
py .\D11M_TEST_FIX_APPLY.py --check
py .\D11M_TEST_FIX_APPLY.py --apply
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d11m.py
```

Expect `Ran 16 tests` and `OK`. This does not require reapplying D11M or undoing earlier HC/LS patches.

Once the tests pass, run the existing 18-trial D11M matrix:

```powershell
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d11m_browser.py --browser-channel chrome --headed --pairs 3 --seconds 75 --output BOT1D11M_RESULTS
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d11m.py BOT1D11M_RESULTS
Compress-Archive -Path '.\BOT1D11M_RESULTS\*' -DestinationPath '.\BOT1D11M_RESULTS.zip' -Force
```

To undo the hotfix (test file only), run `py .\D11M_TEST_FIX_APPLY.py --undo`. Do NOT run `D11M_APPLY.py --undo` to fix the unit test.
