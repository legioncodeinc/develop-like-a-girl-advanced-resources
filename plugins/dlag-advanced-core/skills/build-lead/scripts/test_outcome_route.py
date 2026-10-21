import importlib.util
from pathlib import Path
import unittest
import json
import sys
sys.dont_write_bytecode = True

spec=importlib.util.spec_from_file_location('outcome_route',Path(__file__).with_name('outcome-route.py'))
route=importlib.util.module_from_spec(spec);spec.loader.exec_module(route)

class OutcomeDiscovery(unittest.TestCase):
    def setUp(self):
        self.data={'outcomes':[
            {'id':'O001','outcome':'Understand a technical post','bucket':'Learning','bucket_id':'B01','capability_group':'technical-explainer','state':'PROPOSED'},
            {'id':'O031','outcome':'Set a SaaS price','bucket':'Business math','bucket_id':'B03','capability_group':'saas-pricing','state':'PROPOSED'},
            {'id':'O106','outcome':'Improve a repository','bucket':'Repository health','bucket_id':'B08','capability_group':'repo-modernization','state':'PROPOSED'}]}
    def test_explanation_alias(self):
        result=route.discover(self.data,'explain technical post')
        self.assertEqual(result['candidates'][0]['id'],'O001')
        self.assertEqual(result['candidates'][0]['state'],'PROPOSED')
        self.assertIn('unverified',result['availability'])
    def test_repo_alias(self):self.assertEqual(route.discover(self.data,'improve my repo')['candidates'][0]['id'],'O106')
    def test_bucket_boundary(self):self.assertEqual(route.discover(self.data,'SaaS price',bucket='B01')['candidates'],[])
    def test_unmatched_does_not_invent(self):self.assertEqual(route.discover(self.data,'quantum telescope')['candidates'],[])
    def test_bad_input(self):
        for query in ('',' '*3,'x'*2001,None):
            with self.subTest(query=repr(query)[:20]),self.assertRaises(ValueError):route.discover(self.data,query)
    def test_limit(self):
        for value in (0,21,True,1.5):
            with self.subTest(value=value),self.assertRaises(ValueError):route.discover(self.data,'price',value)
    def test_no_state_promotion(self):self.assertEqual(route.discover(self.data,'price')['candidates'][0]['state'],'PROPOSED')


class AdvancedRoster(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root=Path(__file__).resolve().parents[1]
        cls.index=json.loads((cls.root/'references/outcome-index.json').read_text())
        cls.routes=json.loads((cls.root/'references/route-map.json').read_text())
        cls.owners={row['id']:row['playbook'] for row in cls.index['selected_owners']}
        cls.outcomes={row['id']:row for row in cls.index['outcomes']}
    def test_roster_and_commands(self):
        self.assertEqual(len(self.owners),31)
        self.assertEqual(self.index['selected_owner_count'],31)
        self.assertEqual(self.routes['selected_owner_count'],31)
        self.assertEqual(self.routes['selected_owners'],self.index['selected_owners'])
        self.assertEqual(len(set(self.index['public_commands'])),14)
        self.assertEqual(self.routes['public_commands'],self.index['public_commands'])
        self.assertEqual(sum(v.startswith('dlag-advanced-core:') for v in self.owners.values()),24)
        self.assertEqual(sum(v.startswith('dlag-advanced-app-builder:') for v in self.owners.values()),6)
        self.assertEqual(sum(v.startswith('dlag-advanced-website-builder:') for v in self.owners.values()),1)
    def test_all_routes_resolve_to_selected_owner(self):
        for row in self.routes['routes']:
            with self.subTest(topic=row['topic']):
                self.assertIn(row['owner'],self.owners)
                self.assertEqual(row['playbook'],self.owners[row['owner']])
                self.assertTrue((self.root/'references'/row['guide']).is_file())
    def test_all_300_intents_preserved_without_false_availability(self):
        self.assertEqual(len(self.outcomes),300)
        for row in self.outcomes.values():
            with self.subTest(outcome=row['id']):
                if row['candidate_owner'] is None:
                    self.assertEqual(row['state'],'UNAVAILABLE')
                    self.assertNotIn('candidate_playbook',row)
                else:
                    self.assertEqual(row['candidate_playbook'],self.owners[row['candidate_owner']])
                    self.assertEqual(row['state'],'REQUIRES_SCOPE_REVIEW')
    def test_advanced_domains_are_available_candidates(self):
        for key,owner in {'O064':'app-builder','O070':'payload-host','O137':'data-foundation','O153':'identity','O167':'vercel-platform','O220':'ui-primitives'}.items():
            with self.subTest(outcome=key):self.assertEqual(self.outcomes[key]['candidate_owner'],owner)
    def test_other_stack_requests_are_not_silently_substituted(self):
        for key in ('O056','O063','O065','O138','O219','O228'):
            with self.subTest(outcome=key):self.assertIsNone(self.outcomes[key]['candidate_owner'])
    def test_discovery_preserves_boundaries(self):
        for query,key in [('Build a SvelteKit app from a clear brief','O064'),('Add Payload CMS without copying a product-specific template','O070'),('Implement WorkOS organization access correctly','O153'),('Use Cloudflare Workers storage and queues coherently','O056')]:
            result=route.discover(self.index,query,1)
            self.assertEqual(result['candidates'][0]['id'],key)
            self.assertEqual(result['candidates'][0]['state'],self.outcomes[key]['state'])
            self.assertIn('unverified',result['availability'])

if __name__=='__main__':unittest.main()
