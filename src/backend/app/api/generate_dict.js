const fs = require('fs');
const content = fs.readFileSync('C:/Users/Hp/OneDrive/Desktop/FinGenius/src/backend/app/api/stocks_dict.txt', 'utf8');
const lines = content.split('\n');
let pyDict = 'TRACKED_STOCKS: Dict[str, Dict[str, Any]] = {\n';
let currentName = '', currentCap = '', currentPe = '';
lines.forEach(line => {
    if (line.includes("name: '")) currentName = line.split("'")[1];
    if (line.includes("marketCap: '")) currentCap = line.split("'")[1];
    if (line.includes("pe: ")) currentPe = line.split(": ")[1].trim().replace(',', '');
    if (line.includes("nseSymbol: '")) {
        let sym = line.split("'")[1];
        if (sym && !pyDict.includes('"' + sym + '":')) {
            pyDict += '    "' + sym + '": {"name": "' + currentName + '", "marketCap": "' + currentCap + '", "pe": ' + currentPe + '},\n';
        }
    }
});
pyDict += '}\n';
fs.writeFileSync('C:/Users/Hp/OneDrive/Desktop/FinGenius/src/backend/app/api/stocks_dict.py', pyDict);
