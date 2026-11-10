
const SUPABASE_URL =
  "https://rklrptqfxggojjvpsqzj.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_Jf9KpJ-E3F3PrEsFDBsQIw_bGZmjSow";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// Регистрация
async function registerUser(email, password) {
  const { data, error } = await db.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        "https://cecko88.github.io/hitmigo/"
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  alert(data.session ? "Регистрацията е успешна!" : "Провери имейла си за потвърждение!");
  return data;
}

// Вход
async function loginUser(email, password) {
  const { data, error } =
    await db.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    throw new Error(error.message);
  }

  alert("Успешен вход в Hitmigo!");
  return data;
}

// Изход
async function logoutUser() {
  const { error } = await db.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  alert("Излезе успешно от профила.");
}
