const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'database.xlsx');
const workbook = xlsx.readFile(filePath, { cellDates: true });
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet);

console.log('Total rows:', data.length);

// Проверка года - ищем ключ с "Год" в названии
const yearKey = Object.keys(data[0]).find(k => k.includes('Год') || k.includes('год'));
console.log('Year key:', yearKey);

// Уникальные годы
const years = new Set();
data.forEach((row, idx) => {
  if (idx < 5) {
    console.log(`Row ${idx}: ${yearKey} =`, row[yearKey]);
  }
  
  if (row[yearKey] !== undefined) {
    const year = typeof row[yearKey] === 'object' && row[yearKey].getFullYear 
      ? row[yearKey].getFullYear() 
      : parseInt(row[yearKey]);
    if (!isNaN(year)) years.add(year);
  }
});

console.log('\nУникальные годы:', [...years].sort((a, b) => a - b));
