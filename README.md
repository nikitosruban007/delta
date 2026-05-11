# FoldUp

Платформа для проведення турнірів/хакатонів з повним циклом: реєстрація, формування команд, подача робіт, оцінювання журі, результати, форум та сповіщення.

## Що Всередині

- backend: NestJS, Prisma, PostgreSQL
- frontend: Next.js (App Router)
- авторизація: JWT + рольова модель
- документація API: Swagger

## Зміст

- [1. Можливості Платформи](#1-можливості-платформи)
- [2. Архітектура](#2-архітектура)
- [3. Структура Репозиторію](#3-структура-репозиторію)
- [4. Технологічний Стек](#4-технологічний-стек)
- [5. Передумови Для Запуску](#5-передумови-для-запуску)
- [6. Локальний Запуск (Повний)](#6-локальний-запуск-повний)
- [7. Робота З Платформою По Ролях](#7-робота-з-платформою-по-ролях)
- [8. Команди Розробки Та Тестів](#8-команди-розробки-та-тестів)
- [9. Змінні Оточення (Детально)](#9-змінні-оточення-детально)
- [10. Production-Деплой На VPS (Runbook)](#10-production-деплой-на-vps-runbook)
- [11. Альтернативний Деплой (Frontend Cloud + Backend VPS)](#11-альтернативний-деплой-frontend-cloud--backend-vps)
- [12. Операційна Підтримка](#12-операційна-підтримка)
- [13. Оновлення, Rollback, Міграції](#13-оновлення-rollback-міграції)
- [14. Безпека](#14-безпека)
- [15. Troubleshooting](#15-troubleshooting)
- [16. FAQ](#16-faq)

## 1. Можливості Платформи

- автентифікація та ролі: ADMIN, ORGANIZER, JUDGE, PARTICIPANT
- створення і керування турнірами
- раунди, дедлайни, критерії оцінювання
- реєстрація команд і подача робіт
- оцінювання журі, підрахунок результатів
- рейтинг/лідерборд
- форумні теми, пости, голоси, скарги
- сповіщення
- консультації
- генерація сертифікатів

## 2. Архітектура

```mermaid
flowchart LR
  U[Browser] --> FE[Frontend Next.js :3001]
  FE -->|HTTP /api| BE[Backend NestJS :3000]
  BE --> DB[(PostgreSQL)]
  BE --> R[(Redis optional)]
  BE --> SMTP[(SMTP optional)]
```

Ключові принципи:

- Frontend працює як окремий веб-додаток.
- Backend має глобальний префікс /api.
- Swagger доступний через /api/docs.
- Основне джерело істини даних: PostgreSQL через Prisma.

## 3. Структура Репозиторію

```text
FoldUp/
  backend/
    prisma/
    src/
    test/
  frontend/
    src/
    public/
    tests/
```

Практично:

- backend: доменна логіка, БД, API
- frontend: UI, роутинг, клієнт до API

## 4. Технологічний Стек

Backend:

- NestJS 11
- Prisma 7
- PostgreSQL
- JWT/Auth guards
- Swagger

Frontend:

- Next.js 16
- React 19
- TypeScript
- Vitest + Playwright

## 5. Передумови Для Запуску

Обов'язково:

- Node.js 20+
- npm 10+
- PostgreSQL 14+

Опційно:

- Redis (якщо хочете зовнішній кеш)
- SMTP (для email-сповіщень)
- OAuth провайдери (Google/GitHub)

Перевірка версій:

```bash
node -v
npm -v
psql --version
```

## 6. Локальний Запуск (Повний)

### 6.1. Клон та інсталяція залежностей

```bash
git clone https://github.com/DELTA-Sigma-Group/FoldUp.git
cd FoldUp

cd backend
npm ci

cd ../frontend
npm ci
```

### 6.2. Налаштування .env

Backend:

Linux/macOS:

```bash
cd backend
cp .env.example .env
```

Windows PowerShell:

```powershell
cd backend
Copy-Item .env.example .env
```

Frontend:

Linux/macOS:

```bash
cd ../frontend
cp .env.example .env.local
```

Windows PowerShell:

```powershell
cd ../frontend
Copy-Item .env.example .env.local
```

### 6.3. База даних

1. Створіть БД, наприклад foldup_db.
2. Вкажіть рядок підключення у backend/.env.
3. Застосуйте міграції і сиди:

```bash
cd ../backend
npx prisma migrate deploy
npm run db:seed
```

Для локальної розробки з новими міграціями:

```bash
npm run db:migrate
```

### 6.4. Запуск сервісів у dev

Термінал 1:

```bash
cd backend
npm run start:dev
```

Термінал 2:

```bash
cd frontend
npm run dev
```

### 6.5. Перевірка після запуску

- Frontend: http://localhost:3001
- Backend API: http://localhost:3000/api
- Swagger: http://localhost:3000/api/docs

### 6.6. Тестові акаунти після seed

Пароль для всіх: password123

- admin@foldup.io
- organizer@foldup.io
- judge@foldup.io
- team@foldup.io

## 7. Робота З Платформою По Ролях

### ADMIN

- керує ролями, дозволами, користувачами
- має доступ до глобального адміністрування

### ORGANIZER

- створює турнір
- задає раунди, дедлайни, критерії
- керує процесом подачі та перевірки

### JUDGE

- переглядає подані роботи
- виставляє бали за критеріями
- додає коментарі

### PARTICIPANT

- реєструється
- формує команду
- подає роботу в активний раунд
- відслідковує результати

Типовий життєвий цикл турніру:

1. ORGANIZER публікує турнір.
2. Команди реєструються.
3. Подача робіт до дедлайну.
4. JUDGE оцінює.
5. Публікуються результати.

## 8. Команди Розробки Та Тестів

### Backend

```bash
npm run start:dev      # запуск у режимі розробки
npm run build          # production build
npm run start:prod     # запуск з dist/main
npm run lint           # lint + autofix
npm run test           # unit
npm run test:e2e       # e2e
npm run db:migrate     # prisma migrate dev
npm run db:generate    # prisma generate
npm run db:seed        # seed
npm run db:reset       # reset + seed
npm run db:studio      # prisma studio
```

### Frontend

```bash
npm run dev            # dev сервер на 3001
npm run build          # production build
npm run start          # запуск production сервера
npm run lint           # eslint
npm run test           # vitest
npm run test:e2e       # playwright
npm run type-check     # tsc --noEmit
```

## 9. Змінні Оточення (Детально)

### Backend: backend/.env

Обов'язкові:

- DATABASE_URL
- JWT_SECRET
- PORT
- FRONTEND_URL

Опційні:

- ENABLE_GOOGLE_AUTH
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_CALLBACK_URL
- ENABLE_GITHUB_AUTH
- GITHUB_CLIENT_ID
- GITHUB_CLIENT_SECRET
- GITHUB_CALLBACK_URL
- REDIS_URL
- NOTIFICATIONS_EMAIL_PROVIDER
- NOTIFICATIONS_EMAIL_FROM
- NOTIFICATIONS_SMTP_HOST
- NOTIFICATIONS_SMTP_PORT
- NOTIFICATIONS_SMTP_SECURE
- NOTIFICATIONS_SMTP_USER
- NOTIFICATIONS_SMTP_PASS

Приклад:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/foldup_db"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-change-in-production"
PORT=3000
FRONTEND_URL="http://localhost:3001"

ENABLE_GOOGLE_AUTH="false"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/google/callback"

ENABLE_GITHUB_AUTH="false"
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GITHUB_CALLBACK_URL="http://localhost:3000/api/auth/github/callback"

REDIS_URL="redis://localhost:6379"

NOTIFICATIONS_EMAIL_PROVIDER="smtp"
NOTIFICATIONS_EMAIL_FROM="noreply@foldup.io"
NOTIFICATIONS_SMTP_HOST="smtp.gmail.com"
NOTIFICATIONS_SMTP_PORT="587"
NOTIFICATIONS_SMTP_SECURE="false"
NOTIFICATIONS_SMTP_USER="your@gmail.com"
NOTIFICATIONS_SMTP_PASS="your-app-password"
```

### Frontend: frontend/.env.local

Критично важливі:

- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_APP_URL

Опційні:

- NEXT_PUBLIC_WS_URL
- NEXT_PUBLIC_ENABLE_GOOGLE_AUTH
- NEXT_PUBLIC_ENABLE_GITHUB_AUTH
- NEXT_PUBLIC_STUN_URL
- NEXT_PUBLIC_TURN_URL
- NEXT_PUBLIC_TURN_USER
- NEXT_PUBLIC_TURN_PASS

Приклад:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_ENABLE_GOOGLE_AUTH="false"
NEXT_PUBLIC_ENABLE_GITHUB_AUTH="false"
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

## 10. Production-Деплой На VPS (Runbook)

У репозиторії немає готових Docker/CI конфігів, тому найнадійніший прямий сценарій: VPS + Nginx + PM2.

### 10.1. Підготовка сервера

Ubuntu приклад:

```bash
sudo apt update
sudo apt install -y nginx postgresql postgresql-contrib
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2
```

### 10.2. PostgreSQL

```bash
sudo -u postgres psql
```

У psql:

```sql
CREATE DATABASE foldup_db;
CREATE USER foldup_user WITH ENCRYPTED PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE foldup_db TO foldup_user;
```

### 10.3. Код на сервер

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
git clone https://github.com/DELTA-Sigma-Group/FoldUp.git FoldUp
cd FoldUp
```

### 10.4. Backend production

```bash
cd /var/www/FoldUp/backend
npm ci
cp .env.example .env
```

Заповніть .env (мінімум):

```env
DATABASE_URL="postgresql://foldup_user:strong_password@127.0.0.1:5432/foldup_db"
JWT_SECRET="LONG_RANDOM_SECRET_MIN_32_CHARS"
PORT=3000
FRONTEND_URL="https://your-domain.com"
```

Потім:

```bash
npx prisma migrate deploy
npm run db:seed
npm run build
pm2 start npm --name foldup-backend -- start:prod
pm2 save
pm2 startup
```

### 10.5. Frontend production

```bash
cd /var/www/FoldUp/frontend
npm ci
cp .env.example .env.local
```

Заповніть .env.local:

```env
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_WS_URL=https://your-domain.com
```

Потім:

```bash
npm run build
pm2 start npm --name foldup-frontend -- start
pm2 save
```

### 10.6. Nginx reverse proxy

Створіть файл /etc/nginx/sites-available/foldup:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 25m;

    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Увімкнення:

```bash
sudo ln -sf /etc/nginx/sites-available/foldup /etc/nginx/sites-enabled/foldup
sudo nginx -t
sudo systemctl reload nginx
```

### 10.7. SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 10.8. Production smoke-check

```bash
curl -I https://your-domain.com
curl -I https://your-domain.com/api/docs
pm2 list
```

## 11. Альтернативний Деплой (Frontend Cloud + Backend VPS)

Сценарій:

- Frontend: Vercel
- Backend: ваш VPS
- DB: managed PostgreSQL

Що важливо:

- у Vercel виставити NEXT_PUBLIC_API_URL на URL вашого backend
- на backend виставити FRONTEND_URL на домен Vercel
- переконатися, що CORS дозволяє домен frontend

## 12. Операційна Підтримка

### PM2 корисне

```bash
pm2 list
pm2 logs foldup-backend --lines 200
pm2 logs foldup-frontend --lines 200
pm2 restart foldup-backend
pm2 restart foldup-frontend
pm2 monit
```

### Nginx логі

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### PostgreSQL бекап

```bash
pg_dump "postgresql://foldup_user:strong_password@127.0.0.1:5432/foldup_db" > foldup_backup.sql
```

## 13. Оновлення, Rollback, Міграції

### 13.1. Оновлення релізу

```bash
cd /var/www/FoldUp
git pull

cd backend
npm ci
npx prisma migrate deploy
npm run build
pm2 restart foldup-backend

cd ../frontend
npm ci
npm run build
pm2 restart foldup-frontend
```

### 13.2. Rollback

Мінімальний безпечний сценарій:

1. Повернути git на попередній стабільний тег/коміт.
2. Перебілдити backend/frontend.
3. Перезапустити PM2 процеси.
4. Якщо проблема в міграції БД, застосовувати rollback план тільки після резервної копії.

### 13.3. Політика міграцій

- Для production: тільки prisma migrate deploy.
- Не використовувати prisma migrate dev на production.
- Перед релізом обов'язково робити дамп БД.

## 14. Безпека

- завжди змінюйте JWT_SECRET у production
- не комітьте .env файли
- обмежте доступ до PostgreSQL ззовні
- увімкніть HTTPS
- використовуйте складні паролі для БД і SMTP
- для OAuth: точні callback URL, без wildcard
- для TURN/STUN у production використовуйте власні або керовані сервери

## 15. Troubleshooting

1. Prisma не конектиться до БД
- перевірити DATABASE_URL
- перевірити, що PostgreSQL запущений
- перевірити права користувача БД

2. CORS помилки в браузері
- перевірити FRONTEND_URL у backend/.env
- перевірити фактичний origin фронтенду

3. Frontend не бачить API
- перевірити NEXT_PUBLIC_API_URL у frontend/.env.local
- перевірити Nginx location /api/

4. OAuth кнопки є, але логін не працює
- перевірити ENABLE_GOOGLE_AUTH/ENABLE_GITHUB_AUTH
- перевірити callback URL у провайдера
- перевірити змінні секретів

5. PM2 процес падає після рестарту
- перевірити pm2 logs
- переконатися, що зроблено npm ci та npm run build
- перевірити актуальність .env

6. Після деплою стара версія UI
- очистити кеш браузера/CDN
- перевірити, що frontend перебілджений
- перевірити чи перезапущено foldup-frontend

## 16. FAQ

Питання: Чому frontend на 3001, а backend на 3000?
Відповідь: це стандартна поточна конфігурація проєкту, щоб уникати конфлікту портів і прозоро проксіювати /api через Nginx.

Питання: Чи можна запускати без Redis?
Відповідь: так, Redis опційний; застосунок має fallback для кешу.

Питання: Чи треба seed у production?
Відповідь: залежить від цілі. Для чистого бойового середовища зазвичай сидування базових ролей корисне, демо-дані краще прибрати/адаптувати під бізнес-процес.

Питання: Де дивитися API схему?
Відповідь: /api/docs (Swagger).
