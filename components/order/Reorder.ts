import { CartItemStateType } from "../user/fetch-user-type";

// Replace with your actual backend URL or use environment variables
const BACKEND_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://your-api-domain.com";

export const reOrder = async (
  orderId: string,
  storeId: string,
  accessToken: string
): Promise<CartItemStateType[] | null> => {
  try {
    if (!BACKEND_BASE_URL) {
      throw new Error("API base URL is not defined");
    }

    const url = `${BACKEND_BASE_URL}/reorder`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        orderId,
        storeId,
      }),
    });

    if (!response.ok) {
      console.log("❌ Reorder failed:", response.status, response.statusText);
      throw new Error(`Reorder failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Reorder response:", data);

    // Validate response data structure
    if (!Array.isArray(data)) {
      throw new Error("Invalid response format: expected array of cart items");
    }

    return data as CartItemStateType[];
  } catch (error) {
    console.log("⚠️ Error in reordering!", error);
    return null;
  }
};