from redis import ConnectionPool
from redis.asyncio import ConnectionPool as AsyncConnectionPool

from api.settings import LIVE_UPDATES_URL, REDIS_ASYNC_POOL_SIZE, REDIS_SYNC_POOL_SIZE

sync_pool = ConnectionPool.from_url(
    LIVE_UPDATES_URL, max_connections=REDIS_SYNC_POOL_SIZE
)

async_pool = AsyncConnectionPool.from_url(
    LIVE_UPDATES_URL, max_connections=REDIS_ASYNC_POOL_SIZE
)
