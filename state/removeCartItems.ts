// import Constants from "expo-constants";

// const BASE_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;

export const removeCartItems = async (cartItemIds: string[], authToken: string) => {
  try {
    if (!authToken) {
      console.warn("No auth token provided — cannot remove cart items");
      return false;
    }

    console.log("Removing cart items:", cartItemIds);

    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/carts/remove-items`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ cartItemIds }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error(`Failed to remove cart items: ${res.status}`, errorData);
      return false;
    }

    console.log("Remove cart items success");
    return true;
  } catch (error) {
    console.error("removeCartItems error:", error);
    return false;
  }
};