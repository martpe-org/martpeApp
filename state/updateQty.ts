import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;


export const updateQty = async (cartItemId: string, quantity: number, authToken: string) => {
  if (!authToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/cart/items/${cartItemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ quantity }),
    });

    if (!res.ok) throw new Error(`Failed to update quantity: ${res.status}`);
    return true;
  } catch (error) {
    console.error("updateQty error:", error);
    return false;
  }
};

