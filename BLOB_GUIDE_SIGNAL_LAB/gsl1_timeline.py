#!/usr/bin/env python3
"""GSL-1 synchronized mock cue sheet. No audio playback, animation, or game hook."""
import json,sys
from pathlib import Path
from guide_signal_lab import demo
UNIT_MS=140
GAP_MS=70

def compile_timeline(signals):
    cues=[]
    for sig in signals:
        at=sig['atMs'];units=sig['channels']['audio']['rhythmUnits']
        for i,u in enumerate(units):
            duration=u*UNIT_MS
            for channel in ('audio','light'):
                cues.append({'eventId':sig['eventId'],'message':sig['message'],'channel':channel,
                    'pulse':i+1,'startMs':at,'durationMs':duration,'units':u})
            at+=duration+GAP_MS
        cues.append({'eventId':sig['eventId'],'message':sig['message'],'channel':'movement_expression',
            'startMs':sig['atMs'],'durationMs':at-sig['atMs']-GAP_MS,
            'gesture':sig['channels']['movement']['gesture'],'authority':'visual_only'})
    return {'status':'MOCK_CUE_SHEET_ONLY','unitMs':UNIT_MS,'gapMs':GAP_MS,'cues':cues,
        'limitations':['No sound rendered or played','No in-game lighting or motion','No gameplay authority',
            'HC027D1 reference level unchanged; future audio requires measured mix validation']}
if __name__=='__main__':
    output=Path(sys.argv[1] if len(sys.argv)>1 else 'GSL1_TIMELINE.json')
    output.write_text(json.dumps(compile_timeline(demo()['signals']),indent=2)+'\n')
    print('Wrote',output)
