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
    const params = new URLSearchParams();
    params.set("query", input.query);
    params.set("lat", input.lat.toString());
    params.set("lon", input.lon.toString());
    params.set("pincode", input.pincode);
    if (input.domain) params.set("domain", input.domain.replace("ONDC:", ""));
    if (input.afterkey) params.set("afterkey", input.afterkey);
    if (input.category) params.set("category", input.category);
    if (input.size) params.set("size", input.size.toString());
    if (input.groupbystore) params.set("groupbystore", "true");
    if (input.page) params.set("page", input.page.toString());

    const url = `${process.env.EXPO_PUBLIC_API_URL}/search/products?${params.toString()}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(res);

    if (!res.ok) {
      console.log("search products failed");
      throw new Error();
    }

    return (await res.json()) as SearchProductsResponseType;
  } catch (error) {
    console.log("Search products error ", error);
    return null;
  }
};