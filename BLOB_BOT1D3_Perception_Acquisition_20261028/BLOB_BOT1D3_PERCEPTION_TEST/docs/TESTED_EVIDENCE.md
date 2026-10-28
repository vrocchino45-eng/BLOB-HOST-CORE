# BOT1-D3 Testing Record

- Offline source study: existing BOT1-D browser runner, current GUIDE0-W owner schema, ControlMap's IJKL camera keys, prior GUIDE0-W field trace.
- `test_bot1d3.py`: **14 fixture assertions passed** including HUD priority, Fold invitation detection, screenshot motion detection, actual camera key selection, rejected near miss and accepted Watcher pulse separation, Guide reaction vs owner acceptance separation, and no false Fold invitation.
- `python -m py_compile` of all five scripts: PASS.
- Historical GUIDE0-W read-only regression replay: 80 owner-witnessed Pulses; 0 accepted; 62 outside range; 18 no active packet; nearest sampled distance 3.4546329; 80 Guide pairs; 696 Guide samples; Fold stage 0. Matches prior evidence.
- **No real BOT1-D3 gameplay run has been executed by the author.** The package requires the running Windows build, then fresh BOT1-D3 recordings to grade.
- Visual-motion cue scores ordinary rendered pixels, not semantic identification. It can track the Guide or scenery instead of the packet; do not claim visual gameplay understanding.
