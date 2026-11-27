"""AEGIS Secure Vault with Fernet Encryption and Strict Permissions."""

import os
import stat
from cryptography.fernet import Fernet
from pathlib import Path

class Vault:
    def __init__(self, key_path: str = "~/.aegis/vault.key", store_path: str = "~/.aegis/vault.enc"):
        self.key_path = Path(key_path).expanduser()
        self.store_path = Path(store_path).expanduser()
        self._ensure_key()

    def _ensure_key(self):
        try:
            self.key_path.parent.mkdir(parents=True, exist_ok=True)
            if not self.key_path.exists():
                key = Fernet.generate_key()
                self.key_path.write_bytes(key)
                os.chmod(self.key_path, stat.S_IRUSR | stat.S_IWUSR)
            else:
                os.chmod(self.key_path, stat.S_IRUSR | stat.S_IWUSR)
            
            key = self.key_path.read_bytes()
            self.fernet = Fernet(key)
        except Exception as e:
            raise RuntimeError(f"Vault key initialization failed: {e}")

    def encrypt(self, plaintext: str) -> str:
        try:
            return self.fernet.encrypt(plaintext.encode()).decode()
        except Exception as e:
            raise RuntimeError(f"Encryption failed: {e}")

    def decrypt(self, ciphertext: str) -> str:
        try:
            return self.fernet.decrypt(ciphertext.encode()).decode()
        except Exception as e:
            raise RuntimeError(f"Decryption failed or invalid key/ciphertext: {e}")

vault = Vault()
