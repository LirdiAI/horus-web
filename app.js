// НЕ ЗАБУДЬ ВСТАВИТЬ СВОИ КЛЮЧИ SUPABASE СЮДА
const supabaseUrl = 'https://cltpudntuxyyppmvelhu.supabase.co/rest/v1/';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsdHB1ZG50dXh5eXBwbXZlbGh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MTM5MDQsImV4cCI6MjEwNDE4OTkwNH0.3V1iJ__rXqq0CNJ7_fqtqdMruHc0Bblel1FMCoqTY2k';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Управление окнами
function openModal(id) {
    closeModals();
    document.getElementById(id).style.display = 'flex';
}
function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(el => el.style.display = 'none');
}

// Проверка сессии
window.onload = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) loadProfile(session.user.id);
};

// Регистрация
async function register() {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const nickname = document.getElementById('reg-nickname').value;

    if (!nickname) return alert("Введите никнейм!");

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return alert(error.message);

    const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: data.user.id, email: email, nickname: nickname }]);

    if (profileError) {
        alert("Ошибка создания профиля: " + profileError.message);
    } else {
        alert("Регистрация успешна!");
        loadProfile(data.user.id);
    }
}

// Вход
async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else loadProfile(data.user.id);
}

// Выход
async function logout() {
    await supabase.auth.signOut();
    document.getElementById('guest-buttons').classList.remove('hidden');
    document.getElementById('user-buttons').classList.add('hidden');
    closeModals();
}

// Загрузка профиля
async function loadProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) return console.error(error);

    document.getElementById('prof-nickname').innerText = data.nickname;
    document.getElementById('prof-email').innerText = data.email;
    document.getElementById('prof-hwid').innerText = data.hwid ? "Привязан" : "Не привязан";

    if (data.sub_expires_at) {
        const subDate = new Date(data.sub_expires_at);
        const now = new Date();
        if (subDate.getFullYear() > 2100) {
            document.getElementById('prof-sub').innerText = "Навсегда";
        } else if (subDate > now) {
            document.getElementById('prof-sub').innerText = subDate.toLocaleDateString();
        } else {
            document.getElementById('prof-sub').innerText = "Истекла";
        }
    } else {
        document.getElementById('prof-sub').innerText = "Нет";
    }

    // Меняем кнопки в меню
    document.getElementById('guest-buttons').classList.add('hidden');
    document.getElementById('user-buttons').classList.remove('hidden');
    closeModals();
}

// Оплата
function buySub(days) {
    alert(`Перенаправление на оплату (${days === 9999 ? 'Навсегда' : days + ' дней'})`);
}
