#!/usr/bin/env python3
"""G1-D8 online steering policy. HUD + image response + action history only.

No owner distance, world coordinates, camera matrix, REC1 or Guide state may
influence decisions. D7 repeatedly selected the visually novel right view.
This design bounds steering and explicitly separates look and move trials.
"""
from __future__ import annotations
from collections import Counter
from dataclasses import dataclass, field

# Balanced, repeatable camera and fixed-camera movement *diagnostics*.
# The very first post-invitation action retreats from a potential boundary.
# Every look is separate from movement; no endless right-look selection.
COURSE=(
 ('move','s',1.10,'initial_reverse_clearance_probe'),
 ('observe',None,.28,'settle_before_translation'),
 ('move','a',.83,'fixed_camera_left_translation'),
 ('move','w',1.00,'fixed_camera_forward_translation'),
 ('look','j',.52,'look_only_left_calibration'),
 ('move','w',1.20,'fixed_camera_forward_commit_1'),
 ('move','w',1.08,'fixed_camera_forward_commit_2'),
 ('move','s',.96,'bounded_reverse_recovery'),
 ('look','l',1.02,'look_only_opposite_camera_calibration'),
 ('move','w',1.18,'fixed_camera_forward_opposite_1'),
 ('move','d',.85,'fixed_camera_right_translation'),
 ('move','w',1.08,'fixed_camera_forward_opposite_2'),
 ('move','s',.94,'retreat_before_reframe'),
 ('look','j',.50,'balanced_return_camera'),
)

@dataclass
class Steering:
    seed:int=11
    step:int=0
    poor_motion:int=0
    revisit_streak:int=0
    frame_history:list=field(default_factory=list)
    action_counts:Counter=field(default_factory=Counter)
    recovery_count:int=0

    def choose(self):
        # A poor-motion streak is only *suspected* resistance. Do not claim
        # boundary pressure without independent offline owner evidence.
        if self.poor_motion>=2:
            self.poor_motion=0;self.recovery_count+=1
            return ('move','s',1.16,'low_image_motion_retreat_not_boundary_proof')
        if self.revisit_streak>=3:
            self.revisit_streak=0;self.recovery_count+=1
            turn='j' if self.recovery_count%2 else 'l'
            return ('look',turn,.63,'revisited_scene_balanced_reframe')
        return COURSE[self.step%len(COURSE)]

    def observe(self,action,measurement=None):
        op,key,sec,reason=action;self.action_counts[(op,key)]+=1
        if op=='move' and measurement:
            if measurement.get('screenFlow',{}).get('trackedPatches',0)>=5:
                self.poor_motion=self.poor_motion+1 if not measurement.get('imageMotionAboveAmbient') else 0
            else:
                # Missing features -> uncertainty, not certain blockage.
                self.poor_motion=0
            self.revisit_streak=self.revisit_streak+1 if measurement.get('sceneRevisited') else 0
        self.step+=1

    def summary(self):
        return {'courseSteps':self.step,'recoveryCount':self.recovery_count,
                'poorMotionStreak':self.poor_motion,'revisitStreak':self.revisit_streak,
                'actionCounts':{str(k):v for k,v in self.action_counts.items()},
                'onlineBoundaryPressureObserved':False,'goalDirectionKnown':False}
