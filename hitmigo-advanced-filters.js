
/*
 * HITMIGO — Разширени филтри
 * Зарежда се СЛЕД hitmigo-filters.js.
 * Запазва съществуващия каталог с марки и модели.
 */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const category = $("ad-category");
  const subcategory = $("ad-subcategory");
  const attributesContainer = $("ad-attributes-container");

  if (!category || !subcategory || !attributesContainer) {
    return;
  }

  const EXTRA_FILTERS = {
    "Автомобили": {
      "Леки автомобили": {
        "Брой врати": ["2", "3", "4", "5"],
        "Задвижване": [
          "Предно", "Задно", "4x4"
        ],
        "Регистрация": [
          "Регистриран", "Нов внос",
          "Без регистрация"
        ]
      },

      "Джипове и SUV": {
        "Задвижване": [
          "Предно", "Задно", "4x4"
        ],
        "Брой врати": ["3", "5"],
        "Регистрация": [
          "Регистриран", "Нов внос",
          "Без регистрация"
        ]
      },

      "Мотоциклети": {
        "Тип двигател": [
          "Двутактов", "Четиритактов",
          "Електрически"
        ],
        "Регистрация": [
          "Регистриран", "Без регистрация"
        ]
      },

      "Бусове": {
        "Товароносимост (кг)": "number",
        "Брой места": "number"
      },

      "Камиони": {
        "Товароносимост (кг)": "number",
        "Брой оси": "number"
      },

      "Авточасти": {
        "Марка на автомобила": "text",
        "Модел на автомобила": "text",
        "Година от": "number",
        "Година до": "number",
        "Вид част": [
          "Оригинална", "Афтърмаркет"
        ]
      },

      "Гуми и джанти": {
        "Ширина на гумата": "number",
        "Профил на гумата": "number",
        "Диаметър (цола)": "number",
        "Сезон": [
          "Летни", "Зимни", "Всесезонни"
        ],
        "Брой": ["1", "2", "3", "4", "5+"],
        "Размер джанти (цола)": "number",
        "Междуболтово разстояние": "text"
      },

      "Автоаксесоари": {
        "Съвместимост": "text"
      }
    },

    "Имоти": {
      "Апартаменти": {
        "Брой стаи": "number",
        "Асансьор": ["Да", "Не"],
        "Тераса": ["Да", "Не"]
      },

      "Къщи": {
        "Двор (м²)": "number",
        "Брой стаи": "number",
        "Гараж": ["Да", "Не"]
      },

      "Парцели": {
        "В регулация": ["Да", "Не"],
        "Ток": ["Да", "Не"],
        "Вода": ["Да", "Не"]
      },

      "Нощувки и ваканционни имоти": {
        "Цена на нощувка (€)": "number",
        "Брой гости": "number",
        "Брой спални": "number",
        "Паркинг": ["Да", "Не"],
        "Wi-Fi": ["Да", "Не"],
        "Домашни любимци": [
          "Разрешени", "Не са разрешени"
        ]
      }
    },

    "Техника": {
      "Телефони": {
        "Операционна система": [
          "Android", "iOS", "Друга"
        ],
        "Батерия (%)": "number",
        "Две SIM карти": ["Да", "Не"]
      },

      "Компютри": {
        "Процесор": "text",
        "Видеокарта": "text",
        "SSD (GB)": "number"
      },

      "Телевизори": {
        "Резолюция": [
          "HD", "Full HD", "4K", "8K"
        ],
        "Smart TV": ["Да", "Не"]
      },

      "Климатици": {
        "Инверторен": ["Да", "Не"],
        "Отопление": ["Да", "Не"]
      },

      "Големи електроуреди": {
        "Тип монтаж": [
          "Свободностоящ", "За вграждане"
        ],
        "Капацитет (кг)": "number"
      },

      "Малки кухненски уреди": {
        "Мощност (W)": "number"
      },

      "Уреди за дома": {
        "Мощност (W)": "number"
      }
    },

    "Мода": {
      "Мъжки обувки": {
        "Вид обувки": [
          "Спортни", "Ежедневни",
          "Официални", "Други"
        ]
      },
      "Дамски обувки": {
        "Вид обувки": [
          "Спортни", "Ежедневни",
          "Официални", "Други"
        ]
      },
      "Детски дрехи": {
        "Възраст": "text"
      },
      "Детски обувки": {
        "Възраст": "text"
      },
      "Часовници и бижута": {
        "Вид": [
          "Часовник", "Пръстен",
          "Колие", "Гривна",
          "Обеци", "Друго"
        ]
      }
    },

    "За дома": {
      "Мебели": {
        "Сглобено": ["Да", "Не"]
      },
      "Градина": {
        "Предназначение": [
          "За дома", "За професионална употреба"
        ]
      }
    },

    "Работа": {
      "Образование": [
        "Основно", "Средно",
        "Професионално", "Висше",
        "Без изискване"
      ],
      "Шофьорска книжка": [
        "Не се изисква", "B", "C", "D", "CE"
      ]
    },

    "Услуги": {
      "Работа през уикенда": ["Да", "Не"],
      "Издава фактура": ["Да", "Не"]
    },

    "За бебето и детето": {
      "Столчета за кола": {
        "Група": [
          "0", "0+", "1", "2", "3",
          "i-Size"
        ],
        "ISOFIX": ["Да", "Не"]
      },
      "Колички": {
        "Сгъваема": ["Да", "Не"],
        "Комплект": [
          "Само количка", "2 в 1", "3 в 1"
        ]
      }
    },

    "Животни": {
      "Обезпаразитено": ["Да", "Не"],
      "Чипирано": ["Да", "Не"]
    },

    "Спорт и хоби": {
      "Колела и велосипеди": {
        "Размер рамка": "text",
        "Размер гуми (цола)": "number",
        "Брой скорости": "number"
      }
    },

    "Селско стопанство": {
      "Селскостопански животни": {
        "Пол": ["Мъжки", "Женски"],
        "Възраст (месеци)": "number",
        "Брой животни": "number"
      },
      "Продукция": {
        "Мерна единица": [
          "кг", "тон", "литър", "брой"
        ],
        "Произход": "text"
      }
    }
  };

  function createField(label, type) {
    const wrapper = document.createElement("div");
    wrapper.className = "hitmigo-extra-field";

    const title = document.createElement("label");
    title.textContent = label;
    title.style.display = "block";
    title.style.marginBottom = "5px";

    let field;

    if (Array.isArray(type)) {
      field = document.createElement("select");

      const empty = document.createElement("option");
      empty.value = "";
      empty.textContent = "Избери " + label.toLowerCase();
      field.appendChild(empty);

      type.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        field.appendChild(option);
      });
    } else {
      field = document.createElement("input");
      field.type = type === "number" ? "number" : "text";

      if (type === "number") {
        field.min = "0";
        field.step = "any";
      }

      field.placeholder = label;
    }

    field.dataset.adAttribute = label;
    field.style.width = "100%";
    field.style.boxSizing = "border-box";

    wrapper.appendChild(title);
    wrapper.appendChild(field);

    return wrapper;
  }

  function getExtraFields() {
    const categoryName = category.value;
    const subcategoryName = subcategory.value;

    const config = EXTRA_FILTERS[categoryName];

    if (!config) return {};

    const categoryWide = {};
    const specific = {};

    Object.entries(config).forEach(([key, value]) => {
      if (typeof value === "string" || Array.isArray(value)) {
        categoryWide[key] = value;
      }
    });

    if (
      subcategoryName &&
      config[subcategoryName] &&
      typeof config[subcategoryName] === "object"
    ) {
      Object.assign(specific, config[subcategoryName]);
    }

    return { ...categoryWide, ...specific };
  }

  function renderExtraFields() {
    let extraContainer = $("hitmigo-extra-attributes");

    if (!extraContainer) {
      extraContainer = document.createElement("div");
      extraContainer.id = "hitmigo-extra-attributes";
      extraContainer.style.display = "grid";
      extraContainer.style.gap = "10px";
      extraContainer.style.marginTop = "12px";

      attributesContainer.insertAdjacentElement(
        "afterend",
        extraContainer
      );
    }

    extraContainer.replaceChildren();

    const fields = getExtraFields();

    Object.entries(fields).forEach(([label, type]) => {
      /*
       * Не създаваме повторно поле,
       * което вече съществува.
       */
      const existing = document.querySelectorAll(
        "[data-ad-attribute]"
      );

      const duplicate = Array.from(existing).some(
        (element) =>
          element.dataset.adAttribute === label &&
          !extraContainer.contains(element)
      );

      if (!duplicate) {
        extraContainer.appendChild(
          createField(label, type)
        );
      }
    });
  }

  function updateElectricFields() {
    const fuelField = Array.from(
      document.querySelectorAll("[data-ad-attribute]")
    ).find(
      (field) => field.dataset.adAttribute === "Гориво"
    );

    const oldElectric = $("hitmigo-electric-fields");

    if (oldElectric) oldElectric.remove();

    if (
      category.value !== "Автомобили" ||
      !fuelField ||
      fuelField.value !== "Електрически"
    ) {
      return;
    }

    const electric = document.createElement("div");
    electric.id = "hitmigo-electric-fields";
    electric.style.display = "grid";
    electric.style.gap = "10px";
    electric.style.marginTop = "10px";

    electric.appendChild(
      createField("Пробег с едно зареждане (км)", "number")
    );

    electric.appendChild(
      createField("Капацитет батерия (kWh)", "number")
    );

    attributesContainer.insertAdjacentElement(
      "afterend",
      electric
    );
  }

  function refresh() {
    /*
     * Изчакваме основния скрипт да обнови
     * стандартните полета.
     */
    window.setTimeout(() => {
      renderExtraFields();
      updateElectricFields();
    }, 0);
  }

  category.addEventListener("change", refresh);
  subcategory.addEventListener("change", refresh);

  document.addEventListener("change", (event) => {
    if (
      event.target &&
      event.target.dataset &&
      event.target.dataset.adAttribute === "Гориво"
    ) {
      updateElectricFields();
    }
  });

  /*
   * При първоначално зареждане.
   */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", refresh);
  } else {
    refresh();
  }
})();
      
