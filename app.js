const ADMIN_PASS = "admin123";

function getUsers() {
    return JSON.parse(localStorage.getItem("users") || "[]");
}
function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

// ── Регистрация ──
var form = document.getElementById("regForm");
if (form) {
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        var username = document.getElementById("username").value.trim();
        var password = document.getElementById("password").value;
        var err = document.getElementById("error");
        var ok = document.getElementById("ok");
        err.style.display = "none";
        ok.style.display = "none";
        if (!username || !password) {
            err.textContent = "Заполните все поля";
            err.style.display = "block";
            return;
        }
        if (password.length < 4) {
            err.textContent = "Пароль минимум 4 символа";
            err.style.display = "block";
            return;
        }
        var users = getUsers();
        if (users.find(function(u) { return u.username === username; })) {
            err.textContent = "Этот ник уже занят";
            err.style.display = "block";
            return;
        }
        users.push({
            id: users.length + 1,
            username: username,
            password: password,
            created_at: new Date().toLocaleString()
        });
        saveUsers(users);
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
        ok.style.display = "block";
    });
}

// ── Админка ──
// Если есть логинскрин — проверяем пароль
if (document.getElementById("loginScreen")) {
    var savedPass = sessionStorage.getItem("admin_pass");
    if (savedPass === ADMIN_PASS) {
        showAdmin();
    }

    document.getElementById("adminPass").addEventListener("keydown", function(e) {
        if (e.key === "Enter") checkAdminPass();
    });
}

function checkAdminPass() {
    var pass = document.getElementById("adminPass").value;
    if (pass === ADMIN_PASS) {
        sessionStorage.setItem("admin_pass", ADMIN_PASS);
        showAdmin();
    } else {
        document.getElementById("loginError").style.display = "block";
    }
}

function showAdmin() {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("adminContent").style.display = "block";
    fillTable();
}

function lockAdmin() {
    sessionStorage.removeItem("admin_pass");
    document.getElementById("loginScreen").style.display = "flex";
    document.getElementById("adminContent").style.display = "none";
    document.getElementById("adminPass").value = "";
    document.getElementById("loginError").style.display = "none";
}

function fillTable() {
    var table = document.getElementById("usersTable");
    if (!table) return;
    var users = getUsers();
    var empty = document.getElementById("empty");
    if (users.length === 0) {
        empty.style.display = "block";
    } else {
        users.forEach(function(u) {
            var row = table.insertRow();
            row.innerHTML = "<td>" + u.id + "</td><td>" + u.username + "</td><td>" + u.password + "</td><td>" + u.created_at + "</td>";
        });
    }
}

function clearUsers() {
    if (confirm("Удалить всех пользователей?")) {
        localStorage.removeItem("users");
        location.reload();
    }
}
