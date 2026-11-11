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
    container.innerHTML = '<h2>Статистика</h2><section aria-label="Статистика на сайта" data-stats><p data-stat-ads>Обяви: зареждане…</p><p data-stat-active>Видими обяви: зареждане…</p><p data-stat-hidden>Скрити обяви: зареждане…</p><p data-stat-new>Нови обяви за 7 дни: зареждане…</p><p>Регистрирани потребители: очаква защитена сървърна статистика</p><p>Посещения: очаква свързване на аналитична услуга</p><p>VIP: очаква завършена VIP система</p></section><h2>Управление на обяви</h2><button type="button" data-refresh>Обнови списъка</button><p data-status>Зареждане…</p><section aria-label="Сигнали за обяви"><h3>Докладвани обяви</h3><p data-reports-status>Зареждане…</p><div data-reports></div></section><div data-ads></div><nav aria-label="Страници на обявите"><button type="button" data-prev>Предишна</button> <span data-page></span> <button type="button" data-next>Следваща</button></nav>';
    const status = container.querySelector("[data-status]");
    const list = container.querySelector("[data-ads]");
    const reportsStatus = container.querySelector("[data-reports-status]");
    const reportsList = container.querySelector("[data-reports]");
    const pageSize = 25;
    let page = 0;
    let requestId = 0;
    const prev = container.querySelector("[data-prev]");
    const next = container.querySelector("[data-next]");
    const pageLabel = container.querySelector("[data-page]");
    container.querySelector("[data-refresh]").addEventListener("click", () => { refreshStats(); refreshReports(); refresh(); });
    prev.addEventListener("click", () => { if (page > 0) { page--; refresh(); } });
    next.addEventListener("click", () => { if (!next.disabled) { page++; refresh(); } });
    async function refreshStats() {
      const since = new Date(Date.now() - 7 * 86400000).toISOString();
      const queries = [
        db.from("ads").select("id", { count: "exact", head: true }),
        db.from("ads").select("id", { count: "exact", head: true }).eq("is_hidden", false),
        db.from("ads").select("id", { count: "exact", head: true }).eq("is_hidden", true),
        db.from("ads").select("id", { count: "exact", head: true }).gte("created_at", since)
      ];
      const selectors = ["[data-stat-ads]", "[data-stat-active]", "[data-stat-hidden]", "[data-stat-new]"];
      const labels = ["Общо обяви", "Видими обяви", "Скрити обяви", "Нови обяви за 7 дни"];
      const results = await Promise.allSettled(queries);
      results.forEach((result, i) => {
        const value = result.status === "fulfilled" ? result.value : null;
        container.querySelector(selectors[i]).textContent = labels[i] + ": " +
          (value && !value.error && typeof value.count === "number" ? value.count : "няма достъп до данните");
      });
    }
    async function refreshReports() {
      reportsStatus.textContent = "Зареждане на сигналите…";
      const { data: reports, error } = await db.from("ad_reports")
        .select("ad_id,reason,created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) { reportsStatus.textContent = "Грешка при сигналите: " + error.message; return; }
      if (!reports?.length) { reportsStatus.textContent = "Няма необработени сигнали."; reportsList.replaceChildren(); return; }
      const grouped = new Map();
      for (const report of reports) {
        const item = grouped.get(report.ad_id) || { id: report.ad_id, count: 0, latest: report };
        item.count++;
        grouped.set(report.ad_id, item);
      }
      const ids = Array.from(grouped.keys());
      const { data: ads, error: adsError } = await db.from("ads")
        .select("id,title,is_hidden").in("id", ids);
      if (adsError) { reportsStatus.textContent = "Грешка при обявите: " + adsError.message; return; }
      const titles = new Map((ads || []).map(ad => [ad.id, ad]));
      reportsStatus.textContent = "Необработени сигнали: " + reports.length + (reports.length === 500 ? " (показани са най-новите 500)" : "");
      reportsList.innerHTML = Array.from(grouped.values()).map(item => {
        const ad = titles.get(item.id);
        return '<article style="padding:12px;margin:8px 0;border:2px solid #c62828;border-radius:8px;background:#fff3f3;color:#681717">' +
          '<strong>⚑ ' + escapeHtml(ad?.title || "Обява " + item.id) + '</strong> — ' +
          item.count + ' сигнал(а)' + (ad?.is_hidden ? ' — Скрита' : '') +
          '<p>Последен сигнал: ' + escapeHtml(item.latest.reason) + '</p></article>';
      }).join("");
    }
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
      await refreshReports();
    });
    await refreshStats();
    await refreshReports();
    await refresh();
  }
  window.HitmigoAdmin = { mount };
})();
