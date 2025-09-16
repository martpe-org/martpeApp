
import { FetchOrdersListResponseType } from "./fetch-orders-list-type";
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const fetchOrderList = async (
  authToken: string,
  page?: string | null,
  size?: string | null,
) => {
  try {
    if (!BASE_URL) {
      throw new Error("API base URL is not defined");
    }

    const url = `${BASE_URL}/orders?action=list${
      page ? `&page=${page}` : ""
    }${size ? `&size=${size}` : ""}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.log("❌ fetch orders failed:", res.status, res.statusText);
      throw new Error("Failed to fetch orders");
    }

    return (await res.json()) as FetchOrdersListResponseType;
  } catch (error) {
    console.log("⚠️ Fetch orders error", error);
    return null;
  }
};
