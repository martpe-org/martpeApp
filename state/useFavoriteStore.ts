import { create } from "zustand";
import { getAsyncStorageItem, setAsyncStorageItem } from "../utility/asyncStorage";
import { updateFavAction } from "../components/fav/updateFav"; // adjust path
import { initFavorites } from "./state-init/init-favorites"; // adjust path

const FAVORITES_KEY = "favorites_data";

interface FavoriteStore {
  allFavorites: { products: { id: string }[] };
  loadFavorites: () => Promise<void>;
  addFavorite: (productId: string) => Promise<void>;
  removeFavorite: (productId: string) => Promise<void>;
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  allFavorites: { products: [] },

  loadFavorites: async () => {
    const favorites = await initFavorites();
    set({ allFavorites: favorites });
  },

  addFavorite: async (productId: string) => {
    try {
      const token = await getAsyncStorageItem("authToken");
      if (!token) {
        console.error("No auth token found. Cannot update favorites.");
        return;
      }

      const result = await updateFavAction(token, {
        action: "add",
        entity: "product",
        slug: productId,
      });

      if (result?.success) {
        const updatedFavorites = {
          products: [...get().allFavorites.products, { id: productId }],
        };
        set({ allFavorites: updatedFavorites });
        await setAsyncStorageItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      }
    } catch (error) {
      console.error("Error adding favorite:", error);
    }
  },

  removeFavorite: async (productId: string) => {
    try {
      const token = await getAsyncStorageItem("authToken");
      if (!token) {
        console.error("No auth token found. Cannot update favorites.");
        return;
      }

      const result = await updateFavAction(token, {
        action: "remove",
        entity: "product",
        slug: productId,
      });

      if (result?.success) {
        const updatedFavorites = {
          products: get().allFavorites.products.filter((p) => p.id !== productId),
        };
        set({ allFavorites: updatedFavorites });
        await setAsyncStorageItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  },
}));
