// Auth utility functions for handling JWT tokens and user authentication

// Store JWT token in local storage
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('jwt_token', token);
  }
};

// Get JWT token from local storage
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('jwt_token');
  }
  return null;
};

// Remove JWT token from local storage
export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jwt_token');
  }
};

// Check if user is authenticated (token exists and is not expired)
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  if (!token) {
    return false;
  }

  try {
    // Decode the token to check if it's expired
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    // If token is expired
    if (payload.exp < currentTime) {
      removeAuthToken();
      return false;
    }

    return true;
  } catch (error) {
    // If there's an error decoding the token, remove it and return false
    removeAuthToken();
    return false;
  }
};

// Get user ID from token
export const getUserIdFromToken = (): number | null => {
  const token = getAuthToken();
  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Refresh token (placeholder - implement with your backend refresh endpoint)
export const refreshToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      setAuthToken(data.accessToken);
      return data.accessToken;
    } else {
      removeAuthToken();
      return null;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};
