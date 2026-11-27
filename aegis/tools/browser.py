"""AEGIS Browser Automation & Web Extraction Tool with SSRF Protection."""

import ipaddress
import socket
from urllib.parse import urlparse
from typing import Dict, Any
import httpx

class BrowserTool:
    def _validate_url(self, url: str):
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            raise ValueError(f"Invalid URL scheme: {parsed.scheme}")
        
        hostname = parsed.hostname
        if not hostname:
            raise ValueError("Missing hostname in URL")
        
        # Block localhost and common internal names
        blocked_hosts = {"localhost", "metadata.google.internal", "kubernetes", "internal"}
        if hostname.lower() in blocked_hosts:
            raise ValueError(f"Blocked internal hostname: {hostname}")

        try:
            # Resolve IP and check if private/loopback/link-local/metadata
            ip_str = socket.gethostbyname(hostname)
            ip_obj = ipaddress.ip_address(ip_str)
            
            if (ip_obj.is_loopback or 
                ip_obj.is_private or 
                ip_obj.is_link_local or 
                ip_obj.is_reserved or
                str(ip_obj) == "169.254.169.254"):
                raise ValueError(f"Blocked internal/private IP address: {ip_str}")
        except socket.gaierror:
            raise ValueError(f"Could not resolve hostname: {hostname}")

    async def fetch_page(self, url: str, max_size: int = 1024 * 1024) -> Dict[str, Any]:
        try:
            self._validate_url(url)
            async with httpx.AsyncClient(follow_redirects=True, timeout=10.0) as client:
                response = await client.get(url)
                
                # Check final URL after redirects for SSRF
                self._validate_url(str(response.url))
                
                content = response.text
                if len(content.encode("utf-8")) > max_size:
                    content = content[:max_size] + "\n...[truncated due to size limit]"

                return {
                    "success": response.status_code == 200,
                    "status_code": response.status_code,
                    "url": str(response.url),
                    "content": content
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "url": url
            }

browser_tool = BrowserTool()
