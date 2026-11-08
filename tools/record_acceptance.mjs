import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { root, sourceSnapshot, bundleText } from './workbench-data.mjs';
import validator from './contract-validator.js';

const git = process.env.GIT_EXE || (process.platform === 'win32' ? 'C:/Program Files/Git/cmd/git.exe' : 'git');
const gitRead = (...args) => execFileSync(git, ['--no-optional-locks', '-C', root, ...args],
  { encoding: 'utf8', env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } }).trimEnd();
const before = sourceSnapshot();
const beforeState = { head: gitRead('rev-parse', 'HEAD'), branch: gitRead('branch', '--show-current'),
  dirty: gitRead('status', '--porcelain=v1', '--untracked-files=all').split(/\r?\n/).filter(Boolean) };
// Build before testing so bundle assertions cover the exact current code.
fs.writeFileSync(path.join(root, 'web/data.js'), bundleText(), 'utf8');
const commands = [
  { args: ['tools/validate_examples.mjs'], expectedExit: 0 },
  { args: ['--test', 'tests/contract-validator.test.mjs', 'tests/workbench.test.mjs', 'tests/interfaces.test.mjs'], expectedExit: 0 },
  { args: ['tools/build_workbench.mjs', '--check'], expectedExit: 0 },
  ...JSON.parse(fs.readFileSync(path.join(root, 'interfaces/validation-cases.json'), 'utf8'))
    .map((entry) => ({ args: ['tools/validate_contract.mjs', ...entry.args], expectedExit: entry.expected_exit, interfaceCase: entry })),
];
const receiptSchema = JSON.parse(fs.readFileSync(path.join(root, 'interfaces/validation-result.schema.json'), 'utf8'));
function fixtureText(relative) {
  if (!/^examples\/[^/]+\.json$/.test(relative)) throw new Error('Only explicit repo synthetic examples may be recorded');
  return fs.readFileSync(path.join(root, relative), 'utf8');
}
const childEnv = { ...process.env, NODE_DISABLE_COMPILE_CACHE: '1' };
for (const key of ['NODE_OPTIONS', 'NODE_PATH', 'NODE_V8_COVERAGE', 'NODE_COMPILE_CACHE']) delete childEnv[key];
const startedAt = new Date().toISOString();
const runs = commands.map((command) => {
  const args = command.args;
  const entry = command.interfaceCase;
  const fileIndex = args.indexOf('--input');
  const inputFile = entry && (entry.input_file || (fileIndex >= 0 ? args[fileIndex + 1] : undefined));
  const inputText = entry ? (inputFile ? fixtureText(inputFile) : (entry.input_text || '')) : undefined;
  const start = new Date().toISOString();
  const result = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', env: childEnv,
    input: entry && fileIndex < 0 ? inputText : undefined,
    windowsHide: true, timeout: 30000, maxBuffer: 2 * 1024 * 1024 });
  let actualResult = null;
  let receiptMatches = !entry;
  if (entry) {
    try {
      actualResult = JSON.parse(result.stdout);
      receiptMatches = validator.validate(actualResult, 'validation-result.schema.json',
        { 'validation-result.schema.json': receiptSchema }).valid &&
        actualResult.status === entry.expected_status && actualResult.valid === entry.expected_valid &&
        (!entry.error_includes || actualResult.errors.some((error) => error.includes(entry.error_includes))) &&
        result.stderr === '';
    } catch { receiptMatches = false; }
  }
  return { executable: 'node', args, startedAt: start, finishedAt: new Date().toISOString(),
    expectedExit: command.expectedExit,
    caseId: entry ? entry.id : null,
    syntheticInput: entry ? { mode: fileIndex >= 0 ? 'file' : 'stdin', source: inputFile || 'inline synthetic', text: inputText } : null,
    actualResult, receiptMatches,
    matchesExpectations: result.status === command.expectedExit && receiptMatches && !result.error,
    exitCode: result.status, stdout: (result.stdout || '').replaceAll(root, '[repo]').replaceAll(root.replaceAll('\\', '/'), '[repo]'),
    stderr: (result.stderr || '').replaceAll(root, '[repo]').replaceAll(root.replaceAll('\\', '/'), '[repo]'),
    error: result.error ? result.error.message.replaceAll(root, '[repo]') : null };
});
const after = sourceSnapshot();
const afterState = { head: gitRead('rev-parse', 'HEAD'), branch: gitRead('branch', '--show-current'),
  dirty: gitRead('status', '--porcelain=v1', '--untracked-files=all').split(/\r?\n/).filter(Boolean) };
const unchanged = before.fingerprint === after.fingerprint && beforeState.head === afterState.head && beforeState.branch === afterState.branch;
const passed = unchanged && runs.every((run) => run.matchesExpectations);
const evidence = {
  id: 'data-contracts-local-' + startedAt, startedAt, finishedAt: new Date().toISOString(),
  status: passed ? 'functional_tests_pass' : 'functional_tests_fail',
  scope: '本 repo 功能測例；只使用合成資料，不代表共用驗收或真實瀏覽器通過。',
  commonAcceptance: JSON.parse(fs.readFileSync(path.join(root, 'docs/common-acceptance-status.json'), 'utf8')),
  version: afterState, sourceUnchangedDuringTests: unchanged, source: after,
  runtime: { node: process.version, preloadAndCoverage: 'disabled', compileCache: 'disabled' },
  inputs: validator.exampleMappings.map(([example, schema]) => ({ example: 'examples/' + example, schema: 'contracts/v0.1/' + schema })),
  syntheticBoundaryCases: 'tests/contract-validator.test.mjs；UI 狀態：tests/workbench.test.mjs；真實 CLI/library：tests/interfaces.test.mjs',
  interfaceCases: 'interfaces/validation-cases.json',
  interfaceResultSchema: 'interfaces/validation-result.schema.json',
  priorFailureEvidence: 'docs/acceptance/pre-fix-datetime.json',
  runs, uiStatus: '瀏覽器實際操作另見 ui.json；沒有該紀錄時為未驗證。',
  notRun: ['完整 Draft 2020-12 meta-schema', '完整 RFC 3339', '跨 repo adapter／真實平台／來源真實性'],
};
fs.mkdirSync(path.join(root, 'docs/acceptance'), { recursive: true });
const archiveDir = path.join(root, 'docs/acceptance/runs');
fs.mkdirSync(archiveDir, { recursive: true });
const latestPath = path.join(root, 'docs/acceptance/latest.json');
if (fs.existsSync(latestPath)) {
  const previousText = fs.readFileSync(latestPath, 'utf8');
  const previous = JSON.parse(previousText);
  const previousPath = path.join(archiveDir, previous.id.replace(/[^a-zA-Z0-9._-]/g, '_') + '.json');
  if (!fs.existsSync(previousPath)) fs.writeFileSync(previousPath, previousText, 'utf8');
}
const archivePath = path.join(archiveDir, evidence.id.replace(/[^a-zA-Z0-9._-]/g, '_') + '.json');
fs.writeFileSync(archivePath, JSON.stringify(evidence, null, 2) + '\n', { encoding: 'utf8', flag: 'wx' });
fs.writeFileSync(path.join(root, 'docs/acceptance/latest.json'), JSON.stringify(evidence, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.join(root, 'web/data.js'), bundleText(), 'utf8');
console.log(JSON.stringify({ status: evidence.status, head: afterState.head, branch: afterState.branch,
  sourceFingerprint: after.fingerprint, sourceUnchangedDuringTests: unchanged,
  runs: runs.map((run) => ({ args: run.args, expectedExit: run.expectedExit, exitCode: run.exitCode, matchesExpectations: run.matchesExpectations, error: run.error })),
  evidence: 'docs/acceptance/latest.json' }, null, 2));
if (!passed) process.exitCode = 1;
