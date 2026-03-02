import pandas as pd

df = pd.read_excel('database.xlsx')

# Проверим точное значение 8 961 353 536,79
target = 8_961_353_536.79

records = []
for idx, row in df.iterrows():
    contract_date = row.iloc[9]
    amount = row.iloc[20]
    supply_year = row.iloc[26]
    quantity = row.iloc[19]
    price = row.iloc[18]
    
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
    if pd.notna(supply_year):
        if isinstance(supply_year, pd.Timestamp):
            supply_year = supply_year.year
        else:
            supply_year = int(supply_year)
    else:
        supply_year = None
    
    records.append({
        'idx': idx,
        'contract_year': contract_year,
        'supply_year': supply_year,
        'month': month,
        'amount': amount,
        'quantity': quantity,
        'price': price
    })

# Разные варианты для 2024
print('=== Варианты расчёта для 2024 года ===')

# 1. supply_year == 2024
sum1 = sum(r['amount'] for r in records if r['supply_year'] == 2024)
print(f'1. supply_year == 2024: {sum1:,.2f} (разница: {sum1 - target:,.2f})')

# 2. contract_year == 2024
sum2 = sum(r['amount'] for r in records if r['contract_year'] == 2024)
print(f'2. contract_year == 2024: {sum2:,.2f} (разница: {sum2 - target:,.2f})')

# 3. supply_year == 2024, contract_year <= 2024
sum3 = sum(r['amount'] for r in records if r['supply_year'] == 2024 and r['contract_year'] is not None and r['contract_year'] <= 2024)
print(f'3. supply_year == 2024 AND contract_year <= 2024: {sum3:,.2f}')

# 4. supply_year == 2024, contract_year >= 2024
sum4 = sum(r['amount'] for r in records if r['supply_year'] == 2024 and r['contract_year'] is not None and r['contract_year'] >= 2024)
print(f'4. supply_year == 2024 AND contract_year >= 2024: {sum4:,.2f}')

# 5. supply_year == 2024 И contract_year == supply_year (только совпадающие)
sum5 = sum(r['amount'] for r in records if r['supply_year'] == 2024 and r['contract_year'] == 2024)
print(f'5. supply_year == 2024 И contract_year == supply_year: {sum5:,.2f}')

# 6. Только записи с month != None
sum6 = sum(r['amount'] for r in records if r['supply_year'] == 2024 and r['month'] is not None)
print(f'6. supply_year == 2024 AND month != None: {sum6:,.2f}')

# Проверим записи без месяца
no_month = [r for r in records if r['supply_year'] == 2024 and r['month'] is None]
print(f'\nЗаписей за 2024 без месяца: {len(no_month)}')
if no_month:
    print(f'Их сумма: {sum(r["amount"] for r in no_month):,.2f}')

# Проверим записи 2023->2024
print('\n=== Записи 2023 контракт, 2024 поставка ===')
s23_24 = [r for r in records if r['contract_year'] == 2023 and r['supply_year'] == 2024]
print(f'Количество: {len(s23_24)}, Сумма: {sum(r["amount"] for r in s23_24):,.2f}')
