import { createContext, useContext, useState, useCallback } from "react";
import Swal from "sweetalert2";
import Loader from "../components/layout/Loader";

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTimer, setLoadingTimer] = useState(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    if (loadingTimer) {
      clearTimeout(loadingTimer);
      setLoadingTimer(null);
    }
  }, [loadingTimer]);
  const handleAsyncOperation = useCallback(
    async (operation, errorMessage = "An error occurred") => {
      startLoading();
      let timer = null;
      let minLoadingTimer = null;

      try {
        // Ensure minimum loading time of 2.3s
        const minLoadingPromise = new Promise((resolve) => {
          minLoadingTimer = setTimeout(resolve, 2300);
        });

        const result = await Promise.race([
          operation(),
          new Promise((_, reject) => {
            timer = setTimeout(() => {
              reject(new Error("Request timed out"));
            }, 15000); // 15 second timeout
          }),
        ]);
        if (timer) {
          clearTimeout(timer);
        }
        stopLoading();
        return result;
      } catch (error) {
        if (timer) {
          clearTimeout(timer);
        }

        // Show loading state for at least 2.3s before showing error
        await new Promise((resolve) => setTimeout(resolve, 2300));

        stopLoading();
        Swal.fire({
          title: "Error",
          text: error.message || errorMessage,
          icon: "error",
          confirmButtonText: "OK",
        });
        throw error;
      }
    },
    [startLoading, stopLoading]
  );

  return (
    <LoadingContext.Provider
      value={{ isLoading, handleAsyncOperation, startLoading, stopLoading }}
    >
      {children}
      {isLoading && <Loader />}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
