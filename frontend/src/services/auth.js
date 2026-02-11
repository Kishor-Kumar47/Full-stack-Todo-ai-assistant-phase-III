// Authentication service for handling user authentication

// Get the access token from localStorage
export const getAccessToken = () => {
  return typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
};

// Set the access token in localStorage
export const setAccessToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
};

// Remove the access token from localStorage
export const removeAccessToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAccessToken();
  return !!token;
};

// Get user data from token (decode JWT)
export const getUserFromToken = () => {
  const token = getAccessToken();
  if (!token) return null;

  try {
    // Decode JWT token (basic decoding, not secure for sensitive data)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};