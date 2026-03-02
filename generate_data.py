# -*- coding: utf-8 -*-
import pandas as pd
import json

# Читаем Excel
df = pd.read_excel('database.xlsx')

# Преобразуем в формат данных по индексам столбцов
records = []
for _, row in df.iterrows():
    # Получаем дату контракта (столбец 9)
    contract_date = row.iloc[9]
    if pd.isna(contract_date):
        contract_date = None
    elif hasattr(contract_date, 'strftime'):
        contract_date = contract_date.strftime('%Y-%m-%d')
    
    # Год и месяц из даты контракта
    year = None
    month = None
    if contract_date:
        try:
            parts = contract_date.split('-')
            if len(parts) == 3:
                year = int(parts[0])
                month = int(parts[1])
        except:
            pass
    
    # Если есть отдельный столбец Год (столбец 26)
    gy = row.iloc[26]
    if pd.notna(gy):
        if isinstance(gy, pd.Timestamp):
            year = gy.year
        else:
            year = int(gy)
    
    # Продукт из столбца "Что закупили" (столбец 15)
    product = row.iloc[15]
    if pd.isna(product):
        product = ''
    
    # Сумма (столбец 20)
    amount = row.iloc[20]
    if pd.isna(amount):
        amount = 0
    
    record = {
        'customer': str(row.iloc[1]) if pd.notna(row.iloc[1]) else '',
        'region': str(row.iloc[2]) if pd.notna(row.iloc[2]) else '',
        'contract_date': contract_date or '',
        'product': str(product),
        'price': float(row.iloc[18]) if pd.notna(row.iloc[18]) else 0,
        'quantity': float(row.iloc[19]) if pd.notna(row.iloc[19]) else 0,
        'amount': float(amount) if pd.notna(amount) else 0,
        'supplier': str(row.iloc[21]) if pd.notna(row.iloc[21]) else '',
        'year': year,
        'month': month
    }
    records.append(record)

# Сохраняем JSON
with open('public/data.json', 'w', encoding='utf-8') as f:
    json.dump({'records': records}, f, ensure_ascii=False, indent=2)

print(f'Сгенерировано {len(records)} записей')
print('Файл public/data.json создан')

# Проверка
months_count = sum(1 for r in records if r['month'])
print(f'Записей с month: {months_count} из {len(records)}')

# Проверка продуктов
products = {}
for r in records:
    p = r['product']
    if p:
        products[p] = products.get(p, 0) + r['amount']
print('\nТоп-5 продуктов:')
for k, v in sorted(products.items(), key=lambda x: -x[1])[:5]:
    print(f'  {k}: {v:,.0f}')
