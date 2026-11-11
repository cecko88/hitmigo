/* Hitmigo admin panel - isolated preview module. Load only after hitmigo-auth.js. */
(function () {
  "use strict";
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
  async function mount(container) {
    if (!container || typeof db === "undefined") return;
    const { data: auth, error: authError } = await db.auth.getUser();
    if (authError || !auth?.user) { container.textContent = "Влез в профила си."; return; }
    const { data: isAdmin, error: roleError } = await db.rpc("is_hitmigo_admin");
    if (roleError || isAdmin !== true) {
      container.textContent = "Нямаш администраторски достъп.";
      return;
    }
    container.innerHTML = '<h2>Управление на обяви</h2><button type="button" data-refresh>Обнови списъка</button><p data-status>Зареждане…</p><div data-ads></div><nav aria-label="Страници на обявите"><button type="button" data-prev>Предишна</button> <span data-page></span> <button type="button" data-next>Следваща</button></nav>';
    const status = container.querySelector("[data-status]");
    const list = container.querySelector("[data-ads]");
    const pageSize = 25;
    let page = 0;
    let requestId = 0;
    const prev = container.querySelector("[data-prev]");
    const next = container.querySelector("[data-next]");
    const pageLabel = container.querySelector("[data-page]");
    container.querySelector("[data-refresh]").addEventListener("click", () => refresh());
    prev.addEventListener("click", () => { if (page > 0) { page--; refresh(); } });
    next.addEventListener("click", () => { if (!next.disabled) { page++; refresh(); } });
    async function refresh() {
      const currentRequest = ++requestId;
      prev.disabled = next.disabled = true;
      status.textContent = "Зареждане…";
      const { data, error, count } = await db.from("ads")
        .select("id,title,city,is_hidden,created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      if (currentRequest !== requestId) return;
      if (error) { status.textContent = "Грешка при зареждане: " + error.message; prev.disabled = page === 0; return; }
      if (!Array.isArray(data)) { status.textContent = "Няма достъпни данни за обявите."; return; }
      const total = typeof count === "number" ? count : null;
      if (data.length === 0 && page > 0) { page--; await refresh(); return; }
      status.textContent = total === null ? "Показани " + data.length + " обяви" : "Общо " + total + " обяви";
      pageLabel.textContent = "Страница " + (page + 1) + (total === null ? "" : " от " + Math.max(1, Math.ceil(total / pageSize)));
      prev.disabled = page === 0;
      next.disabled = total === null ? data.length < pageSize : (page + 1) * pageSize >= total;
      list.innerHTML = data.map(ad =>
        '<article style="padding:12px;border-bottom:1px solid #ddd">' +
        '<strong>' + escapeHtml(ad.title) + '</strong> — ' + escapeHtml(ad.city) +
        ' <span>' + (ad.is_hidden ? "Скрита" : "Видима") + '</span> ' +
        '<button type="button" data-id="' + escapeHtml(ad.id) + '" data-hidden="' + (ad.is_hidden ? "false" : "true") + '">' +
        (ad.is_hidden ? "Възстанови" : "Скрий") + '</button></article>'
      ).join("");
    }
    list.addEventListener("click", async (event) => {
      const button = event.target.closest("button[data-id]");
      if (!button || button.disabled) return;
      const hidden = button.dataset.hidden === "true";
      if (!confirm(hidden ? "Да скрия ли тази обява?" : "Да възстановя ли тази обява?")) return;
      button.disabled = true;
      let result;
      try { result = await db.rpc("admin_set_ad_hidden", {
        p_ad_id: button.dataset.id, p_hidden: hidden
      }); } catch (err) { result = { error: err }; }
      const { error } = result;
      if (error) { status.textContent = "Грешка: " + error.message; button.disabled = false; return; }
      await refresh();
    });
    await refresh();
  }
  window.HitmigoAdmin = { mount };
})();
