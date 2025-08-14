import Constants from "expo-constants";

const BASE_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;

export const updateQty = async (
  cartItemId: string,
  qty: number,
  authToken: string
) => {
  try {
    if (!authToken) {
      console.warn("No auth token provided — cannot update cart item qty");
      return false;
    }

    if (!cartItemId || typeof qty !== "number") {
      console.warn("Invalid cartItemId or qty");
      return false;
    }

  const res = await fetch(`${BASE_URL}/carts/update-item`, {
  method: "PUT",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
  body: JSON.stringify({ cartItemId, qty, update_target: "qty" }),
});

const data = await res.json().catch(() => ({}));
console.log("API response:", res.status, data);

if (!res.ok) return false;


    return true;
  } catch (error) {
    console.error("updateQty error:", error);
    return false;
  }
};
