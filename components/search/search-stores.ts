import { SearchStoresResponseType } from "./search-stores-type";

export const searchStores = async (input: {
  lat: number;
  lon: number;
  pincode: string;
  query: string;
  domain?: string;
  page?: number;
  category?: string;
  size?: number;
  quicksearch?: string;
}) => {
  try {
    const queryParams: string[] = [];

    queryParams.push(`query=${encodeURIComponent(input.query)}`);
    queryParams.push(`lat=${input.lat}`);
    queryParams.push(`lon=${input.lon}`);
    queryParams.push(`pincode=${input.pincode}`);

    if (input.domain)
      queryParams.push(`domain=${encodeURIComponent(input.domain.replace("ONDC:", ""))}`);
    if (input.page) queryParams.push(`page=${input.page}`);
    if (input.category) queryParams.push(`category=${encodeURIComponent(input.category)}`);
    if (input.size) queryParams.push(`size=${input.size}`);
    if (input.quicksearch)
      queryParams.push(`quicksearch=${encodeURIComponent(input.quicksearch)}`);

    const queryString = queryParams.join("&");

    const url = `${process.env.EXPO_PUBLIC_API_URL}/search/stores?${queryString}`;
    console.log("👉 searchStores url:", url);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.log("❌ search stores failed:", res.status, errorText);
      throw new Error(errorText || "Failed to fetch search stores");
    }

    const data = (await res.json()) as SearchStoresResponseType;
    return data;
  } catch (error) {
    console.log("⚠️ Search stores error:", error);
    return null;
  }
};
