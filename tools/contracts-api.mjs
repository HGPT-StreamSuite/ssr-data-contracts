import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import core from './contract-validator.js';

export const CONTRACT_SET = 'v0.1';
export const RESULT_VERSION = 'ssr.contract-validation-result.v1';
export const MAX_INPUT_BYTES = core.MAX_INPUT_BYTES;
export const EXIT_CODES = Object.freeze({ valid: 0, invalid: 1, input_error: 2, usage_error: 2, error: 3 });
const contractDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../contracts/v0.1');
let registry;
function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
function schemas() {
  if (!registry) {
    registry = freeze(Object.fromEntries(fs.readdirSync(contractDir).filter((name) => name.endsWith('.schema.json')).sort()
      .map((name) => [name, JSON.parse(fs.readFileSync(path.join(contractDir, name), 'utf8'))])));
  }
  return registry;
}
export function getContract(schemaName) {
  const all = schemas();
  return Object.hasOwn(all, schemaName) ? all[schemaName] : undefined;
}
export function listContracts() {
  return Object.entries(schemas()).map(([name, schema]) => ({
    schema_name: name, schema_version: schema.properties.schema_version.const, title: schema.title,
  }));
}
export function makeResult(schemaName, status, errors = []) {
  if (!Object.hasOwn(EXIT_CODES, status)) throw new TypeError('Unknown validation status');
  const contract = schemaName ? getContract(schemaName) : undefined;
  return {
    schema_version: RESULT_VERSION, contract_set: CONTRACT_SET,
    schema_name: contract ? schemaName : '',
    contract_schema_version: contract ? contract.properties.schema_version.const : '',
    status, valid: status === 'valid', errors: [...errors],
  };
}
export function validateContract(value, schemaName) {
  if (!getContract(schemaName)) return makeResult('', 'usage_error', ['未知 schema；只接受本 repo 的 schema 檔名。']);
  const result = core.validate(value, schemaName, schemas());
  return makeResult(schemaName, result.valid ? 'valid' : 'invalid', result.errors);
}
export function validateContractText(text, schemaName) {
  if (!getContract(schemaName)) return makeResult('', 'usage_error', ['未知 schema；只接受本 repo 的 schema 檔名。']);
  if (typeof text !== 'string' || !text.trim()) return makeResult(schemaName, 'input_error', ['請輸入合成 JSON。']);
  if (Buffer.byteLength(text, 'utf8') > MAX_INPUT_BYTES) return makeResult(schemaName, 'input_error', ['輸入超過 256 KiB UTF-8 限制。']);
  let value;
  try { value = JSON.parse(text); }
  catch { return makeResult(schemaName, 'input_error', ['JSON 解析失敗。']); }
  return validateContract(value, schemaName);
}
export function exitCodeFor(result) {
  return Object.hasOwn(EXIT_CODES, result.status) ? EXIT_CODES[result.status] : EXIT_CODES.error;
}
