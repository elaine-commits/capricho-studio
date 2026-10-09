import test from 'node:test';
import assert from 'node:assert/strict';
import {can,assertAuthorized,validTransition} from '../lib/studio-permissions.mjs';
test('viewer has read-only access',()=>{assert.equal(can('viewer','briefing:read'),true);assert.equal(can('viewer','briefing:create'),false);});
test('unknown roles and actions are denied',()=>{assert.equal(can('root','briefing:read'),false);assert.equal(can('admin','unknown'),false);});
test('inactive users are denied',()=>assert.throws(()=>assertAuthorized({active:false,role:'admin'},'briefing:read'),/não autorizado/));
test('editor can submit but not approve',()=>{assert.equal(validTransition('draft','in_review','editor'),true);assert.equal(validTransition('in_review','approved','editor'),false);});
test('reviewer can approve submitted briefs',()=>{assert.equal(validTransition('in_review','approved','reviewer'),true);assert.equal(validTransition('draft','approved','reviewer'),false);});
test('archived briefs cannot be reopened',()=>assert.equal(validTransition('archived','draft','admin'),false));
