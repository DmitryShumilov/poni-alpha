const http = require('http');

http.get('http://localhost:5000/api/data?limit=10000', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const records = json.records;
    
    // Фильтрация как на frontend
    const selectedYears = [2024];
    
    const filtered = records.filter(item => {
      if (selectedYears.length && (item.year === null || item.year === undefined || !selectedYears.includes(item.year))) {
        return false;
      }
      return true;
    });
    
    console.log('=== Фильтрация по 2024 году ===');
    console.log('Всего записей:', records.length);
    console.log('Отфильтровано записей:', filtered.length);
    
    // Проверка типов
    console.log('\n=== Проверка типов ===');
    console.log('selectedYears[0]:', selectedYears[0], typeof selectedYears[0]);
    console.log('item.year (первый):', records[0].year, typeof records[0].year);
    console.log('includes(2024):', selectedYears.includes(2024));
    console.log('includes("2024"):', selectedYears.includes("2024"));
    
    // Сумма за 2024
    const sum2024 = filtered.reduce((sum, r) => sum + r.amount, 0);
    console.log('\nСумма за 2024:', sum2024.toLocaleString('ru-RU', {style: 'currency', currency: 'RUB'}));
    
    // Проверим, есть ли записи где year !== 2024
    const not2024 = records.filter(r => r.year !== 2024);
    console.log('\nЗаписей не за 2024:', not2024.length);
    
    // Проверим уникальные year
    const uniqueYears = [...new Set(records.map(r => r.year))];
    console.log('Уникальные годы:', uniqueYears.sort());
  });
});
