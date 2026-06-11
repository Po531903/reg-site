from flask import Flask, request, render_template, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3, os

app = Flask(__name__)
app.secret_key = os.urandom(24)
DB = "users.db"

def init_db():
    with sqlite3.connect(DB) as conn:
        conn.execute("""CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )""")
init_db()

@app.route("/")
def home():
    return redirect(url_for("register"))

@app.route("/register", methods=["GET", "POST"])
def register():
    error = ""
    if request.method == "POST":
        username = request.form["username"].strip()
        password = request.form["password"]
        if not username or not password:
            error = "Заполните все поля"
        elif len(password) < 4:
            error = "Пароль минимум 4 символа"
        else:
            try:
                with sqlite3.connect(DB) as conn:
                    conn.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)",
                                 (username, generate_password_hash(password)))
                return redirect(url_for("register") + "?ok=1")
            except sqlite3.IntegrityError:
                error = "Этот ник уже занят"
    return render_template("register.html", error=error, ok=request.args.get("ok"))

@app.route("/admin")
def admin():
    with sqlite3.connect(DB) as conn:
        users = conn.execute("SELECT id, username, password_hash, created_at FROM users ORDER BY id").fetchall()
    return render_template("admin.html", users=users)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
