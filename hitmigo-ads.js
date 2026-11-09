
// Hitmigo - публикуване и показване на обяви

async function publishAd() {
  const { data: { user }, error: authError } =
    await db.auth.getUser();

  if (authError || !user) {
    alert("Първо влез в профила си.");
    return;
  }

  const title =
    document.getElementById("ad-title").value.trim();
  const description =
    document.getElementById("ad-description").value.trim();
  const priceText =
    document.getElementById("ad-price").value.trim();
  const category =
    document.getElementById("ad-category").value;
  const city =
    document.getElementById("ad-city").value.trim();

  if (!title || !description || !priceText ||
      !category || !city) {
    alert("Попълни всички полета.");
    return;
  }

  const price = Number(priceText);

  if (!Number.isFinite(price) || price < 0) {
    alert("Въведи валидна цена.");
    return;
  }
const imageFile = document.getElementById("ad-image").files[0];
let imageUrl = null;

if (imageFile) {
  const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}-${imageFile.name}`;

  const { error: uploadError } = await db.storage
    .from("ad-images")
    .upload(fileName, imageFile);

  if (uploadError) {
    alert("Грешка при качване на снимката: " + uploadError.message);
    return;
  }

  const { data: imageData } = db.storage
    .from("ad-images")
    .getPublicUrl(fileName);

  imageUrl = imageData.publicUrl;
}
  const { error } = await db.from("ads").insert({
    user_id: user.id,
    title,
    description,
    price,
    category,
    city,
image_url: imageUrl
    
  });

  if (error) {
    alert("Грешка при публикуване: " + error.message);
    return;
  }

  alert("Обявата е публикувана успешно!");

  document.getElementById("ad-title").value = "";
  document.getElementById("ad-description").value = "";
  document.getElementById("ad-price").value = "";
  document.getElementById("ad-city").value = "";

  await loadAds();
}

// Зареждане на обявите
async function loadAds() {
  const container = document.getElementById("ads-list");
  if (!container) return;

  const { data, error } = await db
    .from("ads")
    .select("id,title,description,price,category,city,image_url")
    .order("created_at", { ascending: false });

  if (error) {
    container.textContent =
      "Не успяхме да заредим обявите.";
    console.error(error);
    return;
  }

  container.replaceChildren();

  if (!data.length) {
    container.textContent = "Все още няма обяви.";
    return;
  }

  for (const ad of data) {
    const card = document.createElement("article");
    card.style.cssText =
      "background:white;padding:18px;margin:12px 0;" +
      "border-radius:12px;text-align:left";

    const heading = document.createElement("h3");
    heading.textContent = ad.title;

    const info = document.createElement("p");
    info.textContent =
      ad.category + " · " + ad.city +
      " · " + ad.price + " €";

    const description = document.createElement("p");
    description.textContent = ad.description || "";

if (ad.image_url) {
  const image = document.createElement("img");
  image.src = ad.image_url;
  image.alt = ad.title;
  image.style.cssText =
    "width:100%;max-height:300px;object-fit:contain;border-radius:10px;margin-bottom:12px;";
  card.appendChild(image);
}
    card.append(heading, info, description);
      card.append(heading, info, description);
    container.appendChild(card);
  }
}
