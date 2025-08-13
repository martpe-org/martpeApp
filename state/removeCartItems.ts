import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;


export const removeCartItems = async (itemIds: string[], authToken: string) => {
  if (!authToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/cart/items`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ item_ids: itemIds }),
    });

    if (!res.ok) throw new Error(`Failed to remove cart items: ${res.status}`);
    return true;
  } catch (error) {
    console.error("removeCartItems error:", error);
    return false;
  }
};
