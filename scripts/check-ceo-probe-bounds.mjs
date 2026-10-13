import assert from "node:assert/strict";
import { mapWithConcurrencyLimit } from "../src/lib/admin/bounded-map.ts";
import { readFileSync } from "node:fs";

let active=0,max=0;
const waiting=[];
const tasks=Array.from({length:100},(_,n)=>n);
const pending=mapWithConcurrencyLimit(tasks,2,async (value)=>{
  active++;max=Math.max(max,active);
  await new Promise(resolve=>waiting.push(resolve));
  active--;
  return value*3;
});
for(let round=0;round<70;round++){
  const queued=waiting.splice(0);
  for(const resolve of queued)resolve();
  await Promise.resolve();
  await Promise.resolve();
  if(!waiting.length && active===0)break;
}
const results=await pending;
assert.deepEqual(results,tasks.map(x=>x*3));
assert.equal(max,2);
assert.equal(active,0);
assert.deepEqual(await mapWithConcurrencyLimit([],2,async()=>0),[]);
await assert.rejects(()=>mapWithConcurrencyLimit([1],0,async x=>x),/INVALID_CONCURRENCY_LIMIT/);

const operations=readFileSync("src/app/(system)/admin/operations/page.tsx","utf8");
assert.match(operations,/await mapWithConcurrencyLimit\(brandSlots, 2/);
assert.match(operations,/await mapWithConcurrencyLimit\(languages, 2/);
assert.doesNotMatch(operations,/Promise\.all\(brandSlots\.map/);
const readiness=readFileSync("src/lib/admin/release-readiness.ts","utf8");
assert.match(readiness,/id: "sumup"/);
assert.match(readiness,/state: "blocked"/);
assert.doesNotMatch(readiness,/SumUp.*state: "ready"/);
const boundary=readFileSync("scripts/check-web-payments-boundary.mjs","utf8");
assert.match(boundary,/no payment provider secret settings/);
console.log("PASS: 100 CEO probes never exceed 2 concurrent reads; payments remain fail-closed");
