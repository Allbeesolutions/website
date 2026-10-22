#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const types=[
  ['courses.html','Free Career Counseling','counseling_modal'],
  ['services.html','Get a Project Quote','business_quote_modal'],
  ['webdevelopment.html','Get a Project Quote','business_quote_modal'],
  ['digitalmarketing.html','Get a Project Quote','business_quote_modal'],
  ['invitation.html','Invitation Enquiry','invitation_modal'],
  ['invitation-samples.html','Invitation Enquiry','invitation_modal'],
];
for(const [file,heading,source] of types){
  const html=read(file);
  assert.ok(html.includes('id="modal-title" class="modal-title">'+heading),file+' enquiry context');
  assert.ok(html.includes('name="form_source" value="'+source+'"'),file+' source tagging');
  assert.ok(html.includes('name="_gotcha"'),file+' honeypot');
  assert.ok(html.includes('name="full_name"'),file+' contact details');
}
assert.ok(!read('services.html').includes('>Get Free Counseling</button>'));
assert.match(read('webdevelopment.html'),/<option selected>Website Development<\/option>/);
assert.match(read('digitalmarketing.html'),/<option selected>Digital Marketing<\/option>/);
assert.ok(read('invitation.html').includes('name="event_type"'));
assert.ok(read('courses.html').includes('name="course"'));
assert.ok(read('assets/lead-form.js').includes('values.course ? [asText(values.course)]'));
console.log('Context-aware funnel: course, business, web, marketing, invitation CTAs and source tags PASS');
