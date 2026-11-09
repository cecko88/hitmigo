
/* Hitmigo — категории, автомобилни марки и модели */
(function () {
  "use strict";

  // Допълнителни марки и модели.
  // Запазва се и каталогът от hitmigo-categories.js.
  const EXTRA = {
    "Audi": "80|90|100|200|A2|A4 allroad|A6 allroad|S1|S3|S4|S5|S6|S7|S8|RS3|RS4|RS5|RS6|RS7|RS Q3|RS Q8|Q4 e-tron|Q6 e-tron|SQ5|SQ7|SQ8|R8|Cabriolet",
    "BMW": "Серия 8|Z3|Z4|Z8|XM|i5|i7|i8|iX1|iX2|iX3|M1|M2|M4|M6|M8|X3 M|X4 M|X5 M|X6 M|2002|318|320|325|328|330|335|340|520|525|530|535|540|545|550|730|735|740|745|750|760",
    "Mercedes-Benz": "190|190E|190D|CLK|SLK|SL|SLC|SLR|SLS|AMG GT|AMG GT 4-Door|CL|CLC|GL|GLK|ML|R-класа|V-класа|Vaneo|Viano|Citan|T-класа|EQA|EQB|EQC|EQE|EQS|EQV|Actros|Atego|Axor|Unimog|Maybach|X-класа",
    "Volkswagen": "Beetle|New Beetle|Bora|Vento|Lupo|Fox|Up!|Scirocco|Corrado|Sharan|T-Cross|T-Roc|Taigo|Atlas|Amarok|Multivan|Caravelle|California|Crafter|LT|T1|T2|T3|T4|T5|T6|T7|ID.5|ID.7|ID. Buzz|Eos|Phaeton|CC",
    "Opel": "Adam|Agila|Antara|Ascona|Calibra|Campo|Cascada|Commodore|Frontera|GT|Kadett|Karl|Manta|Monterey|Movano|Omega|Rekord|Senator|Signum|Sintra|Tigra|Vivaro|Ampera|Ampera-e|Grandland X|Crossland X",
    "Ford": "B-Max|C-Max|EcoSport|Edge|Escape|Explorer|F-150|F-250|Fusion|Granada|Ka|Maverick|Mustang Mach-E|Orion|Probe|Sierra|Scorpio|Taunus|Tourneo Connect|Tourneo Custom|Transit Connect|Transit Custom|Transit Courier|Bronco|Capri|Cougar",
    "Toyota": "4Runner|Auris|bZ4X|Celica|Corolla Cross|Corolla Verso|Crown|GT86|GR86|Highlander|iQ|MR2|Paseo|Previa|Proace|Proace City|Sequoia|Sienna|Starlet|Supra|Tacoma|Tundra|Urban Cruiser|Verso|Yaris Cross",
    "Honda": "City|CR-Z|e|e:Ny1|Element|FR-V|Insight|Integra|Legend|Logo|NSX|Odyssey|Pilot|Ridgeline|S2000|Shuttle|Stream",
    "Hyundai": "Accent|Atos|Coupe|Elantra|Galloper|Genesis|Getz|Grandeur|H-1|H-100|IONIQ|IONIQ 9|ix20|ix35|ix55|Matrix|Nexo|Palisade|Sonata|Terracan|Trajet|Veloster|Veracruz",
    "Kia": "Carens|Carnival|Cerato|EV3|EV4|EV5|EV9|Magentis|Mohave|Opirus|Optima|Pride|Retona|Sephia|Shuma|Soul|Spectra|Telluride|Venga|XCeed",
    "Renault": "4|5|Arkana|Avantime|Espace|Express|Fluence|Grand Scenic|Koleos|Latitude|Master|Modus|Rafale|Safrane|Symbol|Trafic|Twingo|Twizy|Vel Satis|Zoe",
    "Peugeot": "1007|106|205|306|309|405|406|408|605|607|806|807|301|4007|4008|Rifter|Partner|Expert|Boxer|RCZ|Traveller",
    "Citroen": "AX|BX|CX|DS3|DS4|DS5|Saxo|Xantia|XM|Xsara|Xsara Picasso|C3 Aircross|C3 Picasso|C4 Cactus|C4 Picasso|C4 SpaceTourer|C6|C8|C-Elysee|Nemo|Jumper|SpaceTourer|Ami",
    "Skoda": "100|105|120|130|Citigo|Felicia|Favorit|Forman|Roomster|Yeti|Elroq|Enyaq Coupe",
    "Seat": "Arosa|Cordoba|Exeo|Inca|Marbella|Mii|Alhambra|Fura|Ronda",
    "Volvo": "240|340|440|460|480|740|760|850|940|960|C30|C40|C70|EX30|EX40|EX90|EC40|S70|V50|XC70",
    "Mazda": "121|323|626|929|B-Series|BT-50|CX-7|CX-9|CX-50|CX-80|CX-90|Demio|MPV|MX-3|MX-6|MX-30|Premacy|RX-7|RX-8|Tribute|Xedos 6|Xedos 9",
    "Nissan": "200SX|300ZX|350Z|370Z|Almera Tino|Ariya|Bluebird|Cube|GT-R|Interstar|King Cab|Maxima|Murano|NV200|NV300|NV400|Pathfinder|Patrol|Pixo|Pulsar|Serena|Silvia|Skyline|Sunny|Terrano|Tiida|Townstar|Primastar",
    "Fiat": "124|126|127|128|131|600|600e|Albea|Barchetta|Brava|Cinquecento|Coupe|Croma|Fiorino|Freemont|Grande Punto|Idea|Linea|Marea|Multipla|Palio|Qubo|Scudo|Sedici|Seicento|Stilo|Strada|Talento|Tempra|Ulysse|Uno|500L|500X|500e",
    "Dacia": "1300|1310|Bigster|Logan MCV|Logan Van|Pick-Up|Solenza|SuperNova",
    "Suzuki": "Alto|Baleno|Celerio|Across|Liana|Splash|Wagon R+|X-90|Samurai",
    "Mitsubishi": "3000GT|Carisma|Eclipse|Eclipse Cross|Galant|Grandis|i-MiEV|L300|L400|Mirage|Montero|Pajero Sport|Space Star|Space Wagon|Space Runner|Sigma",
    "Subaru": "Ascent|Baja|Crosstrek|Justy|Levorg|Solterra|SVX|Tribeca|WRX|WRX STI",
    "Porsche": "356|718 Boxster|718 Cayman|918 Spyder|924|928|944|968|Carrera GT|Cayenne Coupe|Macan Electric",
    "Land Rover": "Discovery 1|Discovery 2|Discovery 3|Discovery 4|Freelander|Freelander 2|Range Rover Classic|Range Rover Evoque|Range Rover Velar",
    "Jeep": "Avenger|Commander|Gladiator|Grand Wagoneer|Liberty|Patriot|Wagoneer|Willys",
    "Lexus": "CT|LC|LFA|RC|RZ|SC|TX",
    "Tesla": "Roadster|Semi",
    "Mini": "Aceman|Cabrio|Convertible|Cooper S|Cooper SE|John Cooper Works|Roadster|Coupe",
    "Alfa Romeo": "33|75|145|146|155|164|166|4C|8C|Brera|GT|GTV|MiTo|Spider|Junior",
    "Chevrolet": "Astro|Blazer|Bolt|Bolt EUV|Colorado|Equinox|Epica|Evanda|HHR|Impala|Kalos|Lacetti|Malibu|Matiz|Niva|Orlando|Rezzo|Silverado|Suburban|Tahoe|Trailblazer|Trax|Volt",
    "Jaguar": "E-Type|F-Type|I-Pace|S-Type|X-Type|XK|XKR|XJS",
    "Abarth": "500|595|695|124 Spider|600e",
    "Acura": "CL|ILX|Integra|MDX|NSX|RDX|RL|TL|TLX|TSX|ZDX",
    "Bentley": "Arnage|Azure|Bentayga|Brooklands|Continental GT|Continental GTC|Flying Spur|Mulsanne",
    "BYD": "Atto 2|Atto 3|Dolphin|Dolphin Surf|Han|Seal|Seal U|Sealion 7|Tang",
    "Cadillac": "ATS|BLS|CT4|CT5|CTS|DeVille|Escalade|Lyriq|SRX|STS|XT4|XT5|XT6|XTS",
    "Chery": "Arrizo 5|Arrizo 8|Tiggo 2|Tiggo 4|Tiggo 7|Tiggo 8|Tiggo 9",
    "Chrysler": "200|300|300C|Crossfire|Grand Voyager|Neon|Pacifica|PT Cruiser|Sebring|Town & Country|Voyager",
    "Cupra": "Ateca|Born|Formentor|Leon|Tavascan|Terramar",
    "Daewoo": "Espero|Kalos|Lacetti|Lanos|Leganza|Matiz|Nexia|Nubira|Tacuma|Tico",
    "Daihatsu": "Charade|Copen|Cuore|Feroza|Materia|Sirion|Terios|YRV",
    "Dodge": "Avenger|Caliber|Challenger|Charger|Dakota|Durango|Grand Caravan|Journey|Nitro|Ram|Viper",
    "DS": "DS 3|DS 4|DS 5|DS 7|DS 9|N°8",
    "Ferrari": "296 GTB|296 GTS|348|355|360|458|488|550|575|599|612|812|California|F8|F12|Purosangue|Roma|SF90",
    "Genesis": "G70|G80|G90|GV60|GV70|GV80",
    "GMC": "Acadia|Canyon|Hummer EV|Savana|Sierra|Terrain|Yukon",
    "Great Wall": "Deer|Hover|Steed|Wingle|Poer",
    "Haval": "H2|H6|H9|Jolion|Dargo",
    "Infiniti": "EX|FX|G|M|Q30|Q50|Q60|Q70|QX30|QX50|QX60|QX70|QX80",
    "Isuzu": "D-Max|MU-X|N-Series|Trooper|Rodeo|Campo",
    "Iveco": "Daily|Eurocargo|Eurotech|Eurotrakker|S-Way|Stralis|Trakker",
    "Lada": "110|111|112|2101|2105|2107|Granta|Kalina|Niva|Priora|Samara|Vesta|XRAY",
    "Lamborghini": "Aventador|Countach|Diablo|Gallardo|Huracan|Murcielago|Revuelto|Temerario|Urus",
    "Lancia": "Delta|Dedra|Kappa|Lybra|Musa|Phedra|Thema|Thesis|Ypsilon",
    "Lincoln": "Aviator|Continental|Corsair|MKC|MKS|MKX|MKZ|Navigator|Town Car",
    "Lotus": "Elise|Emeya|Emira|Esprit|Eletre|Evora|Exige",
    "Lucid": "Air|Gravity",
    "MAN": "TGA|TGE|TGL|TGM|TGS|TGX",
    "Maserati": "3200 GT|Ghibli|GranCabrio|GranTurismo|Grecale|Levante|MC20|Quattroporte",
    "Maxus": "Deliver 3|Deliver 7|Deliver 9|eDeliver 3|eDeliver 9|T90 EV",
    "McLaren": "540C|570S|600LT|650S|720S|750S|Artura|GT|MP4-12C|P1",
    "MG": "3|4|5|6|Cyberster|HS|Marvel R|MGF|TF|ZS|ZS EV",
    "NIO": "EC6|EC7|EL6|EL7|EL8|ET5|ET7",
    "Oldsmobile": "Alero|Aurora|Bravada|Cutlass|Silhouette",
    "Polestar": "1|2|3|4|5",
    "Pontiac": "Bonneville|Firebird|G6|Grand Prix|Solstice|Trans Am|Vibe",
    "RAM": "1500|2500|3500|ProMaster",
    "Rolls-Royce": "Cullinan|Dawn|Ghost|Phantom|Spectre|Wraith",
    "Rover": "25|45|75|100|200|400|600|800|Mini|Streetwise",
    "Saab": "9-3|9-5|900|9000|99",
    "Scania": "G-Series|P-Series|R-Series|S-Series",
    "Smart": "Forfour|Fortwo|Roadster|#1|#3|#5",
    "SsangYong": "Actyon|Korando|Kyron|Musso|Rexton|Rodius|Tivoli|Torres",
    "Tata": "Harrier|Indica|Indigo|Nexon|Safari|Tiago|Xenon",
    "UAZ": "2206|3151|452|Hunter|Patriot|Pickup",
    "Vauxhall": "Astra|Corsa|Insignia|Mokka|Vivaro|Zafira",
    "Volvo Trucks": "FH|FH16|FM|FMX|FE|FL",
    "Wartburg": "311|312|353|1.3",
    "XPeng": "G6|G9|P7|P7+|X9",
    "Zastava": "101|128|750|Yugo",
    "Zeekr": "001|007|7X|009|X"
  };

  const catalog = {};

  if (typeof HITMIGO_CAR_MODELS !== "undefined") {
    Object.entries(HITMIGO_CAR_MODELS).forEach(([brand, models]) => {
      catalog[brand] = [...models];
    });
  }

  Object.entries(EXTRA).forEach(([brand, raw]) => {
    const merged = [
      ...(catalog[brand] || []),
      ...raw.split("|").filter(Boolean)
    ];
    catalog[brand] = [...new Set(merged)].sort(
      (a, b) => a.localeCompare(b, "bg", { numeric: true })
    );
  });

  function option(value, label = value) {
    const el = document.createElement("option");
    el.value = value;
    el.textContent = label;
    return el;
  }

  function select(placeholder, values) {
    const el = document.createElement("select");
    el.style.cssText =
      "width:100%;max-width:300px;padding:12px;margin:8px 0;" +
      "border:1px solid #ccc;border-radius:8px;" +
      "font-size:16px;box-sizing:border-box";
    el.append(option("", placeholder));
    values.forEach(value => el.append(option(value)));
    return el;
  }

  function input(placeholder, type = "text") {
    const el = document.createElement("input");
    el.type = type;
    el.placeholder = placeholder;
    el.style.cssText =
      "width:100%;max-width:300px;padding:12px;margin:8px 0;" +
      "border:1px solid #ccc;border-radius:8px;" +
      "font-size:16px;box-sizing:border-box";
    if (type === "number") el.step = "any";
    return el;
  }

  function wrap(name, field) {
    const div = document.createElement("div");
    div.style.margin = "10px 0";
    const label = document.createElement("label");
    label.textContent = name;
    label.style.display = "block";
    field.dataset.adAttribute = name;
    div.append(label, field);
    return div;
  }

  function regularField(name, definition) {
    return wrap(
      name,
      Array.isArray(definition)
        ? select("Избери " + name, definition)
        : input(name, definition === "number" ? "number" : "text")
    );
  }

  function updateAttributes() {
    const category = document.getElementById("ad-category");
    const container = document.getElementById("ad-attributes-container");
    if (!category || !container) return;

    container.replaceChildren();

    const filters =
      typeof HITMIGO_FILTERS !== "undefined"
        ? HITMIGO_FILTERS[category.value]
        : null;

    if (!filters) return;

    if (category.value === "Автомобили") {
      const brands = Object.keys(catalog)
        .sort((a, b) => a.localeCompare(b, "bg"));
      brands.push("Друга марка");

      const brandSelect = select("Избери марка", brands);
      const brandBox = wrap("Марка", brandSelect);

      const modelBox = document.createElement("div");
      modelBox.style.margin = "10px 0";

      const modelLabel = document.createElement("label");
      modelLabel.textContent = "Модел";
      modelLabel.style.display = "block";

      const modelControl = document.createElement("div");
      modelBox.append(modelLabel, modelControl);

      container.append(brandBox, modelBox);

      function updateModel() {
        modelControl.replaceChildren();

        const brand = brandSelect.value;

        if (!brand) {
          const blank = select("Първо избери марка", []);
          blank.dataset.adAttribute = "Модел";
          blank.disabled = true;
          modelControl.append(blank);
          return;
        }

        const models = catalog[brand] || [];
        const modelSelect = select(
          "Избери модел",
          [...models, "Друг модел"]
        );
        modelSelect.dataset.adAttribute = "Модел";

        const customModel = input("Напиши модела");
        customModel.dataset.adAttribute = "Модел";
        customModel.hidden = true;
        customModel.disabled = true;

        const back = document.createElement("button");
        back.type = "button";
        back.textContent = "Избери от списъка";
        back.style.cssText =
          "display:none;margin:4px 0 8px;padding:8px;" +
          "border:1px solid #ccc;border-radius:6px;background:white";

        modelSelect.addEventListener("change", () => {
          if (modelSelect.value === "Друг модел") {
            modelSelect.disabled = true;
            modelSelect.removeAttribute("data-ad-attribute");
            customModel.hidden = false;
            customModel.disabled = false;
            back.style.display = "block";
            customModel.focus();
          }
        });

        back.addEventListener("click", () => {
          modelSelect.disabled = false;
          modelSelect.dataset.adAttribute = "Модел";
          modelSelect.value = "";
          customModel.value = "";
          customModel.hidden = true;
          customModel.disabled = true;
          back.style.display = "none";
        });

        modelControl.append(modelSelect, customModel, back);
      }

      function updateBrand() {
        brandBox.querySelectorAll("input").forEach(el => el.remove());

        brandSelect.disabled = false;
        brandSelect.dataset.adAttribute = "Марка";

        const oldBack = brandBox.querySelector("button");
        if (oldBack) oldBack.remove();

        if (brandSelect.value === "Друга марка") {
          const customBrand = input("Напиши марката");
          customBrand.dataset.adAttribute = "Марка";

          brandSelect.disabled = true;
          brandSelect.removeAttribute("data-ad-attribute");

          const back = document.createElement("button");
          back.type = "button";
          back.textContent = "Избери марка от списъка";
          back.style.cssText =
            "display:block;margin:4px 0 8px;padding:8px;" +
            "border:1px solid #ccc;border-radius:6px;background:white";

          back.addEventListener("click", () => {
            brandSelect.disabled = false;
            brandSelect.value = "";
            brandSelect.dataset.adAttribute = "Марка";
            customBrand.remove();
            back.remove();
            updateModel();
          });

          brandBox.append(customBrand, back);
          customBrand.focus();
        }

        updateModel();
      }

      brandSelect.addEventListener("change", updateBrand);
      updateModel();

      Object.entries(filters).forEach(([name, definition]) => {
        if (name !== "Марка" && name !== "Модел") {
          container.append(regularField(name, definition));
        }
      });
    } else {
      Object.entries(filters).forEach(([name, definition]) => {
        container.append(regularField(name, definition));
      });
    }
  }

  function updateThirdLevel() {
    const category = document.getElementById("ad-category");
    const sub = document.getElementById("ad-subcategory");
    const box = document.getElementById("ad-subsubcategory-container");

    if (!category || !sub || !box) return;

    box.replaceChildren();

    const tree =
      typeof HITMIGO_CATEGORIES !== "undefined"
        ? HITMIGO_CATEGORIES[category.value]
        : null;

    const values = tree ? tree[sub.value] || [] : [];

    if (values.length) {
      const field = select("Избери вид", values);
      field.id = "ad-subsubcategory";
      box.append(field);
    }
  }

  function updateSubcategories() {
    const category = document.getElementById("ad-category");
    const sub = document.getElementById("ad-subcategory");

    if (!category || !sub) return;

    const tree =
      typeof HITMIGO_CATEGORIES !== "undefined"
        ? HITMIGO_CATEGORIES[category.value]
        : null;

    sub.replaceChildren(option("", "Избери подкатегория"));

    if (tree) {
      Object.keys(tree).forEach(name => {
        sub.append(option(name));
      });
    }

    updateThirdLevel();
    updateAttributes();

    const oldCarFields = document.getElementById("car-fields");
    if (oldCarFields) oldCarFields.style.display = "none";

    const oldBrand = document.getElementById("car-brand");
    const oldModel = document.getElementById("car-model");

    if (oldBrand) oldBrand.disabled = true;
    if (oldModel) oldModel.disabled = true;
  }

  function init() {
    const category = document.getElementById("ad-category");
    const sub = document.getElementById("ad-subcategory");

    if (
      !category ||
      !sub ||
      typeof HITMIGO_CATEGORIES === "undefined"
    ) return;

    const previous = category.value;

    category.replaceChildren(option("", "Избери категория"));

    Object.keys(HITMIGO_CATEGORIES).forEach(name => {
      category.append(option(name));
    });

    category.value = previous;

    category.addEventListener("change", updateSubcategories);
    sub.addEventListener("change", updateThirdLevel);

    category.removeAttribute("onchange");

    updateSubcategories();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
    
