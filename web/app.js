(function () {
  'use strict';
  const data = window.SSRContractData;
  const validator = window.SSRContractValidator;
  const byId = function (id) { return document.getElementById(id); };
  if (!data || !validator) { byId('startup-error').hidden = false; return; }
  const schemaSelect = byId('schema');
  const exampleSelect = byId('example');
  const input = byId('payload');
  const state = { busy: false, token: 0, results: [], cleared: null };
  function node(tag, text, className) {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  }
  function setStatus(kind, title, detail) {
    byId('result-state').className = 'result-state ' + kind;
    byId('status-title').textContent = title;
    byId('status-detail').textContent = detail;
    byId('status-symbol').textContent = ({ pass: '✓', fail: '!', running: '…', canceled: 'Ⅱ', idle: '—' })[kind];
  }
  function output(value) { byId('output').textContent = JSON.stringify(value, null, 2); }
  function controls() {
    byId('validate').disabled = state.busy;
    byId('run-all').disabled = state.busy;
    byId('cancel').disabled = !state.busy;
  }
  function schemaPreview() { byId('schema-preview').textContent = JSON.stringify(data.schemas[schemaSelect.value], null, 2); }
  function countBytes() { byId('byte-count').textContent = new TextEncoder().encode(input.value).length.toLocaleString() + ' B / 256 KiB'; }
  function invalidate() {
    if (state.busy) {
      byId('batch-progress').textContent = '已停止 · 輸入已更新；先前批次只完成 ' + state.results.length + ' / ' + data.examples.length + ' 組。';
    }
    state.token++;
    state.busy = false;
    controls();
    byId('errors').replaceChildren();
    byId('errors').hidden = true;
    setStatus('idle', '尚未驗證 · 輸入已更新', '請重新執行驗證；先前結果不適用目前輸入。');
    output({ status: 'not_run', reason: 'input_changed' });
    countBytes();
  }
  function loadExample() {
    const sample = data.examples.find(function (entry) { return entry.name === exampleSelect.value; });
    schemaSelect.value = sample.schema;
    input.value = JSON.stringify(sample.value, null, 2);
    state.cleared = null;
    byId('undo').disabled = true;
    schemaPreview();
    invalidate();
  }
  function validateInput() {
    if (state.busy) return;
    const result = validator.parseAndValidate(input.value, schemaSelect.value, data.schemas);
    const errors = byId('errors');
    errors.replaceChildren();
    result.errors.forEach(function (error) { errors.append(node('li', error)); });
    errors.hidden = result.valid;
    setStatus(result.valid ? 'pass' : 'fail', result.valid ? '通過本契約檢查' : '未通過驗證',
      result.valid ? '結構與既有語意規則一致；不代表內容或來源真實。' : result.errors.length + ' 項錯誤；請依 JSON 路徑修正後重試。');
    output({ operation: 'validate', schema: schemaSelect.value, valid: result.valid, errors: result.errors });
  }
  function renderBatch(status) {
    const passed = state.results.filter(function (result) { return result.valid; }).length;
    byId('batch-progress').textContent = (status === 'canceled' ? '已取消 · ' : '') +
      state.results.length + ' / ' + data.examples.length + ' 已完成，' + passed + ' 通過。';
    const list = byId('batch-results');
    list.replaceChildren();
    state.results.forEach(function (result) { list.append(node('li', (result.valid ? '✓ ' : '! ') + result.example, result.valid ? '' : 'failed')); });
    output({ operation: 'examples', status: status, completed: state.results.length, total: data.examples.length, results: state.results });
    if (status === 'canceled') setStatus('canceled', '批次已取消', '僅保留已完成案例；本次沒有全數通過結論。');
    else if (status === 'running') setStatus('running', '正在驗證內建範例', state.results.length + ' / ' + data.examples.length + ' 已完成。');
    else setStatus(status === 'pass' ? 'pass' : 'fail', status === 'pass' ? '14 組範例全部通過' : '批次有未通過項目', '本次重新計算的結果，未使用已保存紀錄。');
  }
  async function runAll() {
    if (state.busy) return;
    const token = ++state.token;
    state.busy = true;
    state.results = [];
    byId('errors').replaceChildren();
    byId('errors').hidden = true;
    controls();
    renderBatch('running');
    for (const sample of data.examples) {
      await new Promise(function (resolve) { window.requestAnimationFrame(resolve); });
      if (token !== state.token) return;
      const result = validator.validate(sample.value, sample.schema, data.schemas);
      state.results.push({ example: sample.name, schema: sample.schema, valid: result.valid, errors: result.errors });
      renderBatch('running');
    }
    state.busy = false;
    controls();
    renderBatch(state.results.every(function (result) { return result.valid; }) ? 'pass' : 'fail');
  }
  function showView(name) {
    document.querySelectorAll('[data-view]').forEach(function (button) {
      const selected = button.dataset.view === name;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      byId('view-' + button.dataset.view).hidden = !selected;
    });
  }
  Object.keys(data.schemas).forEach(function (name) {
    const option = node('option', name.replace('.schema.json', ''));
    option.value = name;
    schemaSelect.append(option);
  });
  data.examples.forEach(function (sample) {
    const option = node('option', sample.name);
    option.value = sample.name;
    exampleSelect.append(option);
  });
  exampleSelect.value = 'chat-event.example.json';
  byId('load-example').addEventListener('click', loadExample);
  byId('validate').addEventListener('click', validateInput);
  byId('run-all').addEventListener('click', runAll);
  byId('cancel').addEventListener('click', function () {
    if (!state.busy) return;
    state.token++;
    state.busy = false;
    controls();
    renderBatch('canceled');
  });
  input.addEventListener('input', invalidate);
  schemaSelect.addEventListener('change', function () { schemaPreview(); invalidate(); });
  byId('clear').addEventListener('click', function () {
    if (input.value) state.cleared = input.value;
    input.value = '';
    byId('undo').disabled = state.cleared === null;
    invalidate();
  });
  byId('undo').addEventListener('click', function () {
    if (state.cleared === null) return;
    input.value = state.cleared;
    state.cleared = null;
    byId('undo').disabled = true;
    invalidate();
  });
  const tabs = Array.from(document.querySelectorAll('[data-view]'));
  tabs.forEach(function (button, index) {
    button.addEventListener('click', function () { showView(button.dataset.view); });
    button.addEventListener('keydown', function (event) {
      let target = null;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') target = (index + 1) % tabs.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') target = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = tabs.length - 1;
      if (target !== null) { event.preventDefault(); showView(tabs[target].dataset.view); tabs[target].focus(); }
    });
  });
  document.querySelectorAll('[data-return]').forEach(function (button) {
    button.addEventListener('click', function () { showView('workbench'); byId('tab-workbench').focus(); });
  });
  byId('common-status').textContent = data.commonAcceptance.message;
  data.functionalCases.forEach(function (criterion) {
    const card = node('article', undefined, 'criterion');
    const title = node('h3');
    title.append(node('span', criterion.id), node('strong', criterion.title));
    card.append(title, node('p', '合成輸入：' + criterion.input), node('p', '本測例預期：' + criterion.expected));
    byId('criteria-list').append(card);
  });
  const evidence = data.evidence;
  const saved = byId('saved-summary');
  if (!evidence) saved.append(node('p', '尚無保存的 Node 驗收紀錄。執行 node tools/record_acceptance.mjs 後重開此頁。'));
  else {
    const same = evidence.source.fingerprint === data.source.fingerprint;
    byId('saved-status').textContent = !same ? '紀錄已過期' :
      evidence.status === 'functional_tests_pass' ? '功能測試：通過' :
      evidence.status === 'functional_tests_fail' ? '功能測試：失敗' : '歷史功能紀錄';
    saved.append(node('p', '時間：' + evidence.finishedAt), node('p', '分支：' + evidence.version.branch),
      node('p', 'HEAD：' + evidence.version.head), node('p', '工作樹：未提交內容亦包含於來源指紋'),
      node('p', same ? '此功能紀錄與內嵌來源指紋一致。' : '來源已不同，請重新執行功能測試。'),
      node('p', '共通網頁驗收：受阻／未驗證。功能測試通過不能替代預設瀏覽器實際操作。'));
    evidence.runs.forEach(function (run) {
      const details = node('details', undefined, 'saved-run');
      details.append(node('summary', 'exit ' + run.exitCode + ' / 預期 ' + (run.expectedExit === undefined ? '未記錄' : run.expectedExit) + ' · node ' + run.args.join(' ')),
        node('code', 'node ' + run.args.join(' ')), node('pre', 'stdout\n' + run.stdout + '\nstderr\n' + (run.stderr || '（空）')));
      byId('saved-runs').append(details);
    });
  }
  const ui = data.uiEvidence;
  const uiSummary = byId('ui-summary');
  if (!ui) uiSummary.append(node('p', '尚未保存瀏覽器實際操作紀錄。Node 測試不能代替桌面、窄視窗與鍵盤的實際 UI 驗證。'));
  else {
    const same = ui.sourceFingerprint === data.source.fingerprint;
    uiSummary.append(node('p', ui.status === 'blocked' ? '瀏覽器驗證受阻；目前版本 UI 未驗證。' :
      same ? '瀏覽器紀錄：' + ui.status : '瀏覽器紀錄已過期，不能視為本版通過。'),
      node('p', '時間：' + ui.observedAt));
    (ui.checks || []).forEach(function (check) { uiSummary.append(node('p', check.status + ' · ' + check.name + '：' + check.actual)); });
    if (ui.blocker) uiSummary.append(node('p', '限制：' + ui.blocker));
  }
  byId('source-fingerprint').textContent = 'SHA-256 ' + data.source.fingerprint;
  byId('source-files').textContent = JSON.stringify(data.source.files, null, 2);
  schemaSelect.value = 'chat-event.schema.json';
  schemaPreview();
  countBytes();
})();
