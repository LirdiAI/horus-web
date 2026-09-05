// Вставь свои ключи из настроек Supabase
const supabaseUrl = 'https://cltpudntuxyyppmvelhu.supabase.co/rest/v1/';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsdHB1ZG50dXh5eXBwbXZlbGh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MTM5MDQsImV4cCI6MjEwNDE4OTkwNH0.3V1iJ__rXqq0CNJ7_fqtqdMruHc0Bblel1FMCoqTY2k';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Проверка сессии при загрузке
window.onload = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        loadProfile(session.user.id);
    }
};

async function register() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const nickname = document.getElementById('nickname').value;

    if (!nickname) {
        alert("Введите никнейм!");
        return;
    }

    // Регистрация в системе Auth
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return alert(error.message);

    // Запись данных в таблицу профилей
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

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else loadProfile(data.user.id);
}

async function logout() {
    await supabase.auth.signOut();
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('profile-section').classList.add('hidden');
}

async function loadProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error(error);
        return;
    }

    // Отображаем данные
    document.getElementById('prof-nickname').innerText = data.nickname;
    document.getElementById('prof-email').innerText = data.email;

    // Логика отображения HWID
    document.getElementById('prof-hwid').innerText = data.hwid ? "Есть (Привязан)" : "Не привязан";

    // Логика отображения подписки
    if (data.sub_expires_at) {
        const subDate = new Date(data.sub_expires_at);
        const now = new Date();
        if (subDate.getFullYear() > 2100) {
            document.getElementById('prof-sub').innerText = "Навсегда (Lifetime)";
        } else if (subDate > now) {
            document.getElementById('prof-sub').innerText = subDate.toLocaleDateString();
        } else {
            document.getElementById('prof-sub').innerText = "Истекла";
        }
    } else {
        document.getElementById('prof-sub').innerText = "Нет активной подписки";
    }

    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('profile-section').classList.remove('hidden');
}

function buySub(days) {
    // Здесь должна быть логика вызова платежной системы.
    alert(`Перенаправление на оплату подписки на ${days === 9999 ? 'навсегда' : days + ' дней'}...`);
}