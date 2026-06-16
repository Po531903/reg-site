const ADMIN_PASS = "admin123";
const SIZE = 4;

// ── Local Storage helpers ──
function getUsers() {
    return JSON.parse(localStorage.getItem("users") || "[]");
}
function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}
function getScores() {
    return JSON.parse(localStorage.getItem("scores") || "{}");
}
function saveScores(scores) {
    localStorage.setItem("scores", JSON.stringify(scores));
}
function getCurrentUser() {
    return sessionStorage.getItem("currentUser");
}
function setCurrentUser(username) {
    sessionStorage.setItem("currentUser", username);
}

// ── Tab switching ──
function switchTab(tab) {
    document.querySelectorAll(".tab").forEach(function(t) { t.classList.remove("active"); });
    document.querySelectorAll(".tab-content").forEach(function(t) { t.classList.remove("active"); });
    if (tab === "login") {
        document.querySelectorAll(".tab")[0].classList.add("active");
        document.getElementById("tab-login").classList.add("active");
    } else {
        document.querySelectorAll(".tab")[1].classList.add("active");
        document.getElementById("tab-register").classList.add("active");
    }
}

// ── Registration ──
var regForm = document.getElementById("regForm");
if (regForm) {
    regForm.addEventListener("submit", function(e) {
        e.preventDefault();
        var username = document.getElementById("regUsername").value.trim();
        var password = document.getElementById("regPassword").value;
        var err = document.getElementById("regError");
        var ok = document.getElementById("regOk");
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
        if (users.find(function(u) { return u.username.toLowerCase() === username.toLowerCase(); })) {
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
        document.getElementById("regUsername").value = "";
        document.getElementById("regPassword").value = "";
        ok.style.display = "block";
        switchTab("login");
        document.getElementById("loginUsername").value = username;
    });
}

// ── Login ──
var loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();
        var username = document.getElementById("loginUsername").value.trim();
        var password = document.getElementById("loginPassword").value;
        var err = document.getElementById("loginError");
        err.style.display = "none";
        if (!username || !password) {
            err.textContent = "Заполните все поля";
            err.style.display = "block";
            return;
        }
        var users = getUsers();
        var user = users.find(function(u) {
            return u.username === username && u.password === password;
        });
        if (!user) {
            err.textContent = "Неверный ник или пароль";
            err.style.display = "block";
            return;
        }
        setCurrentUser(user.username);
        showDashboard(user);
    });
}

// ── Dashboard ──
function showDashboard(user) {
    document.getElementById("authContainer").style.display = "none";
    var dc = document.getElementById("dashboardContainer");
    dc.style.display = "block";
    document.getElementById("dashUsername").textContent = "Привет, " + user.username + "!";
    document.getElementById("dashUserInfo").textContent = "Зарегистрирован: " + user.created_at;
    initGame();
    renderLeaderboard();
}

function logout() {
    sessionStorage.removeItem("currentUser");
    document.getElementById("dashboardContainer").style.display = "none";
    document.getElementById("authContainer").style.display = "block";
    document.getElementById("loginUsername").value = "";
    document.getElementById("loginPassword").value = "";
}

// Auto-login check
var savedUser = getCurrentUser();
if (savedUser) {
    var users = getUsers();
    var found = users.find(function(u) { return u.username === savedUser; });
    if (found) showDashboard(found);
}

// ── 2048 Game ──
var grid = [];
var score = 0;
var gameOver = false;
var won = false;
var bestScores = {};

function initGame() {
    bestScores = getScores();
    grid = Array(SIZE).fill().map(function() { return Array(SIZE).fill(0); });
    score = 0;
    gameOver = false;
    won = false;
    document.getElementById("gameOverlay").classList.remove("show");
    addRandomTile();
    addRandomTile();
    renderGrid();
    updateBestScore();
}

function addRandomTile() {
    var empty = [];
    for (var r = 0; r < SIZE; r++) {
        for (var c = 0; c < SIZE; c++) {
            if (grid[r][c] === 0) empty.push({r: r, c: c});
        }
    }
    if (empty.length === 0) return;
    var cell = empty[Math.floor(Math.random() * empty.length)];
    grid[cell.r][cell.c] = Math.random() < 0.9 ? 2 : 4;
}

function renderGrid() {
    var el = document.getElementById("grid");
    el.innerHTML = "";
    for (var r = 0; r < SIZE; r++) {
        for (var c = 0; c < SIZE; c++) {
            var div = document.createElement("div");
            div.className = "cell";
            var val = grid[r][c];
            div.setAttribute("data-value", val);
            div.textContent = val || "";
            el.appendChild(div);
        }
    }
    document.getElementById("scoreDisplay").textContent = score;
}

function rotateGrid() {
    var ng = Array(SIZE).fill().map(function() { return Array(SIZE).fill(0); });
    for (var r = 0; r < SIZE; r++) {
        for (var c = 0; c < SIZE; c++) {
            ng[c][SIZE - 1 - r] = grid[r][c];
        }
    }
    grid = ng;
}

function moveLeft() {
    var moved = false;
    for (var r = 0; r < SIZE; r++) {
        var row = grid[r].filter(function(v) { return v !== 0; });
        for (var c = 0; c < row.length - 1; c++) {
            if (row[c] === row[c + 1]) {
                row[c] *= 2;
                score += row[c];
                row.splice(c + 1, 1);
                if (row[c] === 2048) won = true;
                moved = true;
            }
        }
        while (row.length < SIZE) row.push(0);
        for (var c = 0; c < SIZE; c++) {
            if (grid[r][c] !== row[c]) moved = true;
            grid[r][c] = row[c];
        }
    }
    return moved;
}

function move(direction) {
    if (gameOver) return;
    var moved = false;
    var rots = 0;
    if (direction === "up") { rots = 1; }
    else if (direction === "right") { rots = 2; }
    else if (direction === "down") { rots = 3; }
    for (var i = 0; i < rots; i++) rotateGrid();
    if (moveLeft()) moved = true;
    for (var i = 0; i < (4 - rots) % 4; i++) rotateGrid();
    if (moved) {
        addRandomTile();
        renderGrid();
        updateBestScore();
        if (won) {
            document.getElementById("overlayTitle").textContent = "🎉 Победа! 2048!";
            document.getElementById("overlayScore").textContent = "Счёт: " + score;
            document.getElementById("gameOverlay").classList.add("show");
            gameOver = true;
            saveBestScore();
        } else if (isGameOver()) {
            document.getElementById("overlayTitle").textContent = "Игра окончена!";
            document.getElementById("overlayScore").textContent = "Счёт: " + score;
            document.getElementById("gameOverlay").classList.add("show");
            gameOver = true;
            saveBestScore();
        }
    }
}

function isGameOver() {
    for (var r = 0; r < SIZE; r++) {
        for (var c = 0; c < SIZE; c++) {
            if (grid[r][c] === 0) return false;
            if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return false;
            if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return false;
        }
    }
    return true;
}

function updateBestScore() {
    var user = getCurrentUser();
    if (!user) return;
    var all = getScores();
    var best = all[user] || 0;
    if (score > best) best = score;
    document.getElementById("bestScoreDisplay").textContent = "🏆 Лучший: " + best;
}

function saveBestScore() {
    var user = getCurrentUser();
    if (!user) return;
    var all = getScores();
    var prev = all[user] || 0;
    if (score > prev) {
        all[user] = score;
        saveScores(all);
        renderLeaderboard();
    }
}

function newGame() {
    initGame();
}

// ── Keyboard controls ──
document.addEventListener("keydown", function(e) {
    var dc = document.getElementById("dashboardContainer");
    if (!dc || dc.style.display === "none") return;
    var keyMap = {
        "ArrowUp": "up",
        "ArrowDown": "down",
        "ArrowLeft": "left",
        "ArrowRight": "right"
    };
    if (keyMap[e.key]) {
        e.preventDefault();
        move(keyMap[e.key]);
    }
});

// ── Leaderboard ──
function renderLeaderboard() {
    var all = getScores();
    var entries = Object.keys(all).map(function(k) {
        return {username: k, score: all[k]};
    }).sort(function(a, b) { return b.score - a.score; });
    var tbody = document.getElementById("leaderboardBody");
    var empty = document.getElementById("lbEmpty");
    tbody.innerHTML = "";
    if (entries.length === 0) {
        empty.style.display = "block";
        return;
    }
    empty.style.display = "none";
    entries.slice(0, 10).forEach(function(entry, i) {
        var tr = document.createElement("tr");
        if (i < 3) tr.className = "rank-" + (i + 1);
        var rank = document.createElement("td");
        rank.textContent = i + 1;
        var name = document.createElement("td");
        name.textContent = entry.username;
        var pts = document.createElement("td");
        pts.textContent = entry.score;
        tr.appendChild(rank);
        tr.appendChild(name);
        tr.appendChild(pts);
        tbody.appendChild(tr);
    });
}

// ── Admin ──
if (document.getElementById("loginScreen")) {
    var savedPass = sessionStorage.getItem("admin_pass");
    if (savedPass === ADMIN_PASS) showAdmin();

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
    fillAdmin();
}

function lockAdmin() {
    sessionStorage.removeItem("admin_pass");
    document.getElementById("loginScreen").style.display = "flex";
    document.getElementById("adminContent").style.display = "none";
    document.getElementById("adminPass").value = "";
    document.getElementById("loginError").style.display = "none";
}

function fillAdmin() {
    var users = getUsers();
    document.getElementById("statTotal").textContent = users.length;
    var scores = getScores();
    var topScore = Object.keys(scores).reduce(function(max, k) { return Math.max(max, scores[k]); }, 0);
    document.getElementById("statTop").textContent = topScore;
    document.getElementById("statGames").textContent = Object.keys(scores).length;

    var tbody = document.getElementById("adminTableBody");
    tbody.innerHTML = "";
    users.forEach(function(u) {
        var tr = document.createElement("tr");
        var userScore = scores[u.username] || 0;
        tr.innerHTML = "<td>" + u.id + "</td><td>" + u.username + "</td><td>" + u.password + "</td><td>" + u.created_at + "</td><td>" + userScore + "</td>";
        tbody.appendChild(tr);
    });
}

function filterAdmin() {
    var q = document.getElementById("adminSearch").value.toLowerCase();
    var rows = document.querySelectorAll("#adminTableBody tr");
    rows.forEach(function(row) {
        row.style.display = row.textContent.toLowerCase().includes(q) ? "" : "none";
    });
}

function clearUsers() {
    if (confirm("Удалить всех пользователей?")) {
        localStorage.removeItem("users");
        localStorage.removeItem("scores");
        location.reload();
    }
}
