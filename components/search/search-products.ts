import { SearchProductsResponseType } from "./search-products-type";

export const searchProducts = async (input: {
  lat: number;
  lon: number;
  pincode: string;
  query: string;
  domain?: string;
  groupbystore?: boolean;
  afterkey?: string;
  category?: string;
  size?: number;
  page?: number;
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
    if (input.afterkey) queryParams.push(`afterkey=${encodeURIComponent(input.afterkey)}`);
    if (input.category) queryParams.push(`category=${encodeURIComponent(input.category)}`);
    if (input.size) queryParams.push(`size=${input.size}`);
    if (input.groupbystore) queryParams.push(`groupbystore=true`);
    if (input.page) queryParams.push(`page=${input.page}`);
    if (input.quicksearch) queryParams.push(`quicksearch=${encodeURIComponent(input.quicksearch)}`);

    const queryString = queryParams.join("&");

    const url = `${process.env.EXPO_PUBLIC_API_URL}/search/products?${queryString}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.log("❌ search products failed:", res.status, errorText);
    }

    const data = (await res.json()) as SearchProductsResponseType;
    return data;
  } catch (error) {
    console.log("⚠️ Search products error:", error);
    return null;
  }
};
