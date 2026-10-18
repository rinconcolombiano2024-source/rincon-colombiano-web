import test from 'node:test';
import assert from 'node:assert/strict';
import { analyticsCsv } from '../src/lib/analytics/export.ts';

const report = {totals:[12,18,30], orderClicks:4, days:[{label:'20261018',values:[30]}], pages:[{label:'/es',values:[20]}], sources:[{label:'Organic Search',values:[10]}], updatedAt:'2026-10-18T12:00:00Z',timeZone:'Europe/Warsaw'};

test('CSV preserves measured totals, dates, timezone and UTF-8 spreadsheet compatibility', () => {
  const csv = analyticsCsv(report, 30);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.endsWith('\r\n'));
  for (const row of ['"Visitantes medidos","12"', '"Sesiones","18"', '"Páginas vistas","30"', '"20261018","30"', '"/es","20"', '"Zona horaria","Europe/Warsaw"', '"Periodo (días)","30"']) { assert.ok(csv.includes(row),row); }
  assert.match(csv,/no pedidos confirmados/);
  assert.equal(analyticsCsv({...report,totals:[],days:[],pages:[],sources:[],orderClicks:0},7).includes('undefined'),false);
});

test('external analytics labels cannot inject formulas or break CSV field boundaries', () => {
  const labels = ['=HYPERLINK("https://evil.example")', '+1+1', '-1+1', '@SUM(1)', '  =1', '\t=1', '\r=1'];
  const csv = analyticsCsv({...report,pages:labels.map(label=>({label,values:[1]}))},90);
  for(const label of labels) { assert.ok(csv.includes(`"'${label.replaceAll('"','""')}","1"`),label); }
  const escaped = analyticsCsv({...report,pages:[{label:'a,"b"\nc',values:[1]}]},7);
  assert.ok(escaped.includes('"a,""b""\nc","1"'));
});
