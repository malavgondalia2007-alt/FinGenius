const fs = require('fs');
const ts = fs.readFileSync('c:/Users/Hp/OneDrive/Desktop/FinGenius/src/services/liveMarketData.ts', 'utf8');
const py = fs.readFileSync('c:/Users/Hp/OneDrive/Desktop/FinGenius/src/backend/app/api/stocks.py', 'utf8');
let tS = new Set([...ts.matchAll(/symbol: '([^']+)'/g)].map(m => m[1]));
let pS = new Set([...py.matchAll(/"([^"]+)":\s*\{"name"/g)].map(m => m[1]));
console.log('TS Config Size:', tS.size, 'PY Backend Size:', pS.size);
console.log('In TS not PY:', [...tS].filter(x => !pS.has(x)));
console.log('In PY not TS:', [...pS].filter(x => !tS.has(x)));
