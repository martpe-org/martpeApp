import Constants from "expo-constants";

const BASE_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL;

// Define the type here so no GraphQL dependency
export interface FetchFavsResponseType {
  products: { id: string }[];
}

export const fetchFavs = async (authToken: string): Promise<FetchFavsResponseType | null> => {
  try {
    console.log("Fetching favorites from:", `${BASE_URL}/users/favs`);

    const res = await fetch(`${BASE_URL}/users/favs`, {
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

    return (await res.json()) as FetchFavsResponseType;
  } catch (error) {
    console.error("Fetch favs error", error);
    return null;
  }
};
