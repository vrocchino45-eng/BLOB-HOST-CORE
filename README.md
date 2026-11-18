# Connection 62 validation patch

Extract over the BLOB game root (next to package.json). Double-click RUN_BLOB_C62.bat. Upload C62_RESULTS if validation fails. Commit .github/workflows and tools/connection62 for GitHub Actions.

This patch changes no game source and leaves C61 validation and historical contracts intact. It accepts only CRLF-to-LF equivalent content as a fallback when verifying historical hashes; other byte changes fail.
