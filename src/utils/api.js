const BASE_URL = "https://salty-crabs-read.loca.lt/api/users"; // Replace with your localtunnel URL

// Login API call
export const loginUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid email or password");
  }

  const data = await response.json();
  localStorage.setItem("token", data.token); // Store the token in localStorage
  return data;
};

// Register API call
export const registerUser = async (formData) => {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST", // Ensure the method is POST
      headers: {
        "Content-Type": "application/json",
        "bypass-tunnel-reminder": "true", // Add bypass header if needed
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorText = await response.text(); // Read response as text
      throw new Error(errorText || "Failed to register");
    }

    return await response.json(); // Return the response data
  } catch (error) {
    console.error("Register error:", error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  const token = localStorage.getItem("token"); // Retrieve token from localStorage
  const response = await fetch(`${BASE_URL}/${userId}`, {
    // Corrected URL
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Include the token in the request
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete user");
  }

  return await response.json();
};

export const getAllUsers = async () => {
  const token = localStorage.getItem("token"); // Retrieve token from localStorage
  const response = await fetch(`${BASE_URL}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Include the token in the request
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return await response.json();
};

// Get current user info
export const getCurrentUser = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch user info");
  }
  return await response.json();
};

// Update current user info
export const updateUser = async (userData) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}/${userData._id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update user");
  }
  return await response.json();
};
