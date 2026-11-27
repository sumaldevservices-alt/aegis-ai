"""AEGIS Persistence & SQLite State Store."""

import sqlite3
from pathlib import Path

class Database:
    def __init__(self, db_path: str = "~/.aegis/state.db"):
        self.db_path = Path(db_path).expanduser()
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    command TEXT,
                    risk TEXT,
                    success BOOLEAN,
                    output TEXT
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS memory (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    key TEXT UNIQUE,
                    value TEXT,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()

    def log_command(self, command: str, risk: str, success: bool, output: str):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT INTO audit_logs (command, risk, success, output) VALUES (?, ?, ?, ?)",
                (command, risk, success, output)
            )
            conn.commit()

    def get_logs(self, limit: int = 20):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT timestamp, command, risk, success FROM audit_logs ORDER BY id DESC LIMIT ?", (limit,))
            return cursor.fetchall()

db = Database()
