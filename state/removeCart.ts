import Constants from "expo-constants";

const BASE_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;

export const removeCart = async (storeId: string, authToken: string) => {
  if (!authToken) {
    console.error("removeCart: Missing auth token");
    return { success: false };
  }

  try {
    console.log("Removing cart for store:", storeId);

    const res = await fetch(`${BASE_URL}/carts/remove/${storeId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.text();
      const parsedError = errorData ? JSON.parse(errorData) : {};
      console.error(`Failed to remove cart: ${res.status}`, parsedError);
      
      // If cart is already deleted (404) or doesn't exist, consider it successful
      if (res.status === 404 || (parsedError.error?.message && parsedError.error.message.includes('not found'))) {
        console.log("Cart already deleted or doesn't exist");
        return { success: true };
      }
      
      return { success: false };
    }

    // Handle empty body for 204 responses
    const text = await res.text();
    if (text) {
      const responseData = JSON.parse(text);
      console.log("Remove cart success:", responseData);
    } else {
      console.log("Remove cart success: No content returned (204)");
    }

    return { success: true };
  } catch (error) {
    console.error("removeCart error:", error);
    return { success: false };
  }
};