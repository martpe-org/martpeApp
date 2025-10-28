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
  stores?: FavoriteStore[];
}

export const fetchFavs = async (
  authToken: string
): Promise<FetchFavsResponseType | null> => {
  try {
    const url = `${process.env.EXPO_PUBLIC_API_URL}/users/favs`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.warn("⚠️ fetchFavs failed:", res.status, errBody);
      return null;
    }

    const data = (await res.json()) as FetchFavsResponseType;
    return data;
  } catch (error) {
    console.error("❌ Network/parse error in fetchFavs:", error);
    return null;
  }
};
