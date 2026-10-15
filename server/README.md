# Быстрый запуск Cloudflare Workers (Edge Proxy) для CloakNet

Этот скрипт позволяет получить **бесплатный персональный прокси-сервер** без аренды VPS.
Cloudflare предоставляет **100 000 бесплатных запросов в день**, сверхбыструю сеть (300+ дата-центров) и автоматический выбор ближайшей / зарубежной ноды.

---

## Вариант 1: Через веб-интерфейс Cloudflare (Занимает 2 минуты)

1. Зарегистрируйтесь или войдите в [dash.cloudflare.com](https://dash.cloudflare.com/) (аккаунт бесплатный, привязка карты не требуется).
2. В левом боковом меню перейдите в раздел **Workers & Pages**.
3. Нажмите кнопку **Create application** -> выберите вкладку **Workers** -> нажмите **Create Worker**.
4. Задайте имя (например, `cloaknet-proxy`) и нажмите **Deploy**.
5. Нажмите кнопку **Edit code** (или **Quick Edit**).
6. Полностью удалите стандартный код и вставьте содержимое файла [`cloudflare-worker.js`](cloudflare-worker.js).
7. *(По желанию)* Измените значение переменной `SECRET_TOKEN` (например, `const SECRET_TOKEN = "my-password-123";`).
8. Нажмите **Save and deploy**.

### Готово!
Ваш личный прокси-сервер развернут по адресу:
`https://cloaknet-proxy.<ваш-аккаунт>.workers.dev`

Проверьте его в браузере: откройте `https://cloaknet-proxy.<ваш-аккаунт>.workers.dev/ip` — вы увидите JSON с текущим IP и кодом дата-центра (например, `AMS`, `FRA`, `IAD`).

---

## Вариант 2: Через командную строку (Wrangler CLI)

Если установлен Node.js:

```bash
# Установка Cloudflare Wrangler CLI
npm install -g wrangler

# Авторизация в Cloudflare
wrangler login

# Развертывание воркера
wrangler deploy server/cloudflare-worker.js --name cloaknet-proxy
```

---

## Как подключить к расширению CloakNet

1. Откройте расширение **CloakNet** в Chrome.
2. Нажмите на иконку настроек (шестеренка в правом верхнем углу).
3. В поле **Cloudflare Worker URL** вставьте полученный адрес:
   `https://cloaknet-proxy.<ваш-аккаунт>.workers.dev`
4. Если вы меняли `SECRET_TOKEN`, укажите его в поле **Ключ доступа**.
5. Нажмите **Сохранить**.
6. Вернитесь в главное окно и нажмите кнопку включения!
