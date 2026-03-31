const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('devuser_knockster_safety.sql');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let inCreate = false;
  let currentTable = '';
  const output = [];

  for await (const line of rl) {
    if (line.toUpperCase().startsWith('CREATE TABLE')) {
      inCreate = true;
      currentTable = line + '\n';
      continue;
    }
    if (inCreate) {
      currentTable += line + '\n';
      if (line.trim().endsWith(';')) {
        inCreate = false;
        output.push(currentTable);
        currentTable = '';
      }
    }
  }
  
  fs.writeFileSync('parsed_tables.txt', output.join('\n'), 'utf8');
}

processLineByLine();
