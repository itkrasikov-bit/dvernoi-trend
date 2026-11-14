# Публикация сайта (GitHub Pages)

Репозиторий уже готов: инициализирован, всё закоммичено в ветку `main`.
Сайт лежит в корне — `index.html`, `images/`, поэтому GitHub Pages отдаст его без сборки.

## Вариант 1. Вы создаёте репозиторий, я пушу

1. На GitHub: **New repository** → имя, например `dvernoi-trend` → **Public** →
   *без* README, .gitignore и лицензии (пустой).
2. Пришлите мне ссылку на репозиторий и токен доступа
   (Settings → Developer settings → Personal access tokens → Fine-grained token,
   права: `Contents: Read and write` и `Pages: Read and write` на этот репозиторий).
3. Я выполню:

```bash
git remote add origin https://<token>@github.com/<логин>/dvernoi-trend.git
git push -u origin main
```

4. Включаю Pages (Settings → Pages → Source: **Deploy from a branch**, ветка `main`, папка `/ (root)`).
   Сайт будет доступен по адресу `https://<логин>.github.io/dvernoi-trend/`.

Токен после работы можно сразу отозвать — он нужен только для пуша.

## Вариант 2. Вы делаете сами (две команды)

```bash
cd D:\test_opencode\dveri\GOTOVO
git remote add origin https://github.com/<логин>/dvernoi-trend.git
git push -u origin main
```

Дальше Settings → Pages → Deploy from a branch → `main` / `/ (root)`.

## Вариант 3. GitLab Pages

```bash
git remote add origin https://gitlab.com/<логин>/dvernoi-trend.git
git push -u origin main
```

Для GitLab Pages понадобится файл `.gitlab-ci.yml` с job `pages`, который копирует
содержимое в `public/`. Скажите — добавлю.

## Свой домен

Когда будет домен (например `dvernoitrend.ru`):

1. В репозитории создать файл `CNAME` с одной строкой — доменом.
2. У регистратора прописать `A`-записи на IP GitHub Pages
   (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153)
   или `CNAME` на `<логин>.github.io`.
3. Settings → Pages → Custom domain → включить **Enforce HTTPS**.

## Что важно помнить при публикации

- Сменить пароль админки: `ADMIN_PASSWORD` в `index.html` (сейчас `admin123`).
- Вписать `TELEGRAM.botToken` и `chatId`, иначе заявки остаются только в браузере.
- Заменить три отзыва-заглушки в `REVIEWS_SEED`.
- Переписка с заказчиком, оригиналы фото и старые версии сайта (`ChatExport_*`,
  `DOPOLNIT`, `site31_08`, `site32_08`, `Двери`) в репозиторий **не попадают** —
  это отдельная папка со своим `.git`.
