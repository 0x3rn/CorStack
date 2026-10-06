import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { NextResponse } from 'next/server';
import { authorizeAdmin } from '../lib/admin';
import { HttpError, readJson, escapeHtml, assertSameOrigin, apiError } from '../lib/http';
import { contactSchema, parseBody, portfolioSchema, leadUpdateSchema } from '../lib/validation';
import { createLocalLimiter } from '../lib/rate-limit';

const token = { uid: 'admin-uid', email: 'admin@example.test', email_verified: true };
test('admin authorization fails closed and checks verified identity', () => {
  assert.throws(() => authorizeAdmin(token, {}), (error: unknown) => error instanceof HttpError && error.status === 503);
  assert.throws(() => authorizeAdmin({ ...token, uid: 'other' }, { ADMIN_UID: 'admin-uid' }), /admin access/);
  assert.throws(() => authorizeAdmin({ ...token, email_verified: false }, { ADMIN_EMAIL: token.email }), /admin access/);
  assert.throws(() => authorizeAdmin({ ...token, email: 'other@example.test' }, { ADMIN_EMAIL: token.email }), /admin access/);
  assert.doesNotThrow(() => authorizeAdmin(token, { ADMIN_UID: token.uid }));
  assert.doesNotThrow(() => authorizeAdmin(token, { ADMIN_EMAIL: 'ADMIN@example.test' }));
});
function request(body: unknown) { return new Request('https://corstack.dev/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); }
test('JSON validation rejects malformed, oversized, and incomplete requests', async () => {
  await assert.rejects(readJson(new Request('https://corstack.dev', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })), /Invalid JSON/);
  await assert.rejects(readJson(request({ text: 'x'.repeat(100) }), 20), /too large/);
  await assert.rejects(parseBody(request({}), contactSchema), error => error instanceof HttpError && error.status === 400);
  await assert.rejects(parseBody(request({ name: 'Test\nBcc: victim', email: 'a@example.test', message: 'Hi' }), contactSchema));
  await assert.rejects(parseBody(request({ name: 'Test', email: ['a@example.test','b@example.test'], message: 'Hi' }), contactSchema));
});
test('HTML escaping removes markup and attribute delimiters', () => {
  assert.equal(escapeHtml('<a href="x">&\'</a>'), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
});
test('portfolio and financial updates reject unsafe data', () => {
  assert.equal(portfolioSchema.safeParse({ title: 'Test', category: 'Web', order: 0, websiteUrl: 'javascript:alert(1)' }).success, false);
  assert.equal(portfolioSchema.safeParse({ title: 'Test', category: 'Web', order: 0, desktopImages: [{url:'//evil.example/image.png'}] }).success, false);
  assert.equal(leadUpdateSchema.safeParse({ id: 'lead', actualPricePaid: -1 }).success, false);
  assert.equal(leadUpdateSchema.safeParse({ id: '../lead', status: 'completed' }).success, false);
  assert.equal(leadUpdateSchema.safeParse({ id: 'lead' }).success, false);
  assert.equal(leadUpdateSchema.safeParse({ id: 'lead', actualPricePaid: 0, currency: 'ngn' }).success, true);
});
test('local rate limits expire and keep identities independent', () => {
  const limit = createLocalLimiter(2, 1000);
  assert.equal(limit('a',0),true); assert.equal(limit('a',1),true); assert.equal(limit('a',2),false);
  assert.equal(limit('b',2),true); assert.equal(limit('a',1001),true);
});
test('cross-origin requests are rejected', () => {
  assert.throws(() => assertSameOrigin(new Request('https://corstack.dev/api/contact',{headers:{Origin:'https://evil.example'}})), /origin/);
  assert.doesNotThrow(() => assertSameOrigin(new Request('https://corstack.dev/api/contact',{headers:{Origin:'https://corstack.dev'}})));
  assert.doesNotThrow(() => assertSameOrigin(new Request('https://web.corstack.dev/api/contact',{headers:{Origin:'https://web.corstack.dev'}})));
});
function loadRoute(file: string, dependencies: Record<string, unknown>, env: Record<string, string> = {}, globals: Record<string, unknown> = {}) {
  const compiled = ts.transpileModule(fs.readFileSync(file,'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const loadedModule = { exports: {} as Record<string, (request: Request) => Promise<Response>> };
  vm.runInNewContext(compiled, { module: loadedModule, exports: loadedModule.exports, require: (id: string) => {
    if (!(id in dependencies)) throw new Error('Unexpected dependency: '+id);
    return dependencies[id];
  }, process: { env }, console: {error(){}}, URL, Request, Response, Date, crypto, AbortSignal, ...globals });
  return loadedModule.exports;
}
const http = { HttpError, readJson, escapeHtml, assertSameOrigin, apiError };
function contactRoute(unavailable = false, emailFails = false) {
  const saved: Record<string, unknown>[] = [], sent: {html:string;to:string[]}[] = [];
  const db = { collection: () => ({ add: async (data: Record<string,unknown>) => { if(unavailable) throw new Error('Database unavailable'); saved.push(data); return {id:'lead'}; }, doc: () => ({update:async()=>{}}) }) };
  class Resend { emails = { send: async (data: {html:string;to:string[]}) => { sent.push(data); return emailFails ? {error:{message:'Offline'}} : {data:{id:'mock'}}; } }; }
  const route = loadRoute('app/api/contact/route.ts', { 'next/server':{NextResponse},resend:{Resend},'@/lib/db/neon':{db},'@/lib/http':http,'@/lib/validation':{contactSchema,parseBody},'@/lib/rate-limit':{enforceRateLimit:async()=>{}} },{RESEND_API_KEY:'test'});
  return { route, saved, sent };
}
test('contact emails escape input and preserve raw lead data', async () => {
  const {route,saved,sent}=contactRoute();
  const body={name:'<b>Visitor</b>',email:'visitor@example.test',message:'<a href="https://evil.example">Injected</a>',type:'contact'};
  const response=await route.POST(request(body));
  assert.equal(response.status,200);assert.equal(saved.length,1);assert.equal(sent.length,2);
  assert.equal(saved[0].message,body.message);
  for(const email of sent){ assert.equal(email.html.includes(body.message),false);assert.equal(email.html.includes('&lt;a href='),true); }
});
test('database failures cannot send email or acknowledge a contact request', async () => {
  const {route,sent}=contactRoute(true);
  const response=await route.POST(request({name:'Visitor',email:'visitor@example.test',message:'Hello'}));
  assert.equal(response.status,503);assert.equal(sent.length,0);assert.equal((await response.json()).success,false);
});
test('email outages do not lose persisted leads or encourage duplicate submissions', async () => {
  const {route,saved}=contactRoute(false,true);
  assert.equal((await route.POST(request({name:'Visitor',email:'visitor@example.test',message:'Hello'}))).status,200);
  assert.equal(saved.length,1);
});
test('content API returns an error during a database outage', async () => {
  const route=loadRoute('app/api/content/route.ts',{'next/server':{NextResponse},'@/lib/db/content':{getPublicContent:async()=>{throw new Error('Database unavailable');}},'@/lib/http':http});
  assert.equal((await route.GET(request({}))).status,503);
});

test('admin mutations reject unauthorized requests without touching the database', async () => {
  let touched = false;
  const crud = loadRoute('lib/admin-crud.ts', {
    'next/server': {NextResponse}, zod: {z: (await import('zod')).z},
    './db/neon': {db: {collection: () => {touched = true; throw new Error('Unexpected database access');}}},
    './admin': {verifyAdmin: async () => {throw new HttpError(403, 'Not authorized');}},
    './http': http, './validation': await import('../lib/validation'),
  }) as unknown as { createCollectionHandlers: (name: string, schema: unknown) => Record<string, (request: Request) => Promise<Response>> };
  const handlers = crud.createCollectionHandlers('portfolio', portfolioSchema);
  for (const method of ['POST','PUT','DELETE']) assert.equal((await handlers[method](request({}))).status,403);
  assert.equal(touched,false);
});

test('payment success requires a matching provider reference, amount, currency and customer', async () => {
  const reference = 'ca1c1f33-213c-40bc-a0ad-75aee5cfe7a1';
  const saved = {status:'pending',amount:10000,currency:'NGN',email:'visitor@example.test'};
  const correct = {status:'success',reference,amount:10000,currency:'NGN',customer:{email:saved.email},id:123};
  for (const change of [{amount:1},{currency:'USD'},{reference:'another'}, {customer:{email:'other@example.test'}}, {status:'failed'}, {}]) {
    let updated = false;
    const route = loadRoute('app/api/payment-status/route.ts', {
      'next/server': {NextResponse}, '@/lib/http':http,
      '@/lib/rate-limit':{enforceRateLimit:async()=>{}},
      '@/lib/db/neon':{db:{collection:()=>({doc:()=>({get:async()=>({exists:true,data:()=>saved}),update:async()=>{updated=true;}})})}},
    }, {PAYSTACK_SECRET_KEY:'test'}, {fetch:async()=>Response.json({status:true,data:{...correct,...change}})});
    const response = await route.GET(new Request('https://corstack.dev/api/payment-status?reference='+reference));
    assert.equal(response.status,200);
    assert.equal((await response.json()).verified,Object.keys(change).length === 0);
    assert.equal(updated,Object.keys(change).length === 0);
  }
});

test('invalid restores abort before database access and valid restores preserve IDs atomically', async () => {
  const helper = loadRoute('scripts/data-safety.mjs', {}) as unknown as {replaceCollections: (db:unknown, entries:unknown) => Promise<void>};
  const staged: {method:string;id:string}[]=[];
  let commits=0, reads=0;
  const db = {collection:()=>({get:async()=>{reads++;return{docs:[{id:'keep',ref:{id:'keep'}},{id:'old',ref:{id:'old'}}]};},doc:(id='new')=>({id})}),
    batch:()=>({delete:(ref:{id:string})=>staged.push({method:'delete',id:ref.id}),set:(ref:{id:string})=>staged.push({method:'set',id:ref.id}),commit:async()=>{commits++;}})};
  await assert.rejects(helper.replaceCollections(db,[['portfolio',[{title:'Bad',order:-1}]]]));
  assert.equal(reads,0);assert.equal(commits,0);
  await helper.replaceCollections(db,[['portfolio',[{id:'keep',title:'Kept',order:0}]]]);
  assert.equal(commits,1);
  assert.deepEqual(staged,[{method:'delete',id:'old'},{method:'set',id:'keep'}]);
});
