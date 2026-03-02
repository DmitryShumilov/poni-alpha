const xlsx = require('xlsx');
console.log('XLSX version:', xlsx.version);

const wb = xlsx.readFile('database.xlsx', { 
  cellDates: true,
  cellText: true,
  cellNF: true,
  cellStyles: true
});

console.log('Sheet names:', wb.SheetNames);
const ws = wb.Sheets[wb.SheetNames[0]];

// Получаем диапазон
const range = xlsx.utils.decode_range(ws['!ref']);
console.log('Range:', range);

// Чтение по ячейкам
console.log('\n=== Первые 5 строк, колонка 26 (Год) ===');
for (let r = 1; r <= Math.min(5, range.e.r); r++) {
  const cell = ws[xlsx.utils.encode_cell({r, c: 26})];
  console.log(`Row ${r}:`, cell ? cell.v : 'EMPTY');
}

// Чтение JSON с raw: true
const data = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { raw: false, dateNF: 'yyyy-mm-dd' });
console.log('\n=== JSON data ===');
console.log('Rows:', data.length);
if (data.length > 0) {
  console.log('Keys:', Object.keys(data[0]));
  console.log('First row Год:', data[0]['Год']);
}
