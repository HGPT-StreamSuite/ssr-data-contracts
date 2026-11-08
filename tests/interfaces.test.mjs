import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import * as api from '../tools/contracts-api.mjs';
import core from '../tools/contract-validator.js';
import { root, sourceNames } from '../tools/workbench-data.mjs';

const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const cases = read('interfaces/validation-cases.json');
const resultSchema = read('interfaces/validation-result.schema.json');
const childEnv = { ...process.env, NODE_DISABLE_COMPILE_CACHE: '1' };
for (const name of ['NODE_OPTIONS', 'NODE_PATH', 'NODE_V8_COVERAGE', 'NODE_COMPILE_CACHE']) delete childEnv[name];
function run(args, input = '') {
  return spawnSync(process.execPath, ['tools/validate_contract.mjs', ...args],
    { cwd: root, input, encoding: 'utf8', env: childEnv, windowsHide: true, timeout: 10000 });
}
function receipt(result, exit) {
  assert.equal(result.error, undefined); assert.equal(result.status, exit); assert.equal(result.stderr, '');
  const value = JSON.parse(result.stdout);
  assert.equal(core.validate(value, 'validation-result.schema.json', { 'validation-result.schema.json': resultSchema }).valid, true);
  assert.equal(value.valid, value.status === 'valid');
  assert.equal(api.exitCodeFor(value), exit);
  return value;
}
for (const entry of cases) {
  test('interface real CLI receipt: ' + entry.id, () => {
    const input = entry.input_file ? fs.readFileSync(path.join(root, entry.input_file)) : (entry.input_text || '');
    const value = receipt(run(entry.args, input), entry.expected_exit);
    assert.equal(value.status, entry.expected_status); assert.equal(value.valid, entry.expected_valid);
    if (entry.error_includes) assert.ok(value.errors.some((error) => error.includes(entry.error_includes)));
  });
}
test('Node library lists nine precise wire versions and freezes canonical schemas', () => {
  const list = api.listContracts();
  assert.equal(list.length, 9);
  assert.ok(list.every((entry) => entry.schema_version.startsWith('ssr.') && entry.schema_version.endsWith('.v1')));
  const schema = api.getContract('chat-event.schema.json');
  assert.throws(() => { schema.properties.text.minLength = 0; }, TypeError);
  assert.equal(api.getContract('../contracts_v1.0.1.json'), undefined);
});
test('Node library and CLI produce identical packets without mutating synthetic original', () => {
  const text = fs.readFileSync(path.join(root, 'examples/chat-event.example.json'), 'utf8');
  const value = JSON.parse(text); const before = JSON.stringify(value);
  const fromValue = api.validateContract(value, 'chat-event.schema.json');
  assert.deepEqual(api.validateContractText(text, 'chat-event.schema.json'), fromValue);
  assert.deepEqual(receipt(run(['--schema', 'chat-event.schema.json', '--stdin'], text), 0), fromValue);
  assert.equal(JSON.stringify(value), before);
});
test('repeat submissions produce identical packets with no storage/revision side effect', () => {
  const text = fs.readFileSync(path.join(root, 'examples/chat-event.example.json'), 'utf8');
  const first = run(['--schema', 'chat-event.schema.json'], text);
  const second = run(['--schema', 'chat-event.schema.json'], text);
  assert.equal(first.stdout, second.stdout); receipt(first, 0); receipt(second, 0);
});
test('CLI rejects invalid UTF-8 rather than silently replacing original bytes', () => {
  const invalid = Buffer.from([0x7b, 0x22, 0x78, 0x22, 0x3a, 0x22, 0xc3, 0x28, 0x22, 0x7d]);
  const result = receipt(run(['--schema', 'chat-event.schema.json'], invalid), 2);
  assert.match(result.errors[0], /UTF-8/);
});
test('CLI bounds its input, including multibyte content', () => {
  const input = JSON.stringify({ text: '測'.repeat(90000) });
  const result = receipt(run(['--schema', 'chat-event.schema.json'], input), 2);
  assert.match(result.errors[0], /256 KiB/);
});
test('CLI reports missing file without exposing the full local environment', () => {
  const result = receipt(run(['--schema', 'chat-event.schema.json', '--input', 'interfaces/no-such-input.synthetic.json']), 2);
  assert.match(result.errors[0], /ENOENT/); assert.ok(!result.errors[0].includes(root));
});
test('CLI returns a real exit-3 receipt for missing contracts in a fresh isolated copy', (t) => {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ssr-data-contracts-interface-'));
  const toolsDir = path.join(sandbox, 'tools');
  const names = ['validate_contract.mjs', 'contracts-api.mjs', 'contract-validator.js'];
  try {
    fs.mkdirSync(toolsDir);
    for (const name of names) {
      const source = path.join(root, 'tools', name), target = path.join(toolsDir, name);
      fs.copyFileSync(source, target);
      assert.deepEqual(fs.readFileSync(target), fs.readFileSync(source), 'isolated execution must use identical code bytes');
    }
    const actual = spawnSync(process.execPath, [path.join(toolsDir, 'validate_contract.mjs'), '--schema', 'chat-event.schema.json'],
      { cwd: sandbox, input: '{}', encoding: 'utf8', env: childEnv, windowsHide: true, timeout: 10000 });
    const packet = receipt(actual, 3);
    assert.equal(packet.status, 'error');
    t.diagnostic('actual isolated CLI receipt: ' + JSON.stringify(packet));
  } finally {
    for (const name of names) {
      const target = path.join(toolsDir, name);
      if (fs.existsSync(target)) fs.unlinkSync(target);
    }
    if (fs.existsSync(toolsDir)) fs.rmdirSync(toolsDir);
    fs.rmdirSync(sandbox);
  }
});
for (const args of [
  [], ['--schema'], ['--schema', 'chat-event.schema.json', '--unexpected'],
  ['--schema', 'chat-event.schema.json', '--schema', 'chat-event.schema.json'],
  ['--schema', 'chat-event.schema.json', '--stdin', '--input', 'examples/chat-event.example.json'],
]) {
  test('CLI argument rejection: ' + JSON.stringify(args), () => {
    assert.equal(receipt(run(args, '{}'), 2).status, 'usage_error');
  });
}
test('CLI help is read-only and available without a server', () => {
  const result = run(['--help']); assert.equal(result.status, 0); assert.equal(result.stderr, '');
  assert.match(result.stdout, /Usage:/); assert.match(result.stdout, /chat-event.schema.json/);
});
test('empty result and invalid ingest are not confused with malformed contracts', () => {
  const empty = read('examples/query-result.example.json');
  empty.status = 'no_match'; empty.materials = []; empty.sources = [];
  assert.equal(api.validateContract(empty, 'query-result.schema.json').valid, true);
  const invalidIngest = read('examples/ingest-attempt.example.json');
  assert.equal(invalidIngest.validation.status, 'invalid');
  assert.equal(api.validateContract(invalidIngest, 'ingest-attempt.schema.json').status, 'valid');
  const context = read('examples/context-snapshot.example.json'); context.messages = [];
  assert.equal(api.validateContract(context, 'context-snapshot.schema.json').valid, true);
});
test('calendar/shape regressions are rejected and valid leap day/timezone preserved', () => {
  const value = read('examples/chat-event.example.json');
  for (const time of ['2026-02-30T09:31:00Z', '2026-04-31T09:31:00Z', '2026Z', '1900-02-29T00:00:00Z', '2026-01-01T24:00:00Z']) {
    const result = api.validateContract({ ...value, occurred_at: time }, 'chat-event.schema.json');
    assert.equal(result.status, 'invalid', time); assert.ok(result.errors.some((error) => error.includes('date-time')));
  }
  for (const time of ['2000-02-29T00:00:00Z', '2024-02-29T23:59:59.123+08:00']) {
    const input = { ...value, occurred_at: time }; const before = JSON.stringify(input);
    assert.equal(api.validateContract(input, 'chat-event.schema.json').status, 'valid', time);
    assert.equal(JSON.stringify(input), before);
  }
});
test('unsupported schema types/formats and null schema fail closed', () => {
  for (const custom of [{ type: ['string', 'null'] }, { type: 'null' }, { type: 'string', format: 'email' }, null]) {
    assert.equal(core.validate('x', 'custom', { custom }).valid, false);
  }
});
test('native Record/ACL fields are not silently added to legacy wire schema', () => {
  const value = read('examples/chat-event.example.json');
  value.access_scope = { read_scopes: [], write_scopes: [] };
  assert.equal(api.validateContract(value, 'chat-event.schema.json').status, 'invalid');
});
test('all executable source files participate in the version fingerprint', () => {
  for (const folder of ['tools', 'tests']) {
    for (const name of fs.readdirSync(path.join(root, folder)).filter((name) => /\.(?:mjs|js)$/.test(name))) {
      assert.ok(sourceNames.includes(folder + '/' + name), 'unbound source: ' + folder + '/' + name);
    }
  }
});
