import { ApiErrorResponseType } from "@/common-types";
import { FetchCartType } from "./fetch-carts-type";

export const fetchCarts = async (authToken: string): Promise<FetchCartType[] | null> => {
  try {
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/carts`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData: ApiErrorResponseType = await res.json();
      console.log("Fetch carts failed", res.status, errorData);
      throw new Error(errorData?.message || "Failed to fetch carts");
    }

    const data: FetchCartType[] = await res.json();
    return data;
  } catch (error: any) {
    console.log("Fetch carts error:", error.message || error);
    return null;
  }
};
