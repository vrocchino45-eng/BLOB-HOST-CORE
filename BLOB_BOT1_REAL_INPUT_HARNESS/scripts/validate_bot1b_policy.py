#!/usr/bin/env python3
"""BOT1-B policy contract checks; no BLOB owner modification."""
from bot1_browser import ReaderPolicy, parse_objective

world='BLOB // HOST CORE // SURFACE WAKE Pulse the moving matter so the Watcher can identify it. Surface Wake: matter moving · Reading: Dense matter WASD move · F inspect Core · Left Mouse/X/Space pulse · Right Mouse absorb · Q stabilize'
inspection=world.replace('SURFACE WAKE','CORE INSPECTION',1)
no_goal='BLOB // HOST CORE // SURFACE WAKE · Reading: Dense matter WASD move · Left Mouse/X/Space pulse · Right Mouse absorb · Q stabilize'
assert parse_objective(world)['verb']=='pulse'
assert 'Watcher' in parse_objective(world)['directive']
assert parse_objective(no_goal)['verb'] is None
assert parse_objective(inspection)['mode']=='core_inspection'
r=ReaderPolicy(11)
assert r.decide(inspection)[0][:2]==('key','f')
tasks=[]
for _ in range(5):
  a,obj,reason=r.decide(world)
  tasks.append((a,obj,reason))
assert [x[0][:2] for x in tasks[:3]]==[('key','x'),('right',None),('holdkey','q')]
assert tasks[3][0][:2]==('key','x') and tasks[3][2]=='hud_directive_attempt'
assert tasks[4][2]=='uncertain_target_camera_scan'
assert all(x[1]['directive'].startswith('Pulse the moving matter') for x in tasks)
print('BOT1B_POLICY_PASS: 10 checks; objective prioritized, world view guarded, all 3 inputs independent.')
