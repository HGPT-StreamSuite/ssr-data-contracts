import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { root, makeData, sourceSnapshot } from '../tools/workbench-data.mjs';

const html = fs.readFileSync(path.join(root, 'web/index.html'), 'utf8');
const core = fs.readFileSync(path.join(root, 'tools/contract-validator.js'), 'utf8');
const app = fs.readFileSync(path.join(root, 'web/app.js'), 'utf8');
class Element {
  constructor(tag = 'div') { this.tagName = tag; this.children = []; this.listeners = {}; this.attributes = {};
    this.dataset = {}; this.value = ''; this.textContent = ''; this.hidden = false; this.disabled = false; this.className = ''; }
  append(...elements) { this.children.push(...elements); }
  replaceChildren(...elements) { this.children = elements; }
  setAttribute(name, value) { this.attributes[name] = value; }
  addEventListener(name, listener) { (this.listeners[name] ||= []).push(listener); }
  focus() { this.focused = true; }
  emit(name, event = {}) {
    if (name === 'click' && this.disabled) return [];
    return (this.listeners[name] || []).map((listener) => listener(event));
  }
  set innerHTML(value) { throw new Error('Untrusted DOM HTML sink: ' + value); }
}
function harness() {
  const elements = new Map();
  for (const match of html.matchAll(/<([a-z0-9]+)\b[^>]*\bid="([^"]+)"[^>]*>/g)) elements.set(match[2], new Element(match[1]));
  const tabs = ['workbench', 'criteria', 'evidence'].map((name) => {
    const tab = elements.get('tab-' + name); tab.dataset.view = name; return tab;
  });
  const returns = [new Element('button'), new Element('button')];
  const frames = [];
  const window = { SSRContractData: makeData(), requestAnimationFrame: (callback) => frames.push(callback) };
  const document = { getElementById: (id) => elements.get(id), createElement: (tag) => new Element(tag),
    querySelectorAll: (selector) => selector === '[data-view]' ? tabs : selector === '[data-return]' ? returns : [] };
  const context = vm.createContext({ window, document, TextEncoder, Set, console });
  vm.runInContext(core, context); window.SSRContractValidator = context.SSRContractValidator; vm.runInContext(app, context);
  return { get: (id) => elements.get(id), click: (id) => elements.get(id).emit('click'),
    result: () => JSON.parse(elements.get('output').textContent), frames, returns, window,
    async flush() { while (frames.length) { frames.shift()(0); await Promise.resolve(); } } };
}
test('F01 browser and CLI core accept identical 14 fixtures', () => {
  const h = harness();
  for (const sample of h.window.SSRContractData.examples) {
    assert.equal(h.window.SSRContractValidator.validate(sample.value, sample.schema, h.window.SSRContractData.schemas).valid, true);
  }
});
test('F07 loading, validating, editing and errors never reuse old pass', () => {
  const h = harness(); h.click('load-example'); h.click('validate'); assert.equal(h.result().valid, true);
  h.get('payload').value = '{'; h.get('payload').emit('input'); assert.equal(h.result().status, 'not_run');
  h.click('validate'); assert.equal(h.result().valid, false); assert.match(h.result().errors[0], /JSON 解析/);
});
test('F07 duplicate submit, clear and undo are isolated', () => {
  const h = harness(); h.click('load-example'); const text = h.get('payload').value;
  h.click('validate'); const first = h.get('output').textContent; h.click('validate'); assert.equal(h.get('output').textContent, first);
  h.click('clear'); assert.equal(h.get('payload').value, ''); assert.equal(h.result().status, 'not_run');
  h.click('undo'); assert.equal(h.get('payload').value, text); assert.equal(h.result().status, 'not_run');
});
test('F07 contract switch invalidates result but preserves input', () => {
  const h = harness(); h.click('load-example'); h.click('validate'); const text = h.get('payload').value;
  h.get('schema').value = 'context-snapshot.schema.json'; h.get('schema').emit('change');
  assert.equal(h.get('payload').value, text); assert.equal(h.result().status, 'not_run');
  h.click('validate'); assert.equal(h.result().valid, false);
});
test('F07 tabs, keyboard arrows and return preserve draft', () => {
  const h = harness(); h.click('load-example'); const text = h.get('payload').value;
  h.click('tab-criteria'); assert.equal(h.get('view-workbench').hidden, true);
  h.returns[0].emit('click'); assert.equal(h.get('view-workbench').hidden, false);
  let prevented = false; h.get('tab-workbench').emit('keydown', { key: 'ArrowDown', preventDefault() { prevented = true; } });
  assert.equal(prevented, true); assert.equal(h.get('view-criteria').hidden, false); assert.equal(h.get('payload').value, text);
});
test('F08 batch computes 14 results; duplicate start does not overlap', async () => {
  const h = harness(); const running = h.click('run-all')[0]; assert.equal(h.get('validate').disabled, true);
  h.click('run-all'); assert.equal(h.frames.length, 1); await h.flush(); await running;
  assert.equal(h.result().status, 'pass'); assert.equal(h.result().completed, 14);
  assert.equal(h.result().results.filter((result) => result.valid).length, 14);
});
test('F08 cancel cannot become pass and later run starts clean', async () => {
  const h = harness(); const running = h.click('run-all')[0]; h.click('cancel'); await h.flush(); await running;
  assert.equal(h.result().status, 'canceled'); assert.equal(h.result().completed, 0);
  const next = h.click('run-all')[0]; await h.flush(); await next; assert.equal(h.result().status, 'pass'); assert.equal(h.result().completed, 14);
});
test('F08 editing during batch invalidates pending callbacks', async () => {
  const h = harness(); const running = h.click('run-all')[0]; h.get('payload').value = '{}'; h.get('payload').emit('input');
  await h.flush(); await running; assert.equal(h.result().status, 'not_run'); assert.equal(h.get('run-all').disabled, false);
  assert.match(h.get('batch-progress').textContent, /已停止/);
});
test('F09 resources stay local and UI uses no network or persistence API', () => {
  const refs = Array.from(html.matchAll(/(?:src|href)="([^"]+)"/g), (m) => m[1]).filter((ref) => !ref.startsWith('#'));
  for (const ref of refs) { assert.ok(!/^(?:https?:|\/\/)/.test(ref)); assert.ok(fs.existsSync(path.resolve(root, 'web', ref)), ref); }
  assert.match(html, /connect-src 'none'/);
  assert.doesNotMatch(app, /\b(?:fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage|innerHTML|eval)\b/);
  assert.match(fs.readFileSync(path.join(root, 'web/styles.css'), 'utf8'), /max-width:720px/);
});
test('F10 bundle matches current schema/example/source snapshot', () => {
  const window = {}; vm.runInNewContext(fs.readFileSync(path.join(root, 'web/data.js'), 'utf8'), { window });
  assert.equal(window.SSRContractData.source.fingerprint, sourceSnapshot().fingerprint);
  assert.equal(JSON.stringify(window.SSRContractData.schemas), JSON.stringify(makeData().schemas));
  assert.equal(window.SSRContractData.examples.length, 14); assert.equal(window.SSRContractData.functionalCases.length, 11);
});
test('common browser gate stays blocked even when repo functional case passes', () => {
  const h = harness(); const common = h.window.SSRContractData.commonAcceptance;
  assert.equal(common.status, 'defined'); assert.equal(common.overallResult, 'blocked');
  assert.match(common.details.criterion, /預設瀏覽器/);
  assert.equal(common.verification.actualPageOpen, 'not_run');
  assert.equal(common.verification.functionalInteraction, 'not_run');
  assert.equal(common.verification.priorDenialNotRetried, true);
  assert.equal(common.functionalCasesReplaceCommonStandard, false);
  h.click('load-example'); h.click('validate'); assert.equal(h.result().valid, true);
  assert.match(h.get('common-status').textContent, /受阻/);
  assert.match(html, /不適用及理由/); assert.match(html, /不構成共用標準豁免/);
  assert.ok(h.window.SSRContractData.functionalCases.every((entry) => /^F\d{2}$/.test(entry.id)));
});
