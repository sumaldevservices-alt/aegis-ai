import os
from typing import Optional

class TelegramGateway:
    def __init__(self, token: Optional[str] = None):
        self.token = token or os.getenv("TELEGRAM_BOT_TOKEN")
        self.enabled = bool(self.token)

    async def send_alert(self, message: str):
        if not self.enabled:
            return {"status": "disabled", "message": message}
        # Simulated send message with inline buttons for approval
        return {"status": "sent", "message": message}

telegram_gateway = TelegramGateway()
