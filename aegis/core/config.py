import os
import yaml
from pathlib import Path
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any

class ServerConfig(BaseModel):
    host: str = "127.0.0.1"
    port: int = 8443
    ssl_cert: Optional[str] = None
    ssl_key: Optional[str] = None

class ProviderConfig(BaseModel):
    base_url: str
    api_key_env: Optional[str] = None
    auth_token_env: Optional[str] = None

class RoleConfig(BaseModel):
    provider: str = "default"
    model: str = "claude-3-5-sonnet-20241022"
    effort: str = "high"

class RolesConfig(BaseModel):
    planner: RoleConfig = RoleConfig(model="claude-3-5-opus-20241022", effort="max")
    executor: RoleConfig = RoleConfig(model="claude-3-5-sonnet-20241022", effort="high")
    fast: RoleConfig = RoleConfig(model="claude-3-5-haiku-20241022", effort="low")
    critic: RoleConfig = RoleConfig(model="claude-3-5-opus-20241022", effort="high")
    fallback: List[str] = Field(default_factory=list)

class AutonomyConfig(BaseModel):
    level: int = 2
    require_approval_for: List[str] = Field(default_factory=lambda: ["HIGH", "MEDIUM"])

class TelegramConfig(BaseModel):
    enabled: bool = False
    token_env: str = "TELEGRAM_BOT_TOKEN"
    allowed_users: List[int] = Field(default_factory=list)

class SecurityConfig(BaseModel):
    jwt_secret_env: str = "AEGIS_JWT_SECRET"
    totp_issuer: str = "AEGIS"
    lockout_protection: bool = True

class InventoryConfig(BaseModel):
    hosts_file: str = "~/.aegis/inventory.yaml"

class AegisConfig(BaseModel):
    version: str = "1.0"
    server: ServerConfig = Field(default_factory=ServerConfig)
    providers: Dict[str, ProviderConfig] = Field(default_factory=dict)
    roles: RolesConfig = Field(default_factory=RolesConfig)
    autonomy: AutonomyConfig = Field(default_factory=AutonomyConfig)
    telegram: TelegramConfig = Field(default_factory=TelegramConfig)
    security: SecurityConfig = Field(default_factory=SecurityConfig)
    inventory: InventoryConfig = Field(default_factory=InventoryConfig)

def load_config(config_path: Optional[str] = None) -> AegisConfig:
    if not config_path:
        config_path = os.getenv("AEGIS_CONFIG", "config.example.yaml")
    
    path = Path(config_path)
    if path.exists():
        with open(path, "r") as f:
            data = yaml.safe_load(f) or {}
            return AegisConfig(**data)
    return AegisConfig()
