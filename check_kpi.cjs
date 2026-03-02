const http = require('http');

http.get('http://localhost:5000/api/data?limit=10000', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    
    // Проверка структуры ответа
    console.log('=== Структура ответа ===');
    console.log('Есть records:', 'records' in json);
    console.log('Есть meta:', 'meta' in json);
    console.log('records.length:', json.records?.length);
    
    // Как frontend должен читать данные
    const records = json.records || json;
    console.log('Записей для frontend:', records.length);
    
    // Проверка первой записи
    console.log('\nПервая запись:');
    console.log('year:', records[0]?.year, typeof records[0]?.year);
    console.log('amount:', records[0]?.amount, typeof records[0]?.amount);
    console.log('quantity:', records[0]?.quantity, typeof records[0]?.quantity);
    
    // KPI расчёт
    const totalAmount = records.reduce((sum, r) => sum + (r.amount || 0), 0);
    const totalQuantity = records.reduce((sum, r) => sum + (r.quantity || 0), 0);
    const totalContracts = records.length;
    const avgContract = totalContracts > 0 ? totalAmount / totalContracts : 0;
    const uniqueSuppliers = new Set(records.map(r => r.supplier)).size;
    const uniqueCustomers = new Set(records.map(r => r.customer)).size;
    const avgPrice = totalQuantity > 0 ? totalAmount / totalQuantity : 0;
    
    console.log('\n=== KPI (как на frontend) ===');
    console.log('totalAmount:', totalAmount.toLocaleString('ru-RU', {style: 'currency', currency: 'RUB'}));
    console.log('totalQuantity:', totalQuantity.toLocaleString('ru-RU'));
    console.log('totalContracts:', totalContracts);
    console.log('avgContract:', avgContract.toLocaleString('ru-RU', {style: 'currency', currency: 'RUB'}));
    console.log('uniqueSuppliers:', uniqueSuppliers);
    console.log('uniqueCustomers:', uniqueCustomers);
    console.log('avgPrice:', avgPrice.toLocaleString('ru-RU', {style: 'currency', currency: 'RUB'}));
  });
});
