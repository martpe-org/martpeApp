import { fetchFavs } from "../../components/fav/fetch-favs";
import { getAsyncStorageItem, setAsyncStorageItem } from "../../utility/asyncStorage";

const FAVORITES_KEY = "favorites_data";

// Simple type definition for favorites
export interface FavoriteType {
  products: { id: string }[];
}

export async function initFavorites(): Promise<FavoriteType> {
  try {
    // 1️⃣ Try to load favorites from AsyncStorage
    const storedData = await getAsyncStorageItem(FAVORITES_KEY);
    if (storedData) {
      return JSON.parse(storedData) as FavoriteType;
    }

    // 2️⃣ Get auth token
    const authToken = await getAsyncStorageItem("authToken");
    if (!authToken) {
      console.warn("No auth token found while initializing favorites");
      return { products: [] };
    }

    // 3️⃣ Fetch from backend
    const response = await fetchFavs(authToken as string);
    if (response) {
      await setAsyncStorageItem(FAVORITES_KEY, JSON.stringify(response));
      return response;
    }

    return { products: [] };
  } catch (error) {
    console.error("Error initializing favorites:", error);
    return { products: [] };
  }
}
