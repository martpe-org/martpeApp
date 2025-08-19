export interface ProductPrice {
  currency: string;
  value: number;
  maximum_value?: number;
  offerPercent?: number;
}

export interface FavoriteProduct {
  id: string;
  name: string;
  image: string;
  price: ProductPrice | number;
}

export interface FavoriteStore {
  id: string;
  slug: string;
  descriptor?: {
    name?: string;
    symbol?: string;
  };
  address?: {
    locality?: string;
    city?: string;
    state?: string;
  };
  calculated_max_offer?: {
    percent?: number;
  };
  panIndia?: boolean;
}

export interface FetchFavsResponseType {
  products: FavoriteProduct[];
  stores?: FavoriteStore[]; // optional since API may or may not return
}


export const fetchFavs = async (
  authToken: string
): Promise<FetchFavsResponseType | null> => {
  try {
    console.log("Fetching favorites from:", `${process.env.EXPO_PUBLIC_API_URL}/users/favs`);

    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/favs`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.log("fetch favs failed", await res.json());
      throw new Error("Failed to fetch favorites");
    }

    const data = (await res.json()) as FetchFavsResponseType;
    console.log("✅ Favorites fetched:", data);
    return data;
  } catch (error) {
    console.error("❌ Fetch favs error:", error);
    return null;
  }
};
