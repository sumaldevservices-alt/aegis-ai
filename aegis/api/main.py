"""AEGIS FastAPI Application with JWT Auth and RBAC."""

from fastapi import FastAPI, Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os
from datetime import datetime, timedelta, timezone
from typing import Optional, List

from aegis.tools.system import get_system_stats
from aegis.tools.shell import run_shell
from aegis.core.config import load_config

app = FastAPI(title="AEGIS API", version="1.0.0")

JWT_SECRET = os.getenv("AEGIS_JWT_SECRET", "aegis-super-secret-jwt-key-change-in-prod")
JWT_ALGORITHM = "HS256"
security_scheme = HTTPBearer()

# In-memory user store for demo/testing
USERS = {
    "admin": {"password": "adminpassword", "role": "owner"},
    "viewer": {"password": "viewerpassword", "role": "viewer"}
}

def create_access_token(data: dict, expires_delta: timedelta = timedelta(hours=8)):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security_scheme)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role", "viewer")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return {"username": username, "role": role}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

def require_role(required_role: str):
    role_hierarchy = {"viewer": 1, "admin": 2, "owner": 3}
    def role_dependency(user: dict = Depends(verify_token)):
        user_role = user.get("role", "viewer")
        if role_hierarchy.get(user_role, 0) < role_hierarchy.get(required_role, 0):
            raise HTTPException(status_code=403, detail="Insufficient privileges")
        return user
    return role_dependency

@app.post("/auth/login")
def login(form_data: dict):
    username = form_data.get("username")
    password = form_data.get("password")
    user = USERS.get(username)
    if not user or user["password"] != password:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    token = create_access_token({"sub": username, "role": user["role"]})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/status")
def status_endpoint(user: dict = Depends(verify_token)):
    return get_system_stats()

@app.post("/run")
def run_endpoint(payload: dict, user: dict = Depends(require_role("admin"))):
    command = payload.get("command")
    if not command:
        raise HTTPException(status_code=400, detail="Command is required")
    return run_shell(command)

@app.get("/models")
def models_endpoint(user: dict = Depends(verify_token)):
    cfg = load_config()
    return cfg.roles.model_dump()
