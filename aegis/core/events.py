import asyncio
import logging
from typing import Callable, Dict, List, Any

logger = logging.getLogger("aegis")

class EventBus:
    def __init__(self):
        self._listeners: Dict[str, List[Callable]] = {}

    def subscribe(self, event_type: str, callback: Callable):
        if event_type not in self._listeners:
            self._listeners[event_type] = []
        self._listeners[event_type].append(callback)

    async def emit(self, event_type: str, data: Any = None):
        logger.info(f"Event emitted: {event_type} | Data: {data}")
        if event_type in self._listeners:
            for cb in self._listeners[event_type]:
                try:
                    if asyncio.iscoroutinefunction(cb):
                        await cb(data)
                    else:
                        cb(data)
                except Exception as e:
                    logger.error(f"Error in event handler for {event_type}: {e}")

event_bus = EventBus()
