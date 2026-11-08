import fs from 'node:fs';
import path from 'node:path';
import { root, bundleText } from './workbench-data.mjs';

const target = path.join(root, 'web/data.js');
const expected = bundleText();
if (process.argv.includes('--check')) {
  if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== expected) {
    console.error('FAIL web/data.js 已過期；請執行 node tools/build_workbench.mjs');
    process.exitCode = 1;
  } else console.log('PASS web/data.js 與來源、合成範例及已保存證據一致。');
} else {
  fs.writeFileSync(target, expected, 'utf8');
  console.log('Built web/data.js（只有本 repo 的 schema、合成範例與安全摘要）。');
}
