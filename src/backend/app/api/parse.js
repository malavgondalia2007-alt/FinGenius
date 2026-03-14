const fs = require('fs');
const content = fs.readFileSync('c:/Users/Hp/OneDrive/Desktop/FinGenius/src/services/liveMarketData.ts', 'utf8');
const match = content.match(/const STOCK_CONFIG = \[([\s\S]*?)\n\];/);
if (match) {
    let arrStr = '[' + match[1] + ']';
    const arr = eval(arrStr);
    let pyStr = 'TRACKED_STOCKS: Dict[str, Dict[str, Any]] = {\n';
    arr.forEach(i => { pyStr += `    "${i.symbol}": {"name": "${i.name}", "marketCap": "${i.marketCap || ''}", "pe": ${i.pe || 'None'}},\n` });
    pyStr += '}\n';
    fs.writeFileSync('c:/Users/Hp/OneDrive/Desktop/FinGenius/src/backend/app/api/stocks_dict.py', pyStr);
}
