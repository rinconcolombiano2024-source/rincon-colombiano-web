import test from 'node:test';
import assert from 'node:assert/strict';
import { answerParts, approvedAnswerHref } from '../src/components/rincon-ai/answer-links.ts';

test('official AI actions work in all three languages and preserve punctuation', () => {
  for (const locale of ['pl', 'es', 'en']) {
    const text = `Menu: /${locale}/menu. [Pedir](/${locale}/canales-pedido) https://rincon-colombiano.sumupstore.com/produkty!`;
    const parts = answerParts(text, locale);
    assert.deepEqual(parts.filter(p => p.href).map(p => p.href), [`/${locale}/menu`, `/${locale}/canales-pedido`, 'https://rincon-colombiano.sumupstore.com/produkty']);
    assert.equal(parts.map(p => p.text).join(''), `Menu: /${locale}/menu. Pedir https://rincon-colombiano.sumupstore.com/produkty!`);
    assert.equal(approvedAnswerHref('#locations', locale), `/${locale}#locations`);
    assert.equal(approvedAnswerHref('https://rincon-colombiano-pedidosapp.vercel.app/', locale), 'https://rincon-colombiano-pedidosapp.vercel.app/');
  }
});

test('model-generated unsafe, unverified, private and tracking links remain inert', () => {
  for (const value of [
    // eslint-disable-next-line no-script-url -- malicious model output must be rejected, never executed
    'javascript:alert(1)', 'data:text/html,test', 'https://evil.example/',
    'https://rinconcolombiano.pl.evil.example/es/menu', 'https://evil@rinconcolombiano.pl/es/menu',
    'https://rinconcolombiano.pl:444/es/menu', 'http://rinconcolombiano.pl/es/menu',
    '/admin', '/api/rincon-ai/chat', '/es/menu?secret=123', '/es#missing', '/pl/menu',
    'https://rincon-colombiano.sumupstore.com/produkty?tracking=private',
    'https://rincon-colombiano-pedidosapp.vercel.app/admin',
  ]) {
    assert.equal(approvedAnswerHref(value, 'es'), undefined, value);
    const text = `[Abrir](${value})`;
    const parts = answerParts(text, 'es');
    assert.equal(parts.some(p => p.href), false, value);
    assert.equal(parts.map(p => p.text).join(''), text);
  }
  assert.deepEqual(answerParts('Hola <script>alert(1)</script>', 'es'), [{text:'Hola <script>alert(1)</script>'}]);
  assert.deepEqual(answerParts('', 'es'), []);
  assert.equal(approvedAnswerHref('/es', 'unknown'), undefined);
});
