/**
 * Проверка после сборки: админка закрыта, вход работает, API без сессии не пускает.
 * Запуск: node scripts/smoke.mjs [baseUrl]
 */
const BASE = process.argv[2] || process.env.BASE_URL || 'http://127.0.0.1:3000';
const PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

let failed = 0;

function ok(name, condition, extra = '') {
  console.log(`${condition ? '✓' : '✗'} ${name}${extra ? ` — ${extra}` : ''}`);
  if (!condition) failed += 1;
}

async function main() {
  // 1. админка без cookie должна отправлять на логин
  const adminNoAuth = await fetch(`${BASE}/admin`, { redirect: 'manual' });
  const location = adminNoAuth.headers.get('location') || '';
  ok(
    'GET /admin без входа → редирект на /admin/login',
    [301, 302, 307, 308].includes(adminNoAuth.status) && location.includes('/admin/login'),
    `${adminNoAuth.status} ${location}`,
  );

  // 2. страница входа доступна
  const loginPage = await fetch(`${BASE}/admin/login`);
  ok('GET /admin/login → 200', loginPage.status === 200, String(loginPage.status));

  // 3. неверный пароль
  const bad = await fetch(`${BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'wrong-password' }),
  });
  ok('POST /api/admin/login с неверным паролем → 401', bad.status === 401, String(bad.status));

  // 4. API без сессии
  const apiNoAuth = await fetch(`${BASE}/api/admin/products`);
  ok('GET /api/admin/products без входа → 401', apiNoAuth.status === 401, String(apiNoAuth.status));

  // 5. вход и доступ с cookie
  const login = await fetch(`${BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: PASSWORD }),
  });
  const setCookie = login.headers.get('set-cookie') || '';
  const cookie = setCookie.split(';')[0];
  ok('POST /api/admin/login с верным паролем → 200', login.status === 200, String(login.status));
  ok('cookie сессии выдана', cookie.startsWith('dt_session='), cookie ? 'есть' : 'нет');

  if (cookie) {
    const adminAuth = await fetch(`${BASE}/admin`, { headers: { cookie }, redirect: 'manual' });
    ok('GET /admin с cookie → 200', adminAuth.status === 200, String(adminAuth.status));

    const apiAuth = await fetch(`${BASE}/api/admin/products`, { headers: { cookie } });
    const data = await apiAuth.json().catch(() => ({}));
    ok(
      'GET /api/admin/products с cookie → 200 и данные',
      apiAuth.status === 200 && Array.isArray(data.products),
      `${data.products?.length ?? 0} товаров`,
    );
  }

  // 6. публичные страницы
  for (const path of ['/', '/catalog', '/reviews', '/contacts']) {
    const res = await fetch(`${BASE}${path}`);
    ok(`GET ${path} → 200`, res.status === 200, String(res.status));
  }

  console.log(failed ? `\nПровалено проверок: ${failed}` : '\nВсе проверки пройдены');
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error('Ошибка проверки:', error.message);
  process.exit(1);
});
