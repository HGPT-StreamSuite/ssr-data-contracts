import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import validator from '../tools/contract-validator.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const schemas = Object.fromEntries(fs.readdirSync(path.join(root, 'contracts/v0.1'))
  .map((name) => [name, read('contracts/v0.1/' + name)]));
const sample = (name) => read('examples/' + name + '.example.json');
const check = (value, schema) => validator.validate(value, schema + '.schema.json', schemas);
const rejection = (result, text) => {
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes(text)), JSON.stringify(result));
};
for (const [name, schema] of validator.exampleMappings) {
  test('F01 accepted synthetic fixture: ' + name, () => {
    const value = read('examples/' + name); const before = JSON.stringify(value);
    assert.deepEqual(validator.validate(value, schema, schemas), { valid: true, errors: [] });
    assert.equal(JSON.stringify(value), before, 'validation must not mutate input');
  });
}
const shapeCases = [
  ['missing field', (v) => { delete v.message_id; }, 'message_id'],
  ['wrong type', (v) => { v.text = 1; }, '$.text'],
  ['unknown property', (v) => { v.extra = true; }, 'extra'],
  ['unknown enum', (v) => { v.actor.role = 'administrator'; }, 'enum'],
  ['wrong version', (v) => { v.schema_version = '2.0'; }, '固定值'],
  ['empty text', (v) => { v.text = ''; }, '字串長度'],
  ['missing timezone', (v) => { v.occurred_at = '2026-11-05T12:00:00'; }, 'date-time'],
  ['invalid date', (v) => { v.occurred_at = 'not-a-dateZ'; }, 'date-time'],
  ['null nested value', (v) => { v.source = null; }, '$.source'],
];
for (const [name, mutate, expected] of shapeCases) {
  test('F02 rejects ' + name, () => { const value = sample('chat-event'); mutate(value); rejection(check(value, 'chat-event'), expected); });
}
test('F02 rejects invalid array item', () => {
  const value = sample('context-snapshot'); value.messages = [null]; rejection(check(value, 'context-snapshot'), '$.messages[0]');
});
test('F03 valid ingest requires normalized event and matching ingest_id', () => {
  const value = sample('ingest-attempt'); value.validation.status = 'valid';
  rejection(check(value, 'ingest-attempt'), 'normalized_event');
  value.normalized_event = sample('chat-event'); value.normalized_event.ingest_id = value.ingest_id;
  assert.equal(check(value, 'ingest-attempt').valid, true);
  value.normalized_event.ingest_id = 'synthetic-mismatch'; rejection(check(value, 'ingest-attempt'), 'ingest_id');
});
test('F03 invalid ingest cannot carry normalized event', () => {
  const value = sample('ingest-attempt'); value.normalized_event = sample('chat-event');
  rejection(check(value, 'ingest-attempt'), 'invalid 輸入不得有');
});
for (const disposition of ['invalid', 'not_triggered', 'triggered']) {
  test('F04 routing ' + disposition + ' positive and negative combinations', () => {
    const value = sample('routing-decision'); value.disposition = disposition;
    value.next_step = disposition === 'triggered' ? 'question_analysis' : 'fixed_sop';
    assert.equal(check(value, 'routing-decision').valid, true);
    value.next_step = value.next_step === 'fixed_sop' ? 'question_analysis' : 'fixed_sop';
    rejection(check(value, 'routing-decision'), '必須路由');
  });
}
test('F04 valid routing needs message_id but invalid routing may omit it', () => {
  const value = sample('routing-decision'); delete value.message_id;
  rejection(check(value, 'routing-decision'), 'message_id');
  value.disposition = 'invalid'; assert.equal(check(value, 'routing-decision').valid, true);
});
const relationCases = [
  ['snapshot', (v) => { v.analysis.context_snapshot_id = 'synthetic-mismatch'; }, 'snapshot_id'],
  ['analysis run', (v) => { v.analysis.run_id = 'synthetic-mismatch'; }, '$.analysis'],
  ['analysis message', (v) => { v.analysis.message_id = 'synthetic-mismatch'; }, '$.analysis'],
  ['query run', (v) => { v.query_results[0].run_id = 'synthetic-mismatch'; }, '$.query_results'],
  ['query message', (v) => { v.query_results[0].message_id = 'synthetic-mismatch'; }, '$.query_results'],
];
for (const [name, mutate, expected] of relationCases) {
  test('F05 rejects mismatched ' + name, () => {
    const value = sample('answer-prompt-input'); mutate(value); rejection(check(value, 'answer-prompt-input'), expected);
  });
}
test('F05 rejects dangling source reference including nested prompt results', () => {
  const value = sample('query-result'); value.materials[0].source_ids = ['synthetic-absent'];
  rejection(check(value, 'query-result'), '不存在');
  const prompt = sample('answer-prompt-input'); prompt.query_results[0].materials[0].source_ids = ['synthetic-absent'];
  rejection(check(prompt, 'answer-prompt-input'), '不存在');
});
test('F05 unavailable weather must not claim material or source', () => {
  const value = sample('query-result.weather'); value.sources = sample('query-result').sources;
  rejection(check(value, 'query-result'), 'unavailable');
});
test('F06 empty, malformed JSON, null and unknown schema fail safely', () => {
  rejection(validator.parseAndValidate(' ', 'chat-event.schema.json', schemas), '請輸入');
  rejection(validator.parseAndValidate('{', 'chat-event.schema.json', schemas), 'JSON 解析');
  rejection(validator.parseAndValidate('null', 'chat-event.schema.json', schemas), 'object');
  rejection(validator.parseAndValidate('{}', 'unknown', schemas), '未知 schema');
});
test('F06 input limit counts UTF-8 bytes', () => {
  rejection(validator.parseAndValidate(JSON.stringify({ text: '測'.repeat(90000) }), 'chat-event.schema.json', schemas), '256 KiB');
});
test('F06 rejects deeply nested and excessive node input', () => {
  const value = sample('ingest-attempt'); let nested = {};
  for (let i = 0; i < 70; i++) nested = { next: nested };
  value.raw_event = nested; rejection(check(value, 'ingest-attempt'), '64 層');
  value.raw_event = { values: Array(20001).fill(0) }; rejection(check(value, 'ingest-attempt'), '20,000');
});
test('F06 unknown schema keywords and external references fail closed', () => {
  rejection(validator.validate({}, 'custom', { custom: { type: 'object', pattern: 'unsupported' } }), '不支援');
  rejection(validator.validate({}, 'custom', { custom: { $ref: 'https://invalid.example/schema' } }), '$ref');
});
test('F07 repeated validation is deterministic and immutable', () => {
  const value = sample('chat-event'); const before = JSON.stringify(value);
  assert.deepEqual(check(value, 'chat-event'), check(value, 'chat-event')); assert.equal(JSON.stringify(value), before);
});
