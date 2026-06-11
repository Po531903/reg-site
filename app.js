function getUsers() {
    return JSON.parse(localStorage.getItem("users") || "[]");
}
function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

const form = document.getElementById("regForm");
if (form) {
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const err = document.getElementById("error");
        const ok = document.getElementById("ok");
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
        const users = getUsers();
        if (users.find(u => u.username === username)) {
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

const table = document.getElementById("usersTable");
if (table) {
    const users = getUsers();
    const empty = document.getElementById("empty");
    if (users.length === 0) {
        empty.style.display = "block";
    } else {
        users.forEach(u => {
            const row = table.insertRow();
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
