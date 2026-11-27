import os
import base64
from cryptography.fernet import Fernet
from pathlib import Path

class Vault:
    def __init__(self, key_path: str = "~/.aegis/vault.key", store_path: str = "~/.aegis/vault.enc"):
        self.key_path = Path(key_path).expanduser()
        self.store_path = Path(store_path).expanduser()
        self._ensure_key()

    def _ensure_key(self):
        self.key_path.parent.mkdir(parents=True, exist_ok=True)
        if not self.key_path.exists():
            key = Fernet.generate_key()
            self.key_path.write_bytes(key)
        
        key = self.key_path.read_bytes()
        self.fernet = Fernet(key)

    def encrypt(self, plaintext: str) -> str:
        return self.fernet.encrypt(plaintext.encode()).decode()

    def decrypt(self, ciphertext: str) -> str:
        return self.fernet.decrypt(ciphertext.encode()).decode()

vault = Vault()
