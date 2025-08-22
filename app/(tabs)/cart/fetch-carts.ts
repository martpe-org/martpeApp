import { FetchCartType } from "./fetch-carts-type";

export const fetchCarts = async (authToken: string) => {
  try {
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/carts`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error();
    }

    return (await res.json()) as FetchCartType[];
  } catch (error) {
    return null;
  }
};
