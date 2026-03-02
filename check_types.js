// Проверка типов данных в uniqueValues.years

const data = [
  { year: 2024, amount: 100 },
  { year: 2025, amount: 200 },
  { year: 2026, amount: 300 }
];

// Как вычисляется uniqueValues.years в App.jsx
const uniqueValues = {
  years: [...new Set(data.map(item => item.year))].filter(y => y !== null && y !== undefined).sort((a, b) => a - b)
};

console.log('uniqueValues.years:', uniqueValues.years);
console.log('Тип первого элемента:', typeof uniqueValues.years[0]);

// Как работает toggleYear
let selectedYears = [];
const year = 2024;

// Проверка includes
console.log('selectedYears.includes(year):', selectedYears.includes(year));
console.log('year in selectedYears:', selectedYears.includes(2024));

// Добавление года
selectedYears = [...selectedYears, year];
console.log('selectedYears после добавления:', selectedYears);

// Фильтрация как в App.jsx
const filteredData = data.filter(item => {
  if (selectedYears.length && (item.year === null || item.year === undefined || !selectedYears.includes(item.year))) {
    return false;
  }
  return true;
});

console.log('filteredData:', filteredData);
console.log('Сумма:', filteredData.reduce((sum, r) => sum + r.amount, 0));
