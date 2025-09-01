export const removeCart = async (storeId: string, authToken: string) => {
  try {
    if (!authToken) {
      console.warn("No auth token provided — cannot remove cart");
      return false;
    }

    console.log("Removing cart for store:", storeId);

    // Use same endpoint as server — plural "carts" and DELETE method
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/carts/remove/${storeId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error(`Remove cart failed: ${res.status}`, errorData);
      return false;
    }

    console.log("Remove cart success");
    return true;
  } catch (error) {
    console.error("removeCart error:", error);
    return false;
  }
};