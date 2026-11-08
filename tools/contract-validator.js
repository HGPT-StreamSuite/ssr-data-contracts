(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SSRContractValidator = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const MAX_INPUT_BYTES = 256 * 1024;
  const MAX_DEPTH = 64;
  const MAX_NODES = 20000;
  const MAX_ERRORS = 50;
  const exampleMappings = [
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
  ].map(function (entry) { return Object.freeze(entry); });
  const keywords = new Set(['$schema', '$ref', 'title', 'description', 'type', 'required',
    'properties', 'additionalProperties', 'const', 'enum', 'items', 'minItems', 'minLength', 'format']);
  const supportedTypes = new Set(['object', 'array', 'string', 'integer', 'number', 'boolean']);
  function validDateTime(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/.exec(value);
    if (!match) return false;
    const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month < 1 || month > 12 || day < 1 || day > days[month - 1]) return false;
    if (Number(match[4]) > 23 || Number(match[5]) > 59 || Number(match[6]) > 59) return false;
    if (match[7] !== 'Z' && (Number(match[7].slice(1, 3)) > 23 || Number(match[7].slice(4)) > 59)) return false;
    return Number.isFinite(Date.parse(value));
  }

  function validate(value, schemaName, schemas) {
    const errors = [];
    function fail(where, message) {
      if (errors.length < MAX_ERRORS) errors.push(where + ': ' + message);
    }
    if (!schemas || !Object.hasOwn(schemas, schemaName)) {
      return { valid: false, errors: ['$: 未知 schema，請選擇本 repo 的契約。'] };
    }
    const pending = [[value, 0]];
    let nodes = 0;
    while (pending.length) {
      const entry = pending.pop();
      if (++nodes > MAX_NODES || entry[1] > MAX_DEPTH) {
        return { valid: false, errors: ['$: 輸入超過 64 層或 20,000 個節點的限制。'] };
      }
      if (entry[0] !== null && typeof entry[0] === 'object') {
        Object.values(entry[0]).forEach(function (child) { pending.push([child, entry[1] + 1]); });
      }
    }
    function check(item, schema, where, depth) {
      if (depth > MAX_DEPTH) { fail(where, 'schema 參照過深'); return; }
      if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
        fail(where, '目前檢查器需要 object schema'); return;
      }
      for (const keyword of Object.keys(schema)) {
        if (!keywords.has(keyword)) fail(where, '目前檢查器不支援 schema 關鍵字 ' + keyword);
      }
      if (schema.type !== undefined && !supportedTypes.has(schema.type)) {
        fail(where, '目前檢查器不支援此 schema type'); return;
      }
      if (schema.format !== undefined && schema.format !== 'date-time') {
        fail(where, '目前檢查器不支援 schema format ' + schema.format); return;
      }
      if (schema.$ref) {
        if (!Object.hasOwn(schemas, schema.$ref)) fail(where, '無法解析本 repo 的 $ref ' + schema.$ref);
        else check(item, schemas[schema.$ref], where, depth + 1);
        return;
      }
      if (Object.hasOwn(schema, 'const') && item !== schema.const) fail(where, '預期固定值 ' + JSON.stringify(schema.const));
      if (schema.enum && !schema.enum.includes(item)) fail(where, '值不在 enum ' + JSON.stringify(schema.enum) + ' 中');
      if (schema.type === 'object') {
        if (item === null || typeof item !== 'object' || Array.isArray(item)) { fail(where, '預期 object'); return; }
        for (const key of schema.required || []) if (!Object.hasOwn(item, key)) fail(where, '缺少必填欄位 ' + key);
        if (schema.additionalProperties === false) {
          for (const key of Object.keys(item)) if (!Object.hasOwn(schema.properties || {}, key)) fail(where, '不允許額外欄位 ' + key);
        }
        for (const pair of Object.entries(schema.properties || {})) {
          if (Object.hasOwn(item, pair[0])) check(item[pair[0]], pair[1], where + '.' + pair[0], depth + 1);
        }
      } else if (schema.type === 'array') {
        if (!Array.isArray(item)) { fail(where, '預期 array'); return; }
        if (schema.minItems !== undefined && item.length < schema.minItems) fail(where, '至少需要 ' + schema.minItems + ' 個項目');
        if (schema.items) item.forEach(function (child, index) { check(child, schema.items, where + '[' + index + ']', depth + 1); });
      } else if (schema.type === 'string') {
        if (typeof item !== 'string') { fail(where, '預期 string'); return; }
        if (schema.minLength !== undefined && Array.from(item).length < schema.minLength) fail(where, '字串長度至少為 ' + schema.minLength);
        if (schema.format === 'date-time' && !validDateTime(item)) {
          fail(where, '預期含時區的有效 date-time');
        }
      } else if (schema.type === 'integer' && !Number.isInteger(item)) fail(where, '預期 integer');
      else if (schema.type === 'number' && (typeof item !== 'number' || !Number.isFinite(item))) fail(where, '預期有限 number');
      else if (schema.type === 'boolean' && typeof item !== 'boolean') fail(where, '預期 boolean');
    }
    check(value, schemas[schemaName], '$', 0);
    if (errors.length) return { valid: false, errors: errors };
    function querySemantics(result, where) {
      const sourceIds = new Set(result.sources.map(function (source) { return source.source_id; }));
      result.materials.forEach(function (material, index) {
        material.source_ids.forEach(function (id) {
          if (!sourceIds.has(id)) fail(where + '.materials[' + index + '].source_ids', '引用不存在的來源 ' + id);
        });
      });
      if (result.query_type === 'weather' && result.status === 'unavailable' && (result.materials.length || result.sources.length)) {
        fail(where, 'unavailable 天氣範例不應聲稱有素材或來源');
      }
    }
    if (schemaName === 'ingest-attempt.schema.json') {
      const normalized = Object.hasOwn(value, 'normalized_event');
      if ((value.validation.status === 'valid') !== normalized) fail('$', 'valid 輸入必須有 normalized_event；invalid 輸入不得有');
      if (normalized && value.normalized_event.ingest_id !== value.ingest_id) fail('$.normalized_event.ingest_id', 'ingest_id 必須一致');
    } else if (schemaName === 'routing-decision.schema.json') {
      const expected = value.disposition === 'triggered' ? 'question_analysis' : 'fixed_sop';
      if (value.next_step !== expected) fail('$.next_step', value.disposition + ' 必須路由到 ' + expected);
      if (value.disposition !== 'invalid' && !value.message_id) fail('$.message_id', '有效事件必須包含 message_id');
    } else if (schemaName === 'query-result.schema.json') querySemantics(value, '$');
    else if (schemaName === 'answer-prompt-input.schema.json') {
      if (value.analysis.context_snapshot_id !== value.context_snapshot.snapshot_id) fail('$.analysis.context_snapshot_id', '分析與 Prompt 必須引用同一 snapshot_id');
      if (value.analysis.run_id !== value.run_id || value.analysis.message_id !== value.message_id) fail('$.analysis', '分析的 run_id/message_id 必須與 Prompt 一致');
      value.query_results.forEach(function (result, index) {
        if (result.run_id !== value.run_id || result.message_id !== value.message_id) fail('$.query_results[' + index + ']', '查詢的 run_id/message_id 必須與 Prompt 一致');
        querySemantics(result, '$.query_results[' + index + ']');
      });
    }
    return { valid: errors.length === 0, errors: errors };
  }
  function parseAndValidate(text, schemaName, schemas) {
    if (typeof text !== 'string' || !text.trim()) return { valid: false, errors: ['$: 請輸入合成 JSON。'] };
    if (new TextEncoder().encode(text).length > MAX_INPUT_BYTES) return { valid: false, errors: ['$: 輸入超過 256 KiB UTF-8 限制。'] };
    let value;
    try { value = JSON.parse(text); }
    catch (error) { return { valid: false, errors: ['$: JSON 解析失敗：' + error.message] }; }
    return validate(value, schemaName, schemas);
  }
  return Object.freeze({ validate: validate, parseAndValidate: parseAndValidate,
    exampleMappings: Object.freeze(exampleMappings), MAX_INPUT_BYTES: MAX_INPUT_BYTES });
});
