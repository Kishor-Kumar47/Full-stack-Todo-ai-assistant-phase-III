from fastapi import HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from typing import Optional
import os
from datetime import datetime

# Initialize security scheme
security = HTTPBearer()

class AuthMiddleware:
    @staticmethod
    async def verify_token(credentials: HTTPAuthorizationCredentials = None) -> Optional[dict]:
        """
        Verify the JWT token and return the payload if valid
        """
        if not credentials:
            raise HTTPException(status_code=401, detail="No authorization token provided")

        token = credentials.credentials
        secret_key = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
        algorithm = os.getenv("ALGORITHM", "HS256")

        try:
            payload = jwt.decode(token, secret_key, algorithms=[algorithm])
            user_id: int = payload.get("sub")
            if user_id is None:
                raise HTTPException(status_code=401, detail="Invalid token: no user ID")

            # Check if token is expired
            exp = payload.get("exp")
            if exp and datetime.fromtimestamp(exp) < datetime.utcnow():
                raise HTTPException(status_code=401, detail="Token has expired")

            return payload
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")

    @staticmethod
    async def verify_user_owns_resource(request: Request, user_id: int) -> bool:
        """
        Verify that the authenticated user owns the resource they're trying to access
        This is done by comparing the user_id in the JWT token with the user_id in the request path

        Note: If 'skip-auth' header is present, authentication is bypassed (for demo purposes)
        """
        # Check for skip-auth header (for demo/development purposes)
        skip_auth = request.headers.get("skip-auth")
        if skip_auth and skip_auth.lower() == "true":
            return True

        # Extract token from request
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="No authorization token provided")

        token = auth_header.split(" ")[1]
        secret_key = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
        algorithm = os.getenv("ALGORITHM", "HS256")

        try:
            payload = jwt.decode(token, secret_key, algorithms=[algorithm])
            authenticated_user_id = payload.get("sub")

            # Check if token is expired
            exp = payload.get("exp")
            if exp and datetime.fromtimestamp(exp) < datetime.utcnow():
                raise HTTPException(status_code=401, detail="Token has expired")

            # Compare the authenticated user ID with the requested user ID
            if str(authenticated_user_id) != str(user_id):
                raise HTTPException(status_code=403, detail="Access denied: insufficient permissions")

            return True
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")

    @staticmethod
    async def get_user_id_from_token(request: Request) -> Optional[int]:
        """
        Extract and return the user ID from the JWT token in the request
        """
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ")[1]
        secret_key = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
        algorithm = os.getenv("ALGORITHM", "HS256")

        try:
            payload = jwt.decode(token, secret_key, algorithms=[algorithm])
            user_id = payload.get("sub")

            # Check if token is expired
            exp = payload.get("exp")
            if exp and datetime.fromtimestamp(exp) < datetime.utcnow():
                return None

            return int(user_id) if user_id else None
        except JWTError:
            return None