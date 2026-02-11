from collections import defaultdict
from datetime import datetime, timedelta
from fastapi import HTTPException, Request
from typing import Dict, List


class RateLimiter:
    """
    Rate limiter middleware for AI endpoints.
    Tracks requests per user per minute using in-memory storage.
    """

    def __init__(self, requests_per_minute: int = 10):
        """
        Initialize rate limiter.

        Args:
            requests_per_minute: Maximum number of requests allowed per user per minute
        """
        self.requests_per_minute = requests_per_minute
        self.requests: Dict[int, List[datetime]] = defaultdict(list)

    async def check_rate_limit(self, user_id: int) -> None:
        """
        Check if user has exceeded rate limit.

        Args:
            user_id: ID of the user making the request

        Raises:
            HTTPException: 429 if rate limit exceeded
        """
        now = datetime.utcnow()
        minute_ago = now - timedelta(minutes=1)

        # Clean old requests (older than 1 minute)
        self.requests[user_id] = [
            req_time for req_time in self.requests[user_id]
            if req_time > minute_ago
        ]

        # Check if limit exceeded
        if len(self.requests[user_id]) >= self.requests_per_minute:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Maximum {self.requests_per_minute} requests per minute."
            )

        # Record this request
        self.requests[user_id].append(now)

    def reset_user_limit(self, user_id: int) -> None:
        """Reset rate limit for a specific user (for testing)."""
        if user_id in self.requests:
            del self.requests[user_id]

    def get_remaining_requests(self, user_id: int) -> int:
        """Get number of remaining requests for user in current minute."""
        now = datetime.utcnow()
        minute_ago = now - timedelta(minutes=1)

        # Clean old requests
        self.requests[user_id] = [
            req_time for req_time in self.requests[user_id]
            if req_time > minute_ago
        ]

        return max(0, self.requests_per_minute - len(self.requests[user_id]))
