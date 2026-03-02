import pandas as pd

df = pd.read_excel('database.xlsx')

# Проверка первых 20 строк
print('Первые 20 строк:')
print('Индекс | Контракт:дата | Год | Сумма')
for i in range(20):
    contract_date = df.iloc[i, 9]
    year = df.iloc[i, 26]
    amount = df.iloc[i, 20]
    print(f'{i+1:6} | {contract_date} | {year} | {amount:,.2f}')

# Правильная логика расчёта
records = []
for idx, row in df.iterrows():
    contract_date = row.iloc[9]
    amount = row.iloc[20]
    
    # Год и месяц из даты контракта
    if pd.notna(contract_date):
        if isinstance(contract_date, pd.Timestamp):
            contract_year = contract_date.year
            month = contract_date.month
        else:
            contract_year = int(str(contract_date).split('-')[0])
            month = int(str(contract_date).split('-')[1])
    else:
        contract_year = None
        month = None
    
    # Год поставки
    supply_year = row.iloc[26] if pd.notna(row.iloc[26]) else None
    if isinstance(supply_year, pd.Timestamp):
        supply_year = supply_year.year
    elif supply_year is not None:
        supply_year = int(supply_year)
    
    # Логика: если год поставки есть, используем его, иначе год контракта
    final_year = supply_year if supply_year is not None else contract_year
    
    records.append({
        'year': final_year,
        'month': month,
        'amount': amount
    })

# Сумма по годам
print('\nСуммы по годам (Python):')
by_year = {}
for r in records:
    if r['year'] not in by_year:
        by_year[r['year']] = 0
    by_year[r['year']] += r['amount']

for y in sorted(by_year.keys()):
    print(f'{y}: {by_year[y]:,.2f}')

# Проверка суммы за 2024
print(f'\nСумма за 2024: {by_year.get(2024, 0):,.2f}')
