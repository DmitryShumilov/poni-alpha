# Инструкция по синхронизации между устройствами

## Репозитории

| Репозиторий | URL | Назначение |
|-------------|-----|------------|
| **Код проекта** | https://github.com/DmitryShumilov/poni-alpha | Исходный код goszakupki_cgm |
| **Сессии Qwen** | https://github.com/DmitryShumilov/qwen-sessions | История диалогов (приватный) |

---

## Настройка на рабочем ноутбуке

### 1. Клонирование проекта

```bash
# Создайте рабочую папку
mkdir C:\Projects
cd C:\Projects

# Клонировать проект
git clone https://github.com/DmitryShumilov/poni-alpha.git
cd poni-alpha

# Установить зависимости
npm install
```

### 2. Синхронизация сессий Qwen

```bash
# Клонировать репозиторий сессий
git clone https://github.com/DmitryShumilov/qwen-sessions.git

# Скопировать сессии в профиль
xcopy /E /I /Y qwen-sessions\* %USERPROFILE%\.qwen\
```

### 3. Запуск проекта

```bash
cd C:\Projects\poni-alpha

# Скопировать .env из шаблона
copy .env.example .env

# Запустить dev-сервер
npm run dev
```

---

## Рабочий процесс

### Перед началом работы (на любом устройстве):

```bash
# В папке проекта
git pull origin main

# В папке с сессиями (опционально)
cd %USERPROFILE%\.qwen
git pull origin main
```

### После внесения изменений:

```bash
# В папке проекта
cd C:\Projects\poni-alpha
git add .
git commit -m "Описание изменений"
git push origin main

# В папке с сессиями (опционально)
cd %USERPROFILE%\.qwen
git add .
git commit -m "Sync sessions"
git push origin main
```

---

## Откат изменений

### Код проекта:

```bash
# Просмотреть историю
git log --oneline -10

# Откатиться к коммиту
git checkout <commit-hash>

# Или отменить последний коммит
git reset --hard HEAD~1

# Вернуться на main
git checkout main
git pull
```

### Сессии Qwen:

Сессии хранятся в `.qwen/projects/{project-name}/chats/`

- Просмотр: `/sessions` в Qwen Code
- Выбор сессии: `/sessions select {id}`

---

## Структура сессий

```
.qwen/
├── projects/
│   └── {project-name}/
│       └── chats/
│           └── {session-id}.jsonl    ← История диалогов
└── todos/
    └── {session-id}.json             ← Списки задач
```

---

## Важные заметки

1. **database.xlsx** содержит реальные данные — не коммитьте чувствительную информацию
2. **.env** файл не синхронизируется (в .gitignore) — создавайте локально
3. **node_modules/** не синхронизируется — запускайте `npm install` на каждом устройстве
4. **История диалогов** привязана к пути проекта — на разных устройствах могут быть разные сессии
