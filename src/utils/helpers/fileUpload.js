/**
 * Utility functions for file uploads
 */

import { ENDPOINTS } from "../constants/api";
import { getAuthHeaders } from "../api/base";

/**
 * Uploads files to the server
 * @param {FileList|File[]} files - Files to upload
 * @param {string} type - Type of upload (e.g., 'product', 'profile', etc.)
 * @returns {Promise<string[]>} Array of uploaded file URLs
 * @throws {Error} If upload fails
 */
export async function uploadFiles(files, type = "product") {
  try {
    console.log(`Starting upload of ${files.length} files with type: ${type}`);

    if (!files || files.length === 0) {
      console.warn("No files provided to uploadFiles function");
      return [];
    }

    const formData = new FormData();

    // Convert FileList to array if needed
    const filesArray = Array.from(files);

    console.log(`Preparing ${filesArray.length} files for upload`);

    // Add file info for debugging
    filesArray.forEach((file, index) => {
      console.log(`File ${index + 1}:`, {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)}KB`,
      });
    });

    // Append each file to FormData
    filesArray.forEach((file) => {
      formData.append("files", file);
    });

    // Add file type
    formData.append("type", type);

    // Log the endpoint we're uploading to
    console.log(`Uploading to endpoint: ${ENDPOINTS.UPLOAD}`);

    // Get auth headers for the request
    const headers = getAuthHeaders(true);
    console.log("Upload request headers:", headers);

    // Upload the files
    const response = await fetch(`${ENDPOINTS.UPLOAD}`, {
      method: "POST",
      headers,
      body: formData,
    });

    console.log(
      `Upload response status: ${response.status} ${response.statusText}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Upload API error:", errorText);
      throw new Error(`Upload failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    if (!result || !Array.isArray(result.urls)) {
      console.error("Invalid upload response format:", result);
      throw new Error("Upload succeeded but received invalid response format");
    }

    console.log(
      `Upload successful! Received ${result.urls.length} URLs:`,
      result.urls
    );
    return result.urls;
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
}

/**
 * Create a local URL for file preview (temporary)
 * @param {File} file - File to create URL for
 * @returns {string} URL for the file
 */
export function createLocalFileURL(file) {
  return URL.createObjectURL(file);
}

/**
 * Revoke a local file URL when no longer needed
 * @param {string} url - URL to revoke
 */
export function revokeLocalFileURL(url) {
  URL.revokeObjectURL(url);
}
