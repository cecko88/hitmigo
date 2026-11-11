
/*
 * HITMIGO — Публикуване и показване на обяви
 * Версия 6
 *
 * Работи със съществуващата таблица public.ads.
 * Подкатегорията и видът се пазят в attributes.
 */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  function getDb() {
    if (typeof db === "undefined") {
      throw new Error("Връзката със Supabase не е заредена.");
    }
    return db;
  }

  function getValue(id) {
    const element = $(id);
    return element ? element.value.trim() : "";
  }

  function getAttributeValues() {
    const attributes = {};

    document.querySelectorAll("[data-ad-attribute]")
      .forEach((element) => {
        /*
         * Взимаме само активните полета.
         * Скритите полета не трябва да се записват.
         */
        if (
          element.disabled ||
          !element.isConnected ||
          element.closest("[hidden]")
        ) {
          return;
        }

        const key = element.dataset.adAttribute;
        const value = String(element.value || "").trim();

        if (key && value) {
          attributes[key] = value;
        }
      });

    const subcategory = getValue("ad-subcategory");
    const subsubcategory = getValue("ad-subsubcategory");

    if (subcategory) {
      attributes["Подкатегория"] = subcategory;
    }

    const thirdContainer =
      $("ad-subsubcategory-container");

    if (
      subsubcategory &&
      thirdContainer &&
      getComputedStyle(thirdContainer).display !== "none"
    ) {
      attributes["Вид"] = subsubcategory;
    }

    return attributes;
  }

  async function uploadImage(client, userId) {
    const imageInput = $("ad-image");

    if (
      !imageInput ||
      !imageInput.files ||
      !imageInput.files.length
    ) {
      return null;
    }

    const file = imageInput.files[0];

    if (!file.type.startsWith("image/")) {
      throw new Error("Можеш да качваш само снимки.");
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new Error(
        "Снимката трябва да е по-малка от 10 MB."
      );
    }

    const extension = (
      file.name.split(".").pop() || "jpg"
    ).toLowerCase().replace(/[^a-z0-9]/g, "");

    const allowedExtensions = [
      "jpg", "jpeg", "png", "webp", "gif", "heic"
    ];

    const safeExtension =
      allowedExtensions.includes(extension)
        ? extension
        : "jpg";

    const uniqueId =
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Date.now() + "-" +
          Math.random().toString(36).slice(2);

    const filePath =
      userId + "/" + uniqueId + "." + safeExtension;

    const { error } = await client.storage
      .from("ad-images")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      throw new Error(
        "Грешка при качване на снимката: " +
        error.message
      );
    }

    const { data } = client.storage
      .from("ad-images")
      .getPublicUrl(filePath);

    return data ? data.publicUrl : null;
  }

  let publishing = false;

  async function publishAd() {
    if (publishing) return;

    const title = getValue("ad-title");
    const description = getValue("ad-description");
    const priceText = getValue("ad-price");
    const category = getValue("ad-category");
    const city = getValue("ad-city");

    if (!title) {
      alert("Въведи заглавие на обявата.");
      return;
    }

    if (!description) {
      alert("Въведи описание на обявата.");
      return;
    }

    if (priceText === "") {
      alert("Въведи цена. За безплатна обява напиши 0.");
      return;
    }

    const price = Number(priceText);

    if (!Number.isFinite(price) || price < 0) {
      alert("Въведи валидна цена.");
      return;
    }

    if (!category) {
      alert("Избери категория.");
      return;
    }

    if (!city) {
      alert("Въведи град.");
      return;
    }

    const publishButton = $("ad-submit-button");

    try {
      publishing = true;

      if (publishButton) {
        publishButton.disabled = true;
        publishButton.textContent = "Публикуване...";
      }

      const client = getDb();

      const { data: authData, error: authError } =
        await client.auth.getUser();

      if (authError || !authData || !authData.user) {
        throw new Error(
          "Трябва да влезеш в профила си, за да публикуваш."
        );
      }

      const user = authData.user;
      const attributes = getAttributeValues();

      /*
       * Колоните car_brand и car_model
       * се използват само за автомобилни обяви.
       */
      const carBrand =
        category === "Автомобили"
          ? attributes["Марка"] || null
          : null;

      const carModel =
        category === "Автомобили"
          ? attributes["Модел"] || null
          : null;

      const imageUrl = await uploadImage(
        client,
        user.id
      );

      const ad = {
        user_id: user.id,
        title: title,
        description: description,
        price: price,
        category: category,
        city: city,
        image_url: imageUrl,
        car_brand: carBrand,
        car_model: carModel,
        attributes: attributes
      };

      const { error: insertError } = await client
        .from("ads")
        .insert(ad);

      if (insertError) {
        throw new Error(
          "Грешка при публикуване: " +
          insertError.message
        );
      }

      alert("Обявата е публикувана успешно!");

      [
        "ad-title",
        "ad-description",
        "ad-price",
        "ad-city",
        "ad-image"
      ].forEach((id) => {
        const element = $(id);
        if (element) element.value = "";
      });

      const categorySelect = $("ad-category");

      if (categorySelect) {
        categorySelect.value = "";
        categorySelect.dispatchEvent(
          new Event("change", { bubbles: true })
        );
      }

      await loadAds();
      await loadMyAds();

    } catch (error) {
      console.error("Hitmigo publish error:", error);

      alert(
        error.message ||
        "Възникна грешка при публикуването."
      );
    } finally {
      publishing = false;

      if (publishButton) {
        publishButton.disabled = false;
        publishButton.textContent = "Публикувай обява";
      }
    }
  }

  function formatPrice(value) {
    const price = Number(value);

    if (!Number.isFinite(price)) {
      return "Цена по договаряне";
    }

    if (price === 0) {
      return "Безплатно";
    }

    return new Intl.NumberFormat("bg-BG", {
      style: "currency",
      currency: "EUR"
    }).format(price);
  }

  function getSearchText() {
    const search = $("ads-search");

    return search
      ? search.value.trim().toLocaleLowerCase("bg")
      : "";
  }

  function matchesSearch(ad, search) {
    if (!search) return true;

    const attributes =
      ad.attributes &&
      typeof ad.attributes === "object"
        ? ad.attributes
        : {};

    const text = [
      ad.title,
      ad.description,
      ad.category,
      ad.city,
      attributes["Подкатегория"],
      attributes["Вид"],
      ad.car_brand,
      ad.car_model
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("bg");

    return text.includes(search);
  }

  function matchesCategory(ad) {
    const selectedCategory =
      window.hitmigoBrowseCategory || "";

    if (!selectedCategory) {
      return true;
    }

    return ad.category === selectedCategory;
  }

  function matchesSubcategory(ad) {
    const selectedSubcategory =
      window.hitmigoBrowseSubcategory || "";

    if (!selectedSubcategory) {
      return true;
    }

    const attributes =
      ad.attributes &&
      typeof ad.attributes === "object"
        ? ad.attributes
        : {};

    return (
      attributes["Подкатегория"] ===
      selectedSubcategory
    );
  }

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (text !== undefined && text !== null) {
      element.textContent = String(text);
    }

    return element;
  }

  // Reports are submitted by authenticated users; RLS validates ownership and status.
  async function reportAd(adId, button) {
    const client = getDb();
    const { data: auth, error: authError } = await client.auth.getUser();
    if (authError || !auth?.user) {
      alert("Влез в профила си, за да докладваш обява.");
      return;
    }
    const reason = prompt("Опиши причината за сигнала (10–500 символа):");
    if (reason === null) return;
    const trimmed = reason.trim();
    if (trimmed.length < 10 || trimmed.length > 500) {
      alert("Причината трябва да е между 10 и 500 символа.");
      return;
    }
    button.disabled = true;
    try {
      const { error } = await client.from("ad_reports").insert({
        ad_id: adId,
        reporter_id: auth.user.id,
        reason: trimmed
      });
      if (error) {
        if (error.code === "23505") {
          alert("Вече си докладвал тази обява.");
        } else {
          throw error;
        }
      } else {
        alert("Сигналът е изпратен. Обявата няма да бъде скрита автоматично.");
      }
    } catch (error) {
      alert("Неуспешно изпращане на сигнал: " + (error.message || "Опитай отново."));
    } finally {
      button.disabled = false;
    }
  }

  function renderAd(ad) {
    const card = makeElement("article", "ad-card");

    if (ad.image_url) {
      const image = document.createElement("img");
      image.src = ad.image_url;
      image.alt = ad.title || "Снимка на обява";
      image.loading = "lazy";
      image.referrerPolicy = "no-referrer";

      image.onerror = () => {
        image.remove();
      };

      card.appendChild(image);
    }

    const heading = makeElement(
      "h3",
      "",
      ad.title || "Обява"
    );

    const price = makeElement(
      "p",
      "ad-price",
      formatPrice(ad.price)
    );

    price.style.fontWeight = "bold";
    price.style.color = "#1565c0";
    price.style.fontSize = "19px";

    const attributes =
      ad.attributes &&
      typeof ad.attributes === "object"
        ? ad.attributes
        : {};

    const categoryParts = [
      ad.category,
      attributes["Подкатегория"],
      attributes["Вид"]
    ].filter(Boolean);

    const categoryInfo = makeElement(
      "p",
      "ad-category-info",
      categoryParts.join(" › ")
    );

    categoryInfo.style.color = "#546477";
    categoryInfo.style.fontSize = "14px";

    const city = makeElement(
      "p",
      "ad-city",
      "📍 " + (ad.city || "Неизвестен град")
    );

    const description = makeElement(
      "p",
      "ad-description",
      ad.description || ""
    );

    card.append(
      heading,
      price,
      categoryInfo,
      city,
      description
    );

    /*
     * Показваме най-важните характеристики.
     */
    const excludedKeys = [
      "Подкатегория",
      "Вид"
    ];

    const details = Object.entries(attributes)
      .filter(([key, value]) => {
        return (
          !excludedKeys.includes(key) &&
          value !== null &&
          value !== undefined &&
          String(value).trim() !== ""
        );
      })
      .slice(0, 8);

    if (details.length) {
      const detailsBox = makeElement(
        "div",
        "ad-details"
      );

      detailsBox.style.fontSize = "14px";
      detailsBox.style.color = "#435268";

      details.forEach(([key, value]) => {
        const line = makeElement(
          "p",
          "",
          key + ": " + value
        );

        line.style.margin = "5px 0";
        detailsBox.appendChild(line);
      });

      card.appendChild(detailsBox);
    }

    const reportButton = makeElement("button", "secondary-button", "⚑ Докладвай");
    reportButton.type = "button";
    reportButton.setAttribute("aria-label", "Докладвай обява: " + (ad.title || ""));
    reportButton.addEventListener("click", () => reportAd(ad.id, reportButton));
    card.appendChild(reportButton);

    return card;
  }

  let loadRequestNumber = 0;

  async function loadAds() {
    const container = $("ads-list");

    if (!container) return;

    const currentRequest = ++loadRequestNumber;

    container.textContent = "Зареждане на обявите...";

    try {
      const client = getDb();

      const { data, error } = await client
        .from("ads")
        .select(
          "id,title,description,price,category,city," +
          "image_url,car_brand,car_model,attributes"
        )
        .order("created_at", {
          ascending: false
        })
        .limit(200);

      if (currentRequest !== loadRequestNumber) {
        return;
      }

      if (error) {
        throw new Error(error.message);
      }

      const search = getSearchText();

      const ads = (data || []).filter((ad) => {
        return (
          matchesCategory(ad) &&
          matchesSubcategory(ad) &&
          matchesSearch(ad, search)
        );
      });

      container.replaceChildren();

      if (!ads.length) {
        const message = makeElement(
          "p",
          "notice",
          "Няма намерени обяви по избраните критерии."
        );

        container.appendChild(message);
        return;
      }

      ads.forEach((ad) => {
        container.appendChild(renderAd(ad));
      });

    } catch (error) {
      if (currentRequest !== loadRequestNumber) {
        return;
      }

      console.error("Hitmigo load error:", error);

      container.textContent =
        "Не успяхме да заредим обявите. " +
        (error.message || "Опитай отново.");
    }
  }

  /*
   * Публични функции за бутоните
   * и филтрите в index.html.
   */

  // VIP preview is informational only. Activation must be enforced by a server RPC.
  async function renderVipTrialPreview(client, user, box) {
    const notice = makeElement("div", "vip-trial-preview", "");
    notice.setAttribute("role", "status");
    notice.textContent = "Проверка на пробния VIP период...";
    box.appendChild(notice);

    const signupMs = Date.parse(user.created_at || "");
    if (!Number.isFinite(signupMs)) {
      notice.textContent = "VIP: началната дата не може да бъде потвърдена.";
      return;
    }
    const expiresMs = signupMs + 30 * 24 * 60 * 60 * 1000;
    const { count, error } = await client.from("vip_activations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    if (error || count == null) {
      notice.textContent = "VIP: историята на активациите не е достъпна. Пробната услуга още не е активирана.";
      return;
    }
    const remainingDays = Math.max(0, Math.ceil((expiresMs - Date.now()) / 86400000));
    notice.textContent = "VIP (информация, неактивна услуга): " +
      (remainingDays ? remainingDays + " дни до края на 30-дневния период." : "30-дневният период е изтекъл.") +
      " Отчетени активации: " + count + ". Лимит: 3 общо. " +
      "Окончателното право на активация ще се проверява от сървъра.";
  }

  async function loadMyAds() {
    const box = $("my-ads-list");
    if (!box) return;
    box.textContent = "Зареждане...";
    const client = getDb();
    const { data: auth, error: authError } = await client.auth.getUser();
    if (authError || !auth?.user) { box.replaceChildren(); return; }
    const { data, error } = await client.from("ads")
      .select("id,title,description,price,category,city,image_url,attributes")
      .eq("user_id", auth.user.id).order("created_at", { ascending: false }).limit(200);
    if (error) { box.textContent = "Грешка: " + error.message; return; }
    box.replaceChildren();
    await renderVipTrialPreview(client, auth.user, box);
    if (!data?.length) { box.appendChild(makeElement("p", "", "Все още нямаш обяви.")); return; }
    for (const ad of data) {
      const card = renderAd(ad);
      const edit = makeElement("button", "", "Редактирай");
      edit.type = "button";
      edit.addEventListener("click", () => editMyAd(ad));
      const remove = makeElement("button", "secondary-button", "Изтрий");
      remove.type = "button";
      remove.addEventListener("click", () => deleteMyAd(ad));
      card.append(edit, document.createTextNode(" "), remove);
      box.appendChild(card);
    }
  }


  let editingAd = null;
  let savingEdit = false;
  let removeExistingPhoto = false;

  function setField(id, value) {
    const element = $(id);
    if (element) element.value = value ?? "";
  }

  function populateAttributes(attributes) {
    document.querySelectorAll("[data-ad-attribute]").forEach(element => {
      const key = element.dataset.adAttribute;
      const value = attributes[key];
      if (value == null) return;
      if (element.tagName === "SELECT" && !Array.from(element.options).some(o => o.value === String(value))) return;
      element.value = String(value);
      element.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  function resetEditState() {
    editingAd = null;
    removeExistingPhoto = false;
    const submit = $("ad-submit-button");
    if (submit) submit.textContent = "Публикувай обява";
    $("ad-cancel-edit")?.classList.add("hidden");
    $("ad-existing-image")?.classList.add("hidden");
    setField("ad-image", "");
    $("publish-section")?.querySelector("h2")?.replaceChildren(document.createTextNode("Публикувай обява"));
  }

  function cancelAdEdit() {
    resetEditState();
    ["ad-title","ad-description","ad-price","ad-city"].forEach(id => setField(id, ""));
    setField("ad-category", "");
    $("ad-category")?.dispatchEvent(new Event("change", { bubbles: true }));
  }

  async function editMyAd(ad) {
    try {
      const client = getDb();
      const { data: auth, error: authError } = await client.auth.getUser();
      if (authError || !auth?.user) throw new Error("Влез в профила си.");
      const { data: current, error } = await client.from("ads")
        .select("id,title,description,price,category,city,image_url,attributes")
        .eq("id", ad.id).eq("user_id", auth.user.id).single();
      if (error || !current) throw error || new Error("Обявата не е намерена.");
      editingAd = current;
      removeExistingPhoto = false;
      setField("ad-title", current.title);
      setField("ad-description", current.description);
      setField("ad-price", current.price);
      setField("ad-city", current.city);
      setField("ad-category", current.category);
      $("ad-category")?.dispatchEvent(new Event("change", { bubbles: true }));
      const attributes = current.attributes || {};
      setField("ad-subcategory", attributes["Подкатегория"]);
      $("ad-subcategory")?.dispatchEvent(new Event("change", { bubbles: true }));
      setField("ad-subsubcategory", attributes["Вид"]);
      populateAttributes(attributes);
      setField("ad-image", "");
      const imageBox = $("ad-existing-image");
      if (imageBox) {
        imageBox.replaceChildren();
        if (current.image_url) {
          const img = document.createElement("img");
          img.src = current.image_url;
          img.alt = "Текуща снимка";
          img.style.cssText = "max-width:180px;max-height:180px;object-fit:contain;display:block;margin:8px 0";
          const remove = document.createElement("button");
          remove.type = "button";
          remove.className = "secondary-button";
          remove.textContent = "Премахни снимката";
          remove.addEventListener("click", () => {
            removeExistingPhoto = true;
            img.remove();
            remove.remove();
            imageBox.append("Снимката ще бъде премахната при запазване.");
          });
          imageBox.append(img, remove);
          imageBox.classList.remove("hidden");
        } else imageBox.classList.add("hidden");
      }
      $("publish-section").querySelector("h2").textContent = "Редактирай обява";
      $("ad-submit-button").textContent = "Запази промените";
      $("ad-cancel-edit").classList.remove("hidden");
      $("publish-section").scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      alert("Неуспешно отваряне на обявата: " + error.message);
    }
  }

  async function saveAdEdit() {
    if (!editingAd || savingEdit) return;
    const title = getValue("ad-title");
    const description = getValue("ad-description");
    const priceText = getValue("ad-price");
    const category = getValue("ad-category");
    const city = getValue("ad-city");
    const price = Number(priceText);
    if (!title || !description || !city || !category || !priceText ||
        !Number.isFinite(price) || price < 0) {
      alert("Попълни правилно заглавие, описание, цена, категория и град.");
      return;
    }
    const button = $("ad-submit-button");
    savingEdit = true;
    button.disabled = true;
    button.textContent = "Запазване...";
    try {
      const client = getDb();
      const { data: auth, error: authError } = await client.auth.getUser();
      if (authError || !auth?.user) throw new Error("Влез в профила си.");
      const attributes = getAttributeValues();
      let imageUrl = removeExistingPhoto ? null : editingAd.image_url;
      if ($("ad-image")?.files?.length) imageUrl = await uploadImage(client, auth.user.id);
      const changes = {
        title, description, price, category, city,
        attributes, image_url: imageUrl,
        car_brand: category === "Автомобили" ? attributes["Марка"] || null : null,
        car_model: category === "Автомобили" ? attributes["Модел"] || null : null
      };
      const { data, error } = await client.from("ads").update(changes)
        .eq("id", editingAd.id).eq("user_id", auth.user.id).select("id");
      if (error) throw error;
      if (!data?.length) throw new Error("Обявата не е намерена или нямаш право да я редактираш.");
      cancelAdEdit();
      await Promise.all([loadMyAds(), loadAds()]);
      alert("Промените са запазени успешно.");
    } catch (error) {
      alert("Неуспешно запазване: " + error.message);
    } finally {
      savingEdit = false;
      button.disabled = false;
      button.textContent = editingAd ? "Запази промените" : "Публикувай обява";
    }
  }

  function submitAdForm() {
    return editingAd ? saveAdEdit() : publishAd();
  }
  window.submitAdForm = submitAdForm;
  window.cancelAdEdit = cancelAdEdit;

  async function deleteMyAd(ad) {
    if (!confirm("Сигурен ли си, че искаш да изтриеш обявата „" + ad.title + "“?")) return;
    try {
      const client = getDb();
      const { data: auth, error: authError } = await client.auth.getUser();
      if (authError || !auth?.user) throw new Error("Влез в профила си.");
      const { data, error } = await client.from("ads").delete()
        .eq("id", ad.id).eq("user_id", auth.user.id).select("id");
      if (error) throw error;
      if (!data?.length) throw new Error("Обявата не е намерена или нямаш право да я изтриеш.");
      await Promise.all([loadMyAds(), loadAds()]);
      alert("Обявата е изтрита. Снимката може да остане в хранилището.");
    } catch (error) { alert("Неуспешно изтриване: " + error.message); }
  }
  window.loadMyAds = loadMyAds;

  window.publishAd = publishAd;
  window.loadAds = loadAds;
})();
        
