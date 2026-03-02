# 🔒 Инструкция по настройке HTTPS

## Для production-развёртывания

### Вариант 1: Использование reverse proxy (рекомендуется)

#### Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Apache

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    Redirect permanent / https://your-domain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName your-domain.com

    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    SSLProtocol all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1

    # Security headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"

    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    ProxyPass /api http://localhost:5000/
    ProxyPassReverse /api http://localhost:5000/
</VirtualHost>
```

### Вариант 2: Let's Encrypt (бесплатный SSL)

```bash
# Установка Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Автоматическое обновление
sudo certbot renew --dry-run
```

### Вариант 3: HTTPS в Docker

```yaml
# docker-compose.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
      - server

  app:
    build: .
    environment:
      - NODE_ENV=production

  server:
    build: .
    command: npm run server
    environment:
      - NODE_ENV=production
      - PORT=5000
```

### Вариант 4: Облачные платформы (автоматический HTTPS)

#### Vercel
```json
// vercel.json
{
  "version": 2,
  "builds": [
    { "src": "package.json", "use": "@vercel/static-build" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server.cjs" }
  ]
}
```

#### Netlify
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/api/*"
  to = "https://your-api-server.com/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
```

## Проверка HTTPS

### Онлайн инструменты:
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)
- [Why No Padlock](https://www.whynopadlock.com/)

### Локальная проверка:
```bash
# Проверка сертификата
openssl s_client -connect your-domain.com:443

# Проверка редиректа HTTP → HTTPS
curl -I http://your-domain.com
```

## Переменные окружения для production

```bash
# .env.production
NODE_ENV=production
PORT=3000
VITE_API_URL=https://your-api-domain.com

# Server
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
LOG_LEVEL=warn
```

## Security Checklist

- [ ] HTTPS настроен и работает
- [ ] HTTP редиректит на HTTPS
- [ ] HSTS заголовок установлен
- [ ] TLS 1.2/1.3 только
- [ ] Слабые шифры отключены
- [ ] Security headers настроены
- [ ] Сертификат обновляется автоматически
- [ ] CORS настроен для production доменов
