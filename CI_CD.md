# CI/CD Документация

## GitHub Actions Pipeline

### Workflow: CI/CD Pipeline

**Файл:** `.github/workflows/ci-cd.yml`

### Этапы pipeline:

#### 1. Tests & Linting
- Установка Node.js 18
- Установка зависимостей (`npm ci`)
- Запуск линтера (`npm run lint`)
- Запуск тестов (`npm test -- --run`)
- Загрузка результатов тестов

#### 2. Build
- Зависит от успешного прохождения тестов
- Сборка приложения (`npm run build`)
- Загрузка артефактов сборки (7 дней)

#### 3. E2E Tests
- Зависит от успешной сборки
- Установка Playwright
- Запуск E2E тестов (`npm run test:e2e`)
- Загрузка отчётов Playwright

#### 4. Security Audit
- Проверка уязвимостей (`npm audit`)
- Сканирование Snyk (требуется `SNYK_TOKEN`)

### Переменные окружения

Для работы security scan добавьте secret:
- `SNYK_TOKEN` — токен для Snyk

### Запуск вручную

Pipeline запускается автоматически при:
- Push в ветки `main`, `master`, `develop`
- Pull request в `main`, `master`

Для ручного запуска:
1. Перейдите в Actions tab
2. Выберите workflow "CI/CD Pipeline"
3. Нажмите "Run workflow"

### Статусы

| Статус | Значение |
|--------|----------|
| ✅ | Все этапы пройдены |
| ❌ | Ошибка на этапе |
| ⏸️ | Ожидание/выполнение |

### Артефакты

- `test-results/` — результаты тестов
- `build/` — собранное приложение
- `playwright-report/` — отчёт E2E тестов
