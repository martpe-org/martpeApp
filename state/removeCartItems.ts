import Constants from "expo-constants";

const BASE_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;

export const removeCartItems = async (itemIds: string[], authToken: string) => {
  if (!authToken) {
    console.error("removeCartItems: Missing auth token");
    return { success: false };
  }

  try {
    console.log("Removing cart items:", itemIds);

    const res = await fetch(`${BASE_URL}/carts/remove-items`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ item_ids: itemIds }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      const errorData = errorText ? JSON.parse(errorText) : {};
      console.error(`Failed to remove cart items: ${res.status}`, errorData);
      return { success: false };
    }

    // Handle empty body for 204 responses
    const text = await res.text();
    if (text) {
      const responseData = JSON.parse(text);
      console.log("Remove cart items success:", responseData);
    } else {
      console.log("Remove cart items success: No content returned (204)");
    }

    return { success: true };
  } catch (error) {
    console.error("removeCartItems error:", error);
    return { success: false };
  }
};