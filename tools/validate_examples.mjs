import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contractDir = path.join(root, 'contracts', 'v0.1');
const examplesDir = path.join(root, 'examples');
const mappings = new Map([
  ['ingest-attempt.example.json', 'ingest-attempt.schema.json'],
  ['chat-event.example.json', 'chat-event.schema.json'],
  ['routing-decision.example.json', 'routing-decision.schema.json'],
  ['context-snapshot.example.json', 'context-snapshot.schema.json'],
  ['question-analysis.example.json', 'question-analysis.schema.json'],
  ['query-request.weather.example.json', 'query-request.schema.json'],
  ['query-request.person.example.json', 'query-request.schema.json'],
  ['query-request.game-info.example.json', 'query-request.schema.json'],
  ['query-request.game-guide.example.json', 'query-request.schema.json'],
  ['query-request.game-item.example.json', 'query-request.schema.json'],
  ['query-result.example.json', 'query-result.schema.json'],
  ['query-result.weather.example.json', 'query-result.schema.json'],
  ['answer-prompt-input.example.json', 'answer-prompt-input.schema.json'],
  ['answer-run-record.example.json', 'answer-run-record.schema.json'],
]);

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const errors = [];

function fail(where, message) {
  errors.push(`${where}: ${message}`);
}

function check(value, schema, where, schemaFile) {
  if (schema.$ref) {
    if (schema.$ref.startsWith('#')) {
      fail(where, `目前範例檢查器不支援本地參照 ${schema.$ref}`);
      return;
    }
    const targetFile = path.resolve(path.dirname(schemaFile), schema.$ref);
    let target;
    try {
      target = readJson(targetFile);
    } catch (error) {
      fail(where, `無法讀取 $ref ${schema.$ref}: ${error.message}`);
      return;
    }
    check(value, target, where, targetFile);
    return;
  }

  if (schema.const !== undefined && value !== schema.const) {
    fail(where, `預期固定值 ${JSON.stringify(schema.const)}，實際為 ${JSON.stringify(value)}`);
  }
  if (schema.enum && !schema.enum.includes(value)) {
    fail(where, `值 ${JSON.stringify(value)} 不在 enum ${JSON.stringify(schema.enum)} 中`);
  }
  if (schema.type === 'object') {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      fail(where, '預期 object');
      return;
    }
    for (const key of schema.required ?? []) {
      if (!Object.hasOwn(value, key)) fail(where, `缺少必填欄位 ${key}`);
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.hasOwn(schema.properties ?? {}, key)) fail(where, `不允許額外欄位 ${key}`);
      }
    }
    for (const [key, childSchema] of Object.entries(schema.properties ?? {})) {
      if (Object.hasOwn(value, key)) check(value[key], childSchema, `${where}.${key}`, schemaFile);
    }
  } else if (schema.type === 'array') {
    if (!Array.isArray(value)) {
      fail(where, '預期 array');
      return;
    }
    if (schema.minItems !== undefined && value.length < schema.minItems) fail(where, `至少需要 ${schema.minItems} 個項目`);
    if (schema.items) value.forEach((item, index) => check(item, schema.items, `${where}[${index}]`, schemaFile));
  } else if (schema.type === 'string') {
    if (typeof value !== 'string') {
      fail(where, '預期 string');
      return;
    }
    if (schema.minLength !== undefined && value.length < schema.minLength) fail(where, `字串長度至少為 ${schema.minLength}`);
    if (schema.format === 'date-time') {
      const hasZone = /(?:Z|[+-]\d{2}:\d{2})$/.test(value);
      if (!hasZone || !Number.isFinite(Date.parse(value))) fail(where, '預期含時區的有效 date-time');
    }
  } else if (schema.type === 'integer' && !Number.isInteger(value)) {
    fail(where, '預期 integer');
  } else if (schema.type === 'number' && (typeof value !== 'number' || !Number.isFinite(value))) {
    fail(where, '預期有限 number');
  } else if (schema.type === 'boolean' && typeof value !== 'boolean') {
    fail(where, '預期 boolean');
  }
}

for (const [exampleName, schemaName] of mappings) {
  const exampleFile = path.join(examplesDir, exampleName);
  const schemaFile = path.join(contractDir, schemaName);
  try {
    const example = readJson(exampleFile);
    const schema = readJson(schemaFile);
    const before = errors.length;
    check(example, schema, exampleName, schemaFile);
    if (errors.length === before) console.log(`OK  ${exampleName} -> ${schemaName}`);

    if (exampleName === 'ingest-attempt.example.json') {
      const normalized = Object.hasOwn(example, 'normalized_event');
      if ((example.validation.status === 'valid') !== normalized) fail(exampleName, 'valid 輸入必須有 normalized_event；invalid 輸入不得有');
      if (normalized && example.normalized_event.ingest_id !== example.ingest_id) fail(exampleName, 'ingest_id 必須一致');
    }
    if (exampleName === 'routing-decision.example.json') {
      const expected = example.disposition === 'triggered' ? 'question_analysis' : 'fixed_sop';
      if (example.next_step !== expected) fail(exampleName, `${example.disposition} 必須路由到 ${expected}`);
      if (example.disposition !== 'invalid' && !example.message_id) fail(exampleName, '有效事件必須包含 message_id');
    }
    if (exampleName === 'answer-prompt-input.example.json') {
      if (example.analysis.context_snapshot_id !== example.context_snapshot.snapshot_id) fail(exampleName, '分析與 Prompt 必須引用同一 snapshot_id');
      if (example.analysis.run_id !== example.run_id || example.analysis.message_id !== example.message_id) fail(exampleName, '分析的 run_id/message_id 必須與 Prompt 一致');
      for (const result of example.query_results) {
        if (result.run_id !== example.run_id || result.message_id !== example.message_id) fail(exampleName, `查詢 ${result.query_id} 的 run_id/message_id 必須與 Prompt 一致`);
      }
    }
    if (exampleName === 'query-result.example.json') {
      const sourceIds = new Set(example.sources.map((source) => source.source_id));
      for (const material of example.materials) {
        for (const sourceId of material.source_ids) if (!sourceIds.has(sourceId)) fail(exampleName, `素材 ${material.material_id} 引用不存在的來源 ${sourceId}`);
      }
    }
    if (exampleName === 'query-result.weather.example.json' && example.status === 'unavailable' && (example.materials.length || example.sources.length)) {
      fail(exampleName, 'unavailable 範例不應聲稱有素材或來源');
    }
  } catch (error) {
    fail(exampleName, error.message);
  }
}

if (errors.length) {
  console.error('\n檢查失敗：');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`\n通過：${mappings.size} 組範例與目前檢查器支援的 schema 子集一致。`);
}
