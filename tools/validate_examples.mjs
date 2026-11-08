import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import validator from './contract-validator.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemas = Object.fromEntries(fs.readdirSync(path.join(root, 'contracts/v0.1'))
  .filter((name) => name.endsWith('.schema.json'))
  .map((name) => [name, JSON.parse(fs.readFileSync(path.join(root, 'contracts/v0.1', name), 'utf8'))]));
const mappedNames = validator.exampleMappings.map(([name]) => name).sort();
const actualNames = fs.readdirSync(path.join(root, 'examples')).filter((name) => name.endsWith('.json')).sort();
const errors = [];
if (JSON.stringify(mappedNames) !== JSON.stringify(actualNames)) errors.push('examples: 實際 JSON 檔案與驗證映射不一致');
if (new Set(validator.exampleMappings.map(([, name]) => name)).size !== Object.keys(schemas).length) {
  errors.push('contracts: 存在未被範例涵蓋的 schema');
}
for (const [exampleName, schemaName] of validator.exampleMappings) {
  try {
    const text = fs.readFileSync(path.join(root, 'examples', exampleName), 'utf8');
    const result = validator.parseAndValidate(text, schemaName, schemas);
    if (result.valid) console.log('OK  ' + exampleName + ' -> ' + schemaName);
    else errors.push(...result.errors.map((error) => exampleName + ': ' + error));
  } catch (error) {
    errors.push(exampleName + ': ' + error.message);
  }
}
if (errors.length) {
  console.error('\n檢查失敗：');
  for (const error of errors) console.error('- ' + error);
  process.exitCode = 1;
} else {
  console.log('\n通過：' + validator.exampleMappings.length + ' 組範例與目前檢查器支援的 schema 子集一致。');
}
