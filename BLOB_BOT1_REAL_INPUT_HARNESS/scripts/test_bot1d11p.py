"""D11P regression: original D11O receipts remain authoritative."""
import unittest,copy
from unittest.mock import patch
from analyze_bot1d11o import run_row
class D11PTests(unittest.TestCase):
 def test_reject_wrong_revision(self):
  with patch('analyze_bot1d11o.d11n_row',return_value={'captureValid':True,'testPass':True,'geometryGatePassed':True,'geometryWarning':False,'soleSealedPeelViolations':0}):
   row=run_row({'interventions':[]},{'revision':'WRONG','status':'CAPTURED','errors':[],'profile':'away_control'})
   self.assertFalse(row['captureValid'])
 def test_reject_runner_error(self):
  with patch('analyze_bot1d11o.d11n_row',return_value={'captureValid':True,'testPass':True,'geometryGatePassed':True,'geometryWarning':False,'soleSealedPeelViolations':0}):
   row=run_row({'interventions':[]},{'revision':'BOT1-D11O-1','status':'CAPTURED','errors':['x'],'profile':'away_control'})
   self.assertFalse(row['captureValid'])
 def test_trace_unchanged(self):
  t={'interventions':[{'label':'actual'}]}
  with patch('analyze_bot1d11o.d11n_row',return_value={'captureValid':True,'testPass':True,'geometryGatePassed':True,'geometryWarning':False,'soleSealedPeelViolations':0}) as m:
   run_row(t,{'revision':'BOT1-D11O-1','status':'CAPTURED','errors':[],'profile':'away_control'})
   self.assertEqual(t['interventions'],[{'label':'actual'}])
   self.assertEqual(m.call_args.args[1]['interventions'][-1]['kind'],'d11p_scorer_compatibility_only')
if __name__=='__main__':unittest.main()
