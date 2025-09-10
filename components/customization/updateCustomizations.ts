// import Constants from 'expo-constants';
// const BASE_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;


export const updateCustomizations = async (
  cartItemId: string,
  customizations: any[],
  authToken: string
) => {
  if (!authToken) return false;

  try {
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/cart/items/${cartItemId}/customizations`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ customizations }),
    });

    if (!res.ok) throw new Error(`Failed to update customizations: ${res.status}`);
    return true;
  } catch (error) {
    console.error("updateCustomizations error:", error);
    return false;
  }
};
