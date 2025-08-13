import Constants from "expo-constants";

const BASE_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;

export const updateQty = async (
  cartItemId: string,
  qty: number,
  authToken: string
) => {
  if (!authToken) {
    console.error("updateQty: Missing auth token");
    return { success: false };
  }

  try {
    console.log("Updating quantity for item:", cartItemId, "to:", qty);

    const res = await fetch(`${BASE_URL}/carts/update-item`, {
      method: "PUT", // ✅ same as server action
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        cartItemId, // ✅ send cartItemId like server code
        qty,
        update_target: "qty", // ✅ match backend contract
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error(`updateQty failed: ${res.status}`, errorData);
      return { success: false };
    }

    console.log("updateQty success");
    return { success: true };
  } catch (error) {
    console.error("updateQty error:", error);
    return { success: false };
  }
};
