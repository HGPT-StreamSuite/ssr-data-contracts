import fs from 'node:fs';
import { TextDecoder } from 'node:util';
import * as contracts from './contracts-api.mjs';

const args = process.argv.slice(2);
let schemaName = '';
let inputPath;
let stdin = false;
function print(result) {
  process.stdout.write(JSON.stringify(result) + '\n');
  process.exitCode = contracts.exitCodeFor(result);
}
function boundedRead(fd) {
  const chunks = [];
  let total = 0;
  while (true) {
    const chunk = Buffer.alloc(Math.min(8192, contracts.MAX_INPUT_BYTES + 1 - total));
    const count = fs.readSync(fd, chunk, 0, chunk.length, null);
    if (!count) break;
    chunks.push(chunk.subarray(0, count));
    total += count;
    if (total > contracts.MAX_INPUT_BYTES) return null;
  }
  return Buffer.concat(chunks, total);
}
function main() {
  if (args.length === 1 && args[0] === '--help') {
    process.stdout.write('Usage: node tools/validate_contract.mjs --schema <name.schema.json> [--stdin | --input <UTF-8-file>]\n' +
      'Default input: stdin. stdout: one ssr.contract-validation-result.v1 JSON object.\n' +
      'Exit: 0 valid; 1 contract rejection; 2 input/usage error; 3 internal error.\n' +
      contracts.listContracts().map((entry) => entry.schema_name).join('\n') + '\n');
    return;
  }
  const seen = new Set();
  for (let index = 0; index < args.length; index++) {
    const flag = args[index];
    if (!['--schema', '--input', '--stdin'].includes(flag) || seen.has(flag)) {
      print(contracts.makeResult('', 'usage_error', ['未知或重複的命令參數；請使用 --help。'])); return;
    }
    seen.add(flag);
    if (flag === '--stdin') { stdin = true; continue; }
    const value = args[++index];
    if (!value || value.startsWith('--')) {
      print(contracts.makeResult('', 'usage_error', ['命令參數缺少值；請使用 --help。'])); return;
    }
    if (flag === '--schema') schemaName = value;
    else inputPath = value;
  }
  if (!schemaName || !contracts.getContract(schemaName) || (stdin && inputPath !== undefined)) {
    print(contracts.makeResult('', 'usage_error', ['請指定本 repo 的 --schema；--stdin 與 --input 不可同時使用。'])); return;
  }
  let bytes;
  let fd;
  try {
    if (inputPath !== undefined) {
      fd = fs.openSync(inputPath, 'r');
      if (!fs.fstatSync(fd).isFile()) throw Object.assign(new Error('regular file required'), { code: 'NOT_REGULAR_FILE' });
      bytes = boundedRead(fd);
    } else bytes = boundedRead(0);
  } catch (error) {
    print(contracts.makeResult(schemaName, 'input_error', ['無法讀取指定輸入 (' + (error.code || 'IO_ERROR') + ')。'])); return;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
  if (bytes === null) {
    print(contracts.makeResult(schemaName, 'input_error', ['輸入超過 256 KiB UTF-8 限制。'])); return;
  }
  let text;
  try { text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes); }
  catch { print(contracts.makeResult(schemaName, 'input_error', ['輸入必須是有效 UTF-8。'])); return; }
  print(contracts.validateContractText(text, schemaName));
}
try { main(); }
catch {
  print(contracts.makeResult('', 'error', ['無法載入契約或完成驗證；請核對本 repo 來源。']));
}
