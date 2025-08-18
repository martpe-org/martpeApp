import { FetchHomeType } from "./fetch-home-type";
// import Constants from "expo-constants";

// const BASE_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;

export const fetchHome = async (
  lat: number,
  lon: number,
  pincode: string
): Promise<FetchHomeType | null> => {
  try {
    if (!process.env.EXPO_PUBLIC_API_URL) {
      console.error("❌ BASE_URL is not defined");
      return null;
    }

    const url = `${process.env.EXPO_PUBLIC_API_URL}/home?lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lon)}&pincode=${encodeURIComponent(pincode)}`;

    console.log(`🌐 FETCHHOME: lat=${lat} lon=${lon} pincode=${pincode}`);

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.error(`❌ fetchHome failed: ${res.status} ${res.statusText}`);
      return null;
    }

    console.log("✅ fetchHome success");
    return (await res.json()) as FetchHomeType;
  } catch (error) {
    console.error("❌ Fetch home error:", error);
    return null;
  }
};
