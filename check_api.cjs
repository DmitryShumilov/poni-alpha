const http = require('http');

http.get('http://localhost:5000/api/data?limit=10000', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const records = json.records;
    
    // Проверка данных
    console.log('=== Проверка данных API ===');
    console.log('Всего записей:', records.length);
    
    // Проверка полей у первой записи
    console.log('\nПервая запись:');
    console.log(JSON.stringify(records[0], null, 2));
    
    // Проверка year и amount
    const withYear = records.filter(r => r.year !== null && r.year !== undefined);
    const withoutYear = records.filter(r => r.year === null || r.year === undefined);
    console.log('\nЗаписей с year:', withYear.length);
    console.log('Записей без year:', withoutYear.length);
    
    // Сумма по годам
    const byYear = {};
    records.forEach(r => {
      if (!byYear[r.year]) byYear[r.year] = 0;
      byYear[r.year] += r.amount;
    });
    
    console.log('\n=== Суммы по годам ===');
    Object.entries(byYear).sort().forEach(([y, s]) => {
      console.log(`${y}: ${s.toLocaleString('ru-RU', {style: 'currency', currency: 'RUB'})}`);
    });
    
    // Проверка amount
    const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);
    console.log('\nОбщая сумма:', totalAmount.toLocaleString('ru-RU', {style: 'currency', currency: 'RUB'}));
  });
});
