import { create } from "zustand";
import { setAsyncStorageItem } from "../utility/asyncStorage";
import { updateFavAction } from "../components/fav/updateFav";
import { initFavorites } from "./state-init/init-favorites";

const FAVORITES_KEY = "favorites_data";

interface FavoriteStore {
  allFavorites: { products: { id: string }[] };
  loadFavorites: () => Promise<void>;
  addFavorite: (productId: string, authToken: string) => Promise<void>;
  removeFavorite: (productId: string, authToken: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  allFavorites: { products: [] },

  loadFavorites: async () => {
    try {
      const favorites = await initFavorites();
      set({ allFavorites: favorites });
      await setAsyncStorageItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (err) {
      console.error("Error loading favorites:", err);
    }
  },

  addFavorite: async (productId, authToken) => {
    try {
      if (!authToken) {
        console.error("No auth token found. Cannot update favorites.");
        return;
      }

      const result = await updateFavAction(authToken, {
        action: "add",
        entity: "product",
        slug: productId,
      });

      if (result?.success) {
        const currentFavs = get().allFavorites.products;
        const alreadyExists = currentFavs.some((p) => p.id === productId);

        if (!alreadyExists) {
          const updatedFavorites = {
            products: [...currentFavs, { id: productId }],
          };
          set({ allFavorites: updatedFavorites });
          await setAsyncStorageItem(
            FAVORITES_KEY,
            JSON.stringify(updatedFavorites)
          );
        }
      }
    } catch (error) {
      console.error("Error adding favorite:", error);
    }
  },

  removeFavorite: async (productId, authToken) => {
    try {
      if (!authToken) {
        console.error("No auth token found. Cannot update favorites.");
        return;
      }

      const result = await updateFavAction(authToken, {
        action: "remove",
        entity: "product",
        slug: productId,
      });

      if (result?.success) {
        const updatedFavorites = {
          products: get().allFavorites.products.filter(
            (p) => p.id !== productId
          ),
        };
        set({ allFavorites: updatedFavorites });
        await setAsyncStorageItem(
          FAVORITES_KEY,
          JSON.stringify(updatedFavorites)
        );
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  },

  isFavorite: (productId) => {
    return get().allFavorites.products.some((p) => p.id === productId);
  },
}));
