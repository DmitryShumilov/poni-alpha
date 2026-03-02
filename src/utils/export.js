import { utils, writeFile } from 'xlsx';

// Экспорт в CSV
export const exportToCSV = (data, filename = 'export') => {
  if (!data || data.length === 0) {
    console.warn('Нет данных для экспорта');
    return false;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(field => {
        const value = row[field];
        // Экранирование кавычек и обработка запятых
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);

  return true;
};

// Экспорт в XLSX
export const exportToXLSX = (data, filename = 'export') => {
  if (!data || data.length === 0) {
    console.warn('Нет данных для экспорта');
    return false;
  }

  const worksheet = utils.json_to_sheet(data);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Данные');

  // Настройка ширины колонок
  const widths = Object.keys(data[0]).map(key => ({
    wch: Math.min(Math.max(key.length, ...data.map(row => String(row[key] ?? '').length)), 50)
  }));
  worksheet['!cols'] = widths;

  writeFile(workbook, `${filename}.xlsx`);
  return true;
};

// Экспорт отфильтрованных данных с форматированием
export const exportFilteredData = (data, format = 'xlsx', filename) => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const defaultFilename = `goszakupki_export_${timestamp}`;

  if (format === 'csv') {
    return exportToCSV(data, filename || defaultFilename);
  } else {
    return exportToXLSX(data, filename || defaultFilename);
  }
};
