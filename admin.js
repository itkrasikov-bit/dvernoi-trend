/* ============================================================
   Панель управления каталогом: двери, цены, фото.
   Публикует data/products.json в репозиторий через GitHub API.
   Токен хранится только в localStorage этого браузера.
   ============================================================ */
(function () {
    'use strict';

    var GH_KEY = 'dsh_gh_cfg';
    var OVERLAY_KEY = 'productsOverlay';
    var pendingPhoto = null;   // dataURL выбранного файла
    var pendingSlug = null;    // слаг фото текущей редактируемой карточки
    var photoPending = false;  // фото ещё обрабатывается
    var currentId = null;

    function $(id) { return document.getElementById(id); }
    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
        });
    }

    function money(p) {
        return (typeof priceLabel === 'function') ? priceLabel(p) : (p ? p + ' ₽' : 'Цена по запросу');
    }

    function translit(str) {
        var map = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
            'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
            'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c',
            'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
            'я': 'ya'
        };
        return String(str || '').toLowerCase().split('').map(function (ch) {
            return map[ch] !== undefined ? map[ch] : ch;
        }).join('').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
    }

    /* ---------------- настройки GitHub ---------------- */
    function ghConfig() {
        try { return JSON.parse(localStorage.getItem(GH_KEY) || '{}'); } catch (e) { return {}; }
    }

    function ghReady() {
        var c = ghConfig();
        return !!(c.token && c.owner && c.repo);
    }

    function fillSettings() {
        var c = ghConfig();
        var host = location.hostname || '';
        var seg = (location.pathname || '').split('/').filter(Boolean)[0] || '';
        if ($('cfgOwner')) $('cfgOwner').value = c.owner || (host.endsWith('.github.io') ? host.split('.')[0] : '');
        if ($('cfgRepo')) $('cfgRepo').value = c.repo || seg;
        if ($('cfgBranch')) $('cfgBranch').value = c.branch || 'main';
        if ($('cfgToken')) $('cfgToken').value = c.token || '';
    }

    function saveGhSettings() {
        var cfg = {
            owner: ($('cfgOwner').value || '').trim(),
            repo: ($('cfgRepo').value || '').trim(),
            branch: ($('cfgBranch').value || 'main').trim(),
            token: ($('cfgToken').value || '').trim()
        };
        localStorage.setItem(GH_KEY, JSON.stringify(cfg));
        setStatus('ghStatus', cfg.token ? 'Настройки сохранены. Можно публиковать.' : 'Настройки сохранены, но токен пустой — правки останутся локальными.', cfg.token ? 'ok' : 'warn');
        updatePublishNote();

        // если уже были локальные правки — сразу публикуем их
        if (ghReady()) {
            var pending = null;
            try { pending = JSON.parse(localStorage.getItem(OVERLAY_KEY) || 'null'); } catch (e) {}
            if (Array.isArray(pending) && pending.length) {
                (async function () {
                    setStatus('ghStatus', 'Настройки сохранены. Публикую правки, сделанные до настройки…', '');
                    var ok = await publish(null, null, 'Публикация каталога из админки');
                    if (ok) {
                        setStatus('ghStatus', 'Готово: правки на сайте, обновится за 1–2 минуты.', 'ok');
                        adminTab('products');
                    } else {
                        setStatus('ghStatus', 'Не удалось опубликовать. Проверьте токен и права Contents: Read and write.', 'err');
                    }
                })();
            }
        }
    }

    function setStatus(id, text, kind) {
        var el = $(id);
        if (!el) return;
        el.textContent = text;
        el.className = 'admin-status' + (kind ? ' is-' + kind : '');
        if (kind === 'ok' || kind === 'err') {
            console.log('[admin]', text);
        }
    }

    function log(text) {
        var el = $('adminLog');
        if (!el) return;
        var line = new Date().toLocaleTimeString('ru-RU') + '  ' + text;
        el.textContent = (line + '\n' + el.textContent).slice(0, 4000);
    }

    /* ---------------- GitHub API ---------------- */
    function ghUrl(path) {
        var c = ghConfig();
        return 'https://api.github.com/repos/' + encodeURIComponent(c.owner) + '/' + encodeURIComponent(c.repo) + '/contents/' + path;
    }

    function ghHeaders() {
        var c = ghConfig();
        return {
            'Authorization': 'Bearer ' + c.token,
            'Accept': 'application/vnd.github+json',
            'Content-Type': 'application/json'
        };
    }

    async function ghGetSha(path) {
        var res = await fetch(ghUrl(path) + '?ref=' + encodeURIComponent(ghConfig().branch || 'main'), {
            headers: ghHeaders(), cache: 'no-store'
        });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error('GET ' + path + ': ' + res.status);
        var data = await res.json();
        return data.sha || null;
    }

    async function ghPut(path, base64, message) {
        var sha = await ghGetSha(path);
        var body = {
            message: message,
            content: base64,
            branch: ghConfig().branch || 'main'
        };
        if (sha) body.sha = sha;
        var res = await fetch(ghUrl(path), {
            method: 'PUT',
            headers: ghHeaders(),
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            var t = await res.text();
            throw new Error('PUT ' + path + ': ' + res.status + ' ' + t.slice(0, 200));
        }
        return res.json();
    }

    function toBase64Utf8(str) {
        var bytes = new TextEncoder().encode(str);
        var bin = '';
        for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        return btoa(bin);
    }

    async function checkGh() {
        if (!ghReady()) {
            setStatus('ghStatus', 'Сначала заполните владельца, репозиторий и токен.', 'err');
            return;
        }
        setStatus('ghStatus', 'Проверяю доступ…', '');
        try {
            var c = ghConfig();
            var res = await fetch('https://api.github.com/repos/' + c.owner + '/' + c.repo, { headers: ghHeaders() });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            var repo = await res.json();
            setStatus('ghStatus', 'Доступ есть: ' + repo.full_name + ' (ветка ' + (c.branch || 'main') + ')', 'ok');
            log('Проверка доступа: ok');
        } catch (e) {
            setStatus('ghStatus', 'Не получилось: ' + e.message, 'err');
            log('Ошибка проверки: ' + e.message);
        }
    }

    /* ---------------- публикация ---------------- */
    function localOverlaySet(list) {
        try {
            localStorage.setItem(OVERLAY_KEY, JSON.stringify(list));
            return true;
        } catch (e) {
            return false;
        }
    }

    function updatePublishNote() {
        var note = $('adminPublishNote');
        if (!note) return;
        if (ghReady()) {
            note.textContent = 'Публикация настроена: каждое сохранение сразу уходит на сайт (обновится за 1–2 минуты).';
            note.className = 'admin-note is-ok';
        } else {
            note.innerHTML = 'Публикация не настроена — правки видите только вы. ' +
                '<button type="button" class="admin-link" onclick="adminTab(\'settings\')">Вставить токен и публиковать</button>';
            note.className = 'admin-note is-warn';
        }
    }

    async function publish(photo, slug, message) {
        if (photo && slug) {
            if (ghReady()) {
                setStatus('adminPublishNote', 'Загружаю фото…', '');
                try {
                    await ghPut('images/products/' + slug + '.jpg', photo.split(',')[1], 'Фото: ' + slug);
                    localStorage.removeItem('photo_' + slug);
                    log('Фото загружено: images/products/' + slug + '.jpg');
                } catch (err) {
                    setStatus('adminPublishNote', 'Фото не загрузилось: ' + err.message, 'err');
                    log('Ошибка загрузки фото: ' + err.message);
                    return false;
                }
            } else {
                try { localStorage.setItem('photo_' + slug, photo); } catch (e) { log('Фото не сохранилось локально: ' + e.message); }
            }
        }

        if (!ghReady()) {
            var ok = localOverlaySet(products);
            if (!ok) {
                setStatus('adminPublishNote', 'Не хватило места в браузере — настройте публикацию.', 'err');
                return false;
            }
            setStatus('adminPublishNote', 'Правка сохранена у вас в браузере. Вставьте токен — опубликую сразу.', 'warn');
            // один раз за сессию подсказываем, где включить публикацию
            if (!sessionStorage.getItem('ghPromptShown')) {
                sessionStorage.setItem('ghPromptShown', '1');
                adminTab('settings');
                setStatus('ghStatus', 'Вставьте токен и нажмите «Сохранить настройки» — правка сразу уйдёт на сайт.', 'warn');
                var tokenField = $('cfgToken');
                if (tokenField) tokenField.focus();
            }
            return false;
        }

        setStatus('adminPublishNote', 'Публикую каталог…', '');
        try {
            await ghPut('data/products.json', toBase64Utf8(JSON.stringify(products, null, 1)), message || 'Каталог обновлён из админки');
            localStorage.removeItem(OVERLAY_KEY);
            setStatus('adminPublishNote', 'Опубликовано. Сайт обновится в течение 1–2 минут.', 'ok');
            log('Опубликовано: ' + products.length + ' товаров');
            return true;
        } catch (e) {
            setStatus('adminPublishNote', 'Не удалось опубликовать: ' + e.message, 'err');
            log('Ошибка публикации: ' + e.message);
            return false;
        }
    }

    /* ---------------- вкладки ---------------- */
    function adminTab(name) {
        document.querySelectorAll('.admin-tab').forEach(function (b) {
            b.classList.toggle('active', b.getAttribute('data-tab') === name);
        });
        document.querySelectorAll('.admin-pane').forEach(function (p) {
            p.style.display = 'none';
        });
        var pane = $('pane-' + name);
        if (pane) pane.style.display = 'block';
        if (name === 'settings') { fillSettings(); updatePublishNote(); }
        if (name === 'orders') { renderOrders(); updateAdminStats(); }
        if (name === 'products') { renderAdminProducts(); updatePublishNote(); }
    }

    /* ---------------- список товаров (по разделам) ---------------- */
    var adminFilter = 'all';
    var collapsedGroups = {};
    var CAT_ORDER = ['entrance', 'interior', 'mirror', 'hardware'];
    var SUBCAT_ORDER = {
        entrance: ['entrance-flat', 'entrance-house'],
        interior: ['', 'hidden'],
        mirror: [''],
        hardware: ['']
    };

    function rowHtml(p) {
        var src = p.image
            ? (localStorage.getItem('photo_' + p.image) || ('images/products/' + p.image + '.jpg'))
            : null;
        var thumb = src
            ? '<img src="' + src + '" alt="" loading="lazy">'
            : '<span class="admin-row-emoji">' + (p.icon || '🚪') + '</span>';
        var sub = [p.brand || '', (p.specs && p.specs[0]) || ''].filter(Boolean).join(' · ');
        return '<div class="admin-row">' +
            '<div class="admin-row-photo">' + thumb + '</div>' +
            '<div class="admin-row-main">' +
                '<div class="admin-row-title">' + esc(p.title) + '</div>' +
                '<div class="admin-row-sub">' + esc(sub) + '</div>' +
            '</div>' +
            '<div class="admin-row-price">' + money(p.price) + '</div>' +
            '<div class="admin-row-actions">' +
                '<button type="button" class="btn btn-secondary" onclick="editProduct(' + p.id + ')">Изменить</button>' +
            '</div>' +
        '</div>';
    }

    function renderAdminChips() {
        var box = $('adminChips');
        if (!box) return;
        var counts = {};
        (products || []).forEach(function (p) { counts[p.category] = (counts[p.category] || 0) + 1; });
        var chips = [['all', 'Все', (products || []).length]];
        CAT_ORDER.forEach(function (c) { chips.push([c, categoryLabel(c), counts[c] || 0]); });
        box.innerHTML = chips.map(function (c) {
            return '<button type="button" class="admin-chip' + (adminFilter === c[0] ? ' active' : '') +
                '" onclick="setAdminFilter(\'' + c[0] + '\')">' + esc(c[1]) +
                ' <span>' + c[2] + '</span></button>';
        }).join('');
    }

    function setAdminFilter(cat) {
        adminFilter = cat;
        renderAdminProducts();
    }

    function toggleAdminGroup(cat) {
        collapsedGroups[cat] = !collapsedGroups[cat];
        renderAdminProducts();
    }

    function renderAdminProducts() {
        var box = $('adminProducts');
        if (!box) return;

        renderAdminChips();

        var q = ($('adminSearch') && $('adminSearch').value || '').trim().toLowerCase();
        var list = (products || []).filter(function (p) {
            if (adminFilter !== 'all' && p.category !== adminFilter) return false;
            if (!q) return true;
            return (p.title || '').toLowerCase().indexOf(q) >= 0 ||
                   (p.brand || '').toLowerCase().indexOf(q) >= 0 ||
                   ((p.specs || []).join(' ')).toLowerCase().indexOf(q) >= 0;
        });

        if (!list.length) {
            box.innerHTML = '<p class="admin-empty">Ничего не найдено</p>';
            return;
        }

        var html = '';
        CAT_ORDER.forEach(function (cat) {
            var items = list.filter(function (p) { return p.category === cat; });
            if (!items.length) return;

            var isCollapsed = !!collapsedGroups[cat];
            html += '<div class="admin-group' + (isCollapsed ? ' is-collapsed' : '') + '">';
            html += '<button type="button" class="admin-group-head" onclick="toggleAdminGroup(\'' + cat + '\')">' +
                        '<span class="admin-group-arrow">▾</span>' +
                        '<span class="admin-group-name">' + esc(categoryLabel(cat)) + '</span>' +
                        '<span class="admin-group-count">' + items.length + '</span>' +
                    '</button>';
            html += '<div class="admin-group-body">';

            var order = (SUBCAT_ORDER[cat] || ['']).slice();
            items.forEach(function (p) {
                var s = p.subcat || '';
                if (order.indexOf(s) < 0) order.push(s);
            });

            order.forEach(function (sub) {
                var group = items.filter(function (p) { return (p.subcat || '') === sub; });
                if (!group.length) return;
                if (sub) {
                    html += '<div class="admin-subgroup-head">' + esc(subcategoryLabel(sub)) +
                            ' <span>' + group.length + '</span></div>';
                }
                html += group.map(rowHtml).join('');
            });

            html += '</div></div>';
        });

        box.innerHTML = html;
    }

    /* ---------------- редактор ---------------- */
    function syncSubcats() {
        var cat = $('pfCategory').value;
        var sel = $('pfSubcat');
        var opts = [['', '—']];
        if (cat === 'entrance') opts = opts.concat([['entrance-flat', 'Для квартиры'], ['entrance-house', 'Для частного дома']]);
        if (cat === 'interior') opts = opts.concat([['hidden', 'Скрытого монтажа']]);
        sel.innerHTML = opts.map(function (o) {
            return '<option value="' + o[0] + '">' + o[1] + '</option>';
        }).join('');
    }

    function togglePrice() {
        var noPrice = $('pfNoPrice').checked;
        $('pfPrice').disabled = noPrice;
        if (noPrice) $('pfPrice').value = '';
    }

    function setPreview(src) {
        var box = $('pfPreview');
        if (!box) return;
        if (src) {
            box.innerHTML = '<img src="' + src + '" alt="">';
            box.classList.add('has-photo');
        } else {
            box.innerHTML = 'фото';
            box.classList.remove('has-photo');
        }
    }

    function editProduct(id) {
        var p = id ? (products || []).find(function (x) { return x.id === id; }) : null;
        currentId = p ? p.id : null;
        pendingPhoto = null;
        pendingSlug = p && p.image ? p.image : null;

        var f = $('productForm');
        f.pfId.value = p ? p.id : '';
        f.pfTitle.value = p ? (p.title || '') : '';
        f.pfBrand.value = p ? (p.brand || '') : '';
        f.pfCategory.value = p ? (p.category || 'entrance') : (adminFilter !== 'all' ? adminFilter : 'entrance');
        syncSubcats();
        f.pfSubcat.value = p && p.subcat ? p.subcat : '';
        f.pfNoPrice.checked = p ? (typeof p.price !== 'number') : false;
        f.pfPrice.value = p && typeof p.price === 'number' ? p.price : '';
        togglePrice();
        f.pfBadge.value = p && p.badge ? p.badge : '';
        f.pfSpec1.value = p && p.specs && p.specs[0] ? p.specs[0] : '';
        f.pfSpec2.value = p && p.specs && p.specs[1] ? p.specs[1] : '';
        f.pfDesc.value = p ? (p.desc || '') : '';

        var src = null;
        if (p && p.image) {
            src = localStorage.getItem('photo_' + p.image) || ('images/products/' + p.image + '.jpg');
        }
        setPreview(src);

        $('adminEditorTitle').textContent = p ? 'Изменить дверь' : 'Новая дверь';
        $('pfDelete').style.display = p ? 'inline-flex' : 'none';
        $('adminEditor').style.display = 'block';
        $('adminEditor').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        f.pfTitle.focus();
    }

    function closeEditor() {
        $('adminEditor').style.display = 'none';
        currentId = null;
        pendingPhoto = null;
        pendingSlug = null;
    }

    function onPhotoPick(e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        photoPending = true;
        var reader = new FileReader();
        reader.onload = function () {
            var img = new Image();
            img.onload = function () {
                var maxH = 1000, maxW = 800;
                var scale = Math.min(maxW / img.width, maxH / img.height, 1);
                var canvas = document.createElement('canvas');
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                var ctx = canvas.getContext('2d');
                ctx.fillStyle = '#fff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                pendingPhoto = canvas.toDataURL('image/jpeg', 0.85);
                setPreview(pendingPhoto);
                photoPending = false;
            };
            img.onerror = function () { photoPending = false; };
            img.src = reader.result;
        };
        reader.onerror = function () { photoPending = false; };
        reader.readAsDataURL(file);
    }

    async function saveProduct(e) {
        e.preventDefault();
        var f = e.target;
        var title = (f.pfTitle.value || '').trim();
        if (!title) return;

        // если фото ещё сжимается — подождать, иначе оно потеряется
        var waited = 0;
        while (photoPending && waited < 4000) {
            await new Promise(function (r) { setTimeout(r, 100); });
            waited += 100;
        }

        var id = currentId || Date.now();
        var slug = pendingSlug || translit(title) || ('door-' + id);
        var priceRaw = (f.pfPrice.value || '').replace(/[^\d]/g, '');
        var product = {
            id: id,
            title: title,
            brand: (f.pfBrand.value || '').trim() || null,
            category: f.pfCategory.value,
            subcat: f.pfSubcat.value || null,
            price: f.pfNoPrice.checked ? null : (priceRaw ? parseInt(priceRaw, 10) : null),
            badge: f.pfBadge.value || null,
            specs: [(f.pfSpec1.value || '').trim(), (f.pfSpec2.value || '').trim()].filter(Boolean),
            desc: (f.pfDesc.value || '').trim(),
            image: pendingPhoto || pendingSlug ? slug : null
        };
        if (!product.image) delete product.image;

        var photo = pendingPhoto;
        var photoSlug = product.image ? slug : null;

        var idx = (products || []).findIndex(function (x) { return x.id === id; });
        if (idx >= 0) products[idx] = Object.assign({}, products[idx], product);
        else products.push(product);

        if (typeof renderProducts === 'function') renderProducts();
        renderAdminProducts();
        closeEditor();

        await publish(photo, photoSlug, (idx >= 0 ? 'Правка товара: ' : 'Новый товар: ') + title);
    }

    function deleteProduct(id) {
        var p = (products || []).find(function (x) { return x.id === id; });
        if (!p) return;
        if (!confirm('Удалить «' + p.title + '» из каталога?')) return;
        products = products.filter(function (x) { return x.id !== id; });
        if (typeof renderProducts === 'function') renderProducts();
        renderAdminProducts();
        publish(null, null, 'Удалён товар: ' + p.title);
    }

    function deleteCurrent() {
        if (currentId) {
            var id = currentId;
            closeEditor();
            deleteProduct(id);
        }
    }

    /* ---------------- вход в панель ---------------- */
    function initAdmin() {
        var panel = $('adminPanel');
        if (!panel || panel.classList.contains('active')) return;
        panel.classList.add('active');
        panel.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        adminTab('products');
        updatePublishNote();
        renderAdminProducts();
    }

    window.adminTab = adminTab;
    window.renderAdminProducts = renderAdminProducts;
    window.setAdminFilter = setAdminFilter;
    window.toggleAdminGroup = toggleAdminGroup;
    window.editProduct = editProduct;
    window.closeEditor = closeEditor;
    window.saveProduct = saveProduct;
    window.deleteProduct = deleteProduct;
    window.deleteCurrent = deleteCurrent;
    window.onPhotoPick = onPhotoPick;
    window.togglePrice = togglePrice;
    window.syncSubcats = syncSubcats;
    window.saveGhSettings = saveGhSettings;
    window.checkGh = checkGh;
    window.initAdmin = initAdmin;
})();

/* Вход в панель: свой пароль (хранится в браузере, по умолчанию admin123) */
(function () {
    'use strict';

    function $id(id) { return document.getElementById(id); }

    window.adminPassword = function () {
        return localStorage.getItem('adminPass') || 'admin123';
    };

    window.changeAdminPass = function () {
        var input = $id('cfgPass');
        var value = (input && input.value || '').trim();
        if (value.length < 4) {
            alert('Пароль должен быть не короче 4 символов');
            return;
        }
        localStorage.setItem('adminPass', value);
        if (input) input.value = '';
        alert('Пароль изменён. Запомните его — восстановить нельзя.');
    };

    window.openAdmin = function () {
        var pass = prompt('Пароль администратора:');
        if (pass === null) return;
        if (pass !== window.adminPassword()) {
            alert('Неверный пароль');
            return;
        }
        if (typeof window.initAdmin === 'function') window.initAdmin();
    };
})();
