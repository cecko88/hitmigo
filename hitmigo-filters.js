
/* Hitmigo — динамични категории и филтри */

(function () {
  "use strict";

  function makeOption(value, label) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    return option;
  }

  function makeSelect(id, placeholder, values) {
    const select = document.createElement("select");
    select.id = id;
    select.style.cssText =
      "width:100%;max-width:300px;padding:12px;margin:8px 0;" +
      "border:1px solid #ccc;border-radius:8px;font-size:16px";

    select.append(makeOption("", placeholder));

    values.forEach(value => {
      select.append(makeOption(value, value));
    });

    return select;
  }

  function makeField(name, definition) {
    const wrapper = document.createElement("div");
    wrapper.style.margin = "10px 0";

    const label = document.createElement("label");
    label.textContent = name;
    label.style.display = "block";

    let field;

    if (Array.isArray(definition)) {
      field = makeSelect("", "Избери " + name, definition);
    } else {
      field = document.createElement("input");
      field.type = definition === "number" ? "number" : "text";
      field.placeholder = name;
      field.style.cssText =
        "width:100%;max-width:300px;padding:12px;" +
        "box-sizing:border-box;border:1px solid #ccc;" +
        "border-radius:8px;font-size:16px";
      if (definition === "number") {
        field.step = "any";
      }
    }

    field.dataset.adAttribute = name;
    wrapper.append(label, field);
    return wrapper;
  }

  function updateCarModels() {
    const brandField = document.querySelector(
      '[data-ad-attribute="Марка"]'
    );
    const modelField = document.querySelector(
      '[data-ad-attribute="Модел"]'
    );

    if (!brandField || !modelField) return;

    const brand = brandField.value;
    const models =
      typeof HITMIGO_CAR_MODELS !== "undefined"
        ? HITMIGO_CAR_MODELS[brand] || []
        : [];

    const modelSelect = makeSelect(
      "",
      "Избери модел",
      models
    );

    modelSelect.dataset.adAttribute = "Модел";

    const otherOption = makeOption(
      "Друг модел",
      "Друг модел"
    );
    modelSelect.append(otherOption);

    modelSelect.addEventListener("change", function () {
      if (this.value === "Друг модел") {
        const custom = document.createElement("input");
        custom.type = "text";
        custom.placeholder = "Въведи модел";
        custom.dataset.adAttribute = "Модел";
        custom.style.cssText =
          "padding:12px;max-width:300px;width:100%;" +
          "box-sizing:border-box";

        this.replaceWith(custom);
      }
    });

    modelField.replaceWith(modelSelect);
  }

  function updateAttributes() {
    const category = document.getElementById("ad-category");
    const container = document.getElementById(
      "ad-attributes-container"
    );

    if (!category || !container) return;

    container.replaceChildren();

    const selected = category.value;
    const filters =
      typeof HITMIGO_FILTERS !== "undefined"
        ? HITMIGO_FILTERS[selected]
        : null;

    if (!filters) return;

    Object.entries(filters).forEach(([name, definition]) => {
      container.append(makeField(name, definition));
    });

    if (selected === "Автомобили") {
      const brandField = document.querySelector(
        '[data-ad-attribute="Марка"]'
      );

      if (brandField) {
        brandField.addEventListener(
          "change",
          updateCarModels
        );
      }
    }
  }

  function updateSubcategories() {
    const category = document.getElementById("ad-category");
    const subcategory = document.getElementById(
      "ad-subcategory"
    );
    const thirdContainer = document.getElementById(
      "ad-subsubcategory-container"
    );

    if (!category || !subcategory || !thirdContainer) {
      return;
    }

    const tree =
      typeof HITMIGO_CATEGORIES !== "undefined"
        ? HITMIGO_CATEGORIES[category.value]
        : null;

    subcategory.replaceChildren();
    subcategory.append(
      makeOption("", "Избери подкатегория")
    );
    thirdContainer.replaceChildren();

    if (tree) {
      Object.keys(tree).forEach(name => {
        subcategory.append(makeOption(name, name));
      });
    }

    updateAttributes();
  }

  function updateThirdLevel() {
    const category = document.getElementById("ad-category");
    const subcategory = document.getElementById(
      "ad-subcategory"
    );
    const container = document.getElementById(
      "ad-subsubcategory-container"
    );

    if (!category || !subcategory || !container) return;

    container.replaceChildren();

    const tree =
      typeof HITMIGO_CATEGORIES !== "undefined"
        ? HITMIGO_CATEGORIES[category.value]
        : null;

    const values = tree
      ? tree[subcategory.value] || []
      : [];

    if (values.length) {
      const select = makeSelect(
        "ad-subsubcategory",
        "Избери вид",
        values
      );
      container.append(select);
    }
  }

  function initHitmigoFilters() {
    const category = document.getElementById("ad-category");
    const subcategory = document.getElementById(
      "ad-subcategory"
    );

    if (!category || !subcategory) return;

    if (typeof HITMIGO_CATEGORIES === "undefined") {
      console.error("Категориите не са заредени.");
      return;
    }

    const previousCategory = category.value;
    category.replaceChildren();
    category.append(makeOption("", "Избери категория"));

    Object.keys(HITMIGO_CATEGORIES).forEach(name => {
      category.append(makeOption(name, name));
    });

    category.value = previousCategory;

    category.addEventListener(
      "change",
      updateSubcategories
    );

    subcategory.addEventListener(
      "change",
      updateThirdLevel
    );

    updateSubcategories();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initHitmigoFilters
    );
  } else {
    initHitmigoFilters();
  }
})();
