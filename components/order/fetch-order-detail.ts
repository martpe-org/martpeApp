import { FetchOrderDetailType } from "./fetch-order-detail-type";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const fetchOrderDetail = async (
  authToken: string,
  orderId: string
): Promise<FetchOrderDetailType | null> => {
  try {
    if (!BASE_URL) {
      throw new Error("API base URL is not defined");
    }

    const url = `${BASE_URL}/orders?action=detail&orderId=${orderId}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.log("❌ fetch order detail failed:", res.status, res.statusText);
      throw new Error("Failed to fetch order detail");
    }

    return (await res.json()) as FetchOrderDetailType;
  } catch (error) {
    console.log("⚠️ Fetch order detail error", error);
    return null;
  }
};
