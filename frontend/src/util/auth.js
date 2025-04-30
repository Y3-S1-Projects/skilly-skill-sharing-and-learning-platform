// File: util/auth.js

// Function to get stored token from localStorage
export function getToken() {
  return localStorage.getItem("authToken") || sessionStorage.getItem("token");
}

// Function to get user ID
export async function getUserId(tokenParam) {
  // Use provided token or get from storage
  const token = tokenParam || getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch("http://localhost:8080/api/users/id", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(`Server error: ${errorData.error || response.status}`);
      } else {
        throw new Error(`Failed to get user ID: ${response.status}`);
      }
    }

    // Parse the JSON response
    const data = await response.json();

    // Extract the userId from the JSON object
    return data.userId;
  } catch (error) {
    console.error("Error fetching user ID:", error);
    throw error;
  }
}
// Function to get user role
export async function getUserRole(tokenParam) {
  // Use provided token or get from storage
  const token = tokenParam || getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch("http://localhost:8080/api/users/role", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(`Server error: ${errorData.error || response.status}`);
      } else {
        throw new Error(`Failed to get user role: ${response.status}`);
      }
    }

    const userRole = await response.text();
    return userRole;
  } catch (error) {
    console.error("Error fetching user role:", error);
    throw error;
  }
}

export const generateState = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

export const logout = () => {
  localStorage.removeItem("authToken");
  window.location.href = "/"; // Redirect user
};
