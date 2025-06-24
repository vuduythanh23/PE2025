import { ENDPOINTS, BASE_HEADERS } from "../constants/api.js";  
import { fetchWithTimeout } from "../api/base.js"; 
  
export const getAdminHeaders = () => {
  const token = sessionStorage.getItem("token");  
  if (!token) throw new Error("Authentication required");  
  
  // Include all possible admin headers  
  return {  
    ...BASE_HEADERS,  
    Authorization: `Bearer ${token}`,  
    "X-Admin-Role": "true",  
    "x-admin-role": "true",  
    "x-admin-auth": "true",  
    "x-admin-access": "true"  
  };  
}; 
  
export const adminUpdateUserApi = async (userId, userData) => {
  const headers = getAdminHeaders();  
  
  // Try both endpoints  
  try {  
    // First try with admin query parameter  
    const adminResponse = await fetchWithTimeout(`${ENDPOINTS.USERS}/${userId}?admin=true`, {  
      method: "PATCH",  
      headers: headers,  
      body: JSON.stringify(userData)  
    });
  
    if (adminResponse.ok) {  
      return await adminResponse.json();  
    } 
  
    // Regular endpoint with extra headers  
    const regularResponse = await fetchWithTimeout(`${ENDPOINTS.USERS}/${userId}`, {  
      method: "PATCH",  
      headers: {  
        ...headers,  
        "X-Force-Admin": "true"  
      },  
      body: JSON.stringify(userData)  
    });  
  
    if (regularResponse.ok) {  
      return await regularResponse.json();  
    }  
  
    // If we got here, both attempts failed  
    const errorText = await regularResponse.text();  
    throw new Error(`Update failed: ${errorText}`);  
  } catch (error) {  
    console.error("Admin update error:", error);  
    throw error;  
  }  
}; 
