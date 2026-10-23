// Portable test runner (no shell globbing needed on Windows or old Node versions).
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const dir = path.join(__dirname, '..', 'server', 'tests');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.test.js')).map(f => path.join(dir, f));
process.exit(spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' }).status || 0);
