import { create } from "zustand";
import { initFavorites } from "./state-init/init-favorites";
import  {updateFavAction}  from "../components/fav/updateFav";
import { setAsyncStorageItem } from "../utility/asyncStorage";
import { FavoriteType } from "../components/fav/fetch-favs-type";

const FAVORITES_KEY = "favorites_data";

interface FavoriteStore {
  allFavorites: FavoriteType;
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
      const result = await updateFavAction(productId, true );
      if (result) {
        const updatedFavorites = { products: [...get().allFavorites.products, { id: productId }] };
        set({ allFavorites: updatedFavorites });
        await setAsyncStorageItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      }
    } catch (error) {
      console.error("Error adding favorite:", error);
    }
  },

  removeFavorite: async (productId: string) => {
    try {
      const result = await updateFavAction(productId, false);
      if (result) {
        const updatedFavorites = {
          products: get().allFavorites.products.filter((item : any) => item.id !== productId),
        };
        set({ allFavorites: updatedFavorites });
        await setAsyncStorageItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  },
}));
