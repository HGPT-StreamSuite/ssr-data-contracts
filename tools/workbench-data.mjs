import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import validator from './contract-validator.js';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
export const sourceNames = [
  'README.md', 'docs/ACCEPTANCE.md', 'docs/INTERFACES.md', 'docs/functional-cases.json', 'docs/common-acceptance-status.json',
  'tools/contract-validator.js', 'tools/validate_examples.mjs', 'tools/workbench-data.mjs',
  'tools/build_workbench.mjs', 'tools/record_acceptance.mjs', 'tools/contracts-api.mjs', 'tools/validate_contract.mjs',
  'tests/contract-validator.test.mjs', 'tests/workbench.test.mjs', 'tests/interfaces.test.mjs',
  'interfaces/validation-result.schema.json', 'interfaces/validation-cases.json', 'interfaces/audit.json',
  'web/index.html', 'web/styles.css', 'web/app.js',
  ...fs.readdirSync(path.join(root, 'contracts/v0.1')).filter((name) => name.endsWith('.json')).map((name) => 'contracts/v0.1/' + name),
  ...fs.readdirSync(path.join(root, 'examples')).filter((name) => name.endsWith('.json')).map((name) => 'examples/' + name),
].sort();
export function sourceSnapshot() {
  const files = Object.fromEntries(sourceNames.map((name) =>
    [name, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, name))).digest('hex')]));
  const fingerprint = crypto.createHash('sha256')
    .update(Object.entries(files).map(([name, hash]) => name + ' ' + hash + '\n').join('')).digest('hex');
  return { fingerprint, files };
}
export function makeData() {
  const schemas = Object.fromEntries(fs.readdirSync(path.join(root, 'contracts/v0.1'))
    .filter((name) => name.endsWith('.schema.json')).sort()
    .map((name) => [name, readJson('contracts/v0.1/' + name)]));
  const examples = validator.exampleMappings.map(([name, schema]) => ({
    name, schema, value: readJson('examples/' + name),
  }));
  const evidencePath = path.join(root, 'docs/acceptance/latest.json');
  const uiPath = path.join(root, 'docs/acceptance/ui.json');
  return { schemas, examples, functionalCases: readJson('docs/functional-cases.json'),
    commonAcceptance: readJson('docs/common-acceptance-status.json'),
    source: sourceSnapshot(),
    evidence: fs.existsSync(evidencePath) ? readJson('docs/acceptance/latest.json') : null,
    uiEvidence: fs.existsSync(uiPath) ? readJson('docs/acceptance/ui.json') : null };
}
export function bundleText() {
  return '// Generated from this repo; node tools/build_workbench.mjs\n' +
    'window.SSRContractData = ' + JSON.stringify(makeData(), null, 2).replaceAll('<', '\\u003c') + ';\n';
}
