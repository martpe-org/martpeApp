import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;

export const removeCart = async (storeId: string, authToken: string) => {
  if (!authToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/cart/${storeId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!res.ok) throw new Error(`Failed to remove cart: ${res.status}`);
    return true;
  } catch (error) {
    console.error("removeCart error:", error);
    return false;
  }
};

