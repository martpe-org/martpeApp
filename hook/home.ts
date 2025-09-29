import { FetchHomeType } from "./fetch-home-type";

export const fetchHome = async (lat: number, lon: number, pincode: string) => {
  try {
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/home?lat=${lat}&lon=${lon}&pincode=${pincode}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) {
      console.log("fetch home failed");
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return (await res.json()) as FetchHomeType;
  } catch (error) {
    console.log("Fetch home error ", error);
    return null;
  }
};
