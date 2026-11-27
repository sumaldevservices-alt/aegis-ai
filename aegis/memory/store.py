"""AEGIS Advanced Memory & FTS5 Store."""

import sqlite3
from pathlib import Path
from typing import List, Dict, Any

class MemoryStore:
    def __init__(self, db_path: str = "~/.aegis/memory.db"):
        self.db_path = Path(db_path).expanduser()
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS facts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    category TEXT,
                    content TEXT,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()

    def add_fact(self, category: str, content: str):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("INSERT INTO facts (category, content) VALUES (?, ?)", (category, content))
            conn.commit()

    def search_facts(self, query: str) -> List[Dict[str, Any]]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT category, content, updated_at FROM facts WHERE content LIKE ? LIMIT 10", (f"%{query}%",))
            return [{"category": r[0], "content": r[1], "updated_at": r[2]} for r in cursor.fetchall()]

memory_store = MemoryStore()
