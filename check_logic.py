import pandas as pd

df = pd.read_excel('database.xlsx')

records = []
for idx, row in df.iterrows():
    contract_date = row.iloc[9]
    amount = row.iloc[20]
    supply_year = row.iloc[26]
    
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
        'contract_year': contract_year,
        'supply_year': supply_year,
        'month': month,
        'amount': amount
    })

# Сумма за 2024 по разным логикам
# 1. Все записи где supply_year == 2024
sum_supply_2024 = sum(r['amount'] for r in records if r['supply_year'] == 2024)
print(f'1. Сумма где supply_year == 2024: {sum_supply_2024:,.2f}')

# 2. Все записи где contract_year == 2024
sum_contract_2024 = sum(r['amount'] for r in records if r['contract_year'] == 2024)
print(f'2. Сумма где contract_year == 2024: {sum_contract_2024:,.2f}')

# 3. Все записи где supply_year == 2024 И contract_year == 2024 (совпадают)
sum_both_2024 = sum(r['amount'] for r in records if r['supply_year'] == 2024 and r['contract_year'] == 2024)
print(f'3. Сумма где supply_year == 2024 И contract_year == 2024: {sum_both_2024:,.2f}')

# 4. Все записи где supply_year == 2024 И contract_year != 2024 (разные)
sum_diff_2024 = sum(r['amount'] for r in records if r['supply_year'] == 2024 and r['contract_year'] != 2024)
print(f'4. Сумма где supply_year == 2024 И contract_year != 2024: {sum_diff_2024:,.2f}')

# 5. Проверим записи где годы не совпадают
print('\nЗаписи где годы не совпадают (первые 20):')
count = 0
for r in records:
    if r['supply_year'] != r['contract_year'] and r['supply_year'] is not None and r['contract_year'] is not None:
        print(f"  contract_year={r['contract_year']}, supply_year={r['supply_year']}, amount={r['amount']:,.2f}")
        count += 1
        if count >= 20:
            break

# 6. Общая сумма всех записей
total = sum(r['amount'] for r in records)
print(f'\nОбщая сумма всех записей: {total:,.2f}')
