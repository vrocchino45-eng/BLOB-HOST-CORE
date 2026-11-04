# GSL-2 visual expression prototype

Extract ZIP into project root, then open `GSL2_VISUAL_LAB.html` in a browser. It is self-contained, silent, and does not contact the game runtime. Play, pause, reset, and scrub the timeline. Light and movement use the actual GSL-1 cue schedule; the motion curves are illustrative prototypes, not production Guide animation. No gameplay files are modified.

```powershell
Expand-Archive -LiteralPath ".\BLOB_GUIDE_GSL2_VISUAL_LAB.zip" -DestinationPath "." -Force
Start-Process ".\GSL2_VISUAL_LAB.html"
```
