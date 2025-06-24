// Fixed version of updateProduct function
export async function updateProduct(id, updates) {
  try {
    // Ensure ID is valid
    if (!id) {
      throw new Error("Invalid product ID");
    }

    // Endpoint construction
    const endpoint = `${ENDPOINTS.PRODUCTS}/${id}`;

    // Get authorization headers
    const headers = getAuthHeaders();

    // Send request
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(updates),
    });

    // Handle error responses
    if (!res.ok) {
      const errorText = await res.text();
      let parsedError;
      try {
        // Try to parse error as JSON
        parsedError = JSON.parse(errorText);
        console.error("[API] Server error response (JSON):", parsedError);
      } catch (e) {
        // If not JSON, use plain text
        console.error("[API] Server error response (text):", errorText);
      }

      // Create descriptive error message
      const errorMessage =
        parsedError?.message ||
        parsedError?.error ||
        `Request failed with status ${res.status}`;

      throw new Error(`Failed to update product: ${errorMessage}`);
    }

    // Parse successful response
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("[API] Error in updateProduct:", error);
    throw error;
  }
}
