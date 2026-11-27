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
            # FTS5 virtual table
            conn.execute("""
                CREATE VIRTUAL TABLE IF NOT EXISTS facts_fts USING fts5(
                    content,
                    category,
                    content_rowid=id
                )
            """)
            conn.commit()

    def add_fact(self, category: str, content: str):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO facts (category, content) VALUES (?, ?)", (category, content))
            row_id = cursor.lastrowid
            cursor.execute("INSERT INTO facts_fts(rowid, content, category) VALUES (?, ?, ?)", (row_id, content, category))
            conn.commit()

    def search_facts(self, query: str) -> List[Dict[str, Any]]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            try:
                # Use FTS5 search
                cursor.execute("""
                    SELECT f.category, f.content, f.updated_at 
                    FROM facts_fts 
                    JOIN facts f ON facts_fts.rowid = f.id 
                    WHERE facts_fts MATCH ? 
                    LIMIT 20
                """, (query,))
                rows = cursor.fetchall()
                if not rows:
                    # Fallback to LIKE
                    cursor.execute("SELECT category, content, updated_at FROM facts WHERE content LIKE ? LIMIT 20", (f"%{query}%",))
                    rows = cursor.fetchall()
                return [{"category": r[0], "content": r[1], "updated_at": r[2]} for r in rows]
            except Exception:
                # Fallback to LIKE if FTS query syntax error
                cursor.execute("SELECT category, content, updated_at FROM facts WHERE content LIKE ? LIMIT 20", (f"%{query}%",))
                return [{"category": r[0], "content": r[1], "updated_at": r[2]} for r in cursor.fetchall()]

memory_store = MemoryStore()
