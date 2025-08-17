import { create } from "zustand";
import { fetchFavs, FavoriteProduct, FavoriteStore } from "../components/fav/fetch-favs";
import { updateFavAction } from "../components/fav/updateFav";

export type Product = FavoriteProduct;
export type Store = FavoriteStore;

interface FavoriteState {
  allFavorites: { products: Product[]; stores: Store[] };
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  fetchFavs: (authToken: string) => Promise<void>;
  addFavorite: (productId: string, authToken: string) => Promise<void>;
  removeFavorite: (productId: string, authToken: string) => Promise<void>;
  addStoreFavorite: (storeId: string, authToken: string) => Promise<void>;
  removeStoreFavorite: (storeId: string, authToken: string) => Promise<void>;
}

const normalizeFavorites = (favorites: any) => ({
  products: favorites?.products || [],
  stores: favorites?.stores || favorites?.outlets || [],
});

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  allFavorites: { products: [], stores: [] },
  isLoading: false,
  isUpdating: false,
  error: null,

  fetchFavs: async (authToken) => {
    if (!authToken) {
      set({ error: "Authentication required" });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const favorites = await fetchFavs(authToken);
      set({
        allFavorites: normalizeFavorites(favorites),
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch favorites",
        isLoading: false,
      });
    }
  },

  addFavorite: async (productId, authToken) => {
    if (!authToken) return;
    const current = get().allFavorites;
    if (!current.products.some((p) => p.id === productId)) {
      set({
        allFavorites: { ...current, products: [...current.products, { id: productId } as Product] },
      });
    }
    set({ isUpdating: true });
    try {
      await updateFavAction(authToken, { action: "add", entity: "product", slug: productId });
      const favorites = await fetchFavs(authToken);
      set({ allFavorites: normalizeFavorites(favorites), isUpdating: false });
    } catch {
      set({ error: "Failed to add favorite", isUpdating: false });
    }
  },

  removeFavorite: async (productId, authToken) => {
    if (!authToken) return;
    const current = get().allFavorites;
    set({
      allFavorites: { ...current, products: current.products.filter((p) => p.id !== productId) },
      isUpdating: true,
    });
    try {
      await updateFavAction(authToken, { action: "remove", entity: "product", slug: productId });
      set({ isUpdating: false });
    } catch {
      try {
        const favorites = await fetchFavs(authToken);
        set({ allFavorites: normalizeFavorites(favorites), isUpdating: false });
      } catch {
        set({ error: "Failed to remove favorite", isUpdating: false });
      }
    }
  },

  addStoreFavorite: async (storeId, authToken) => {
    if (!authToken) return;
    const current = get().allFavorites;
    if (!current.stores.some((s) => s.id === storeId)) {
      set({
        allFavorites: { ...current, stores: [...current.stores, { id: storeId } as Store] },
      });
    }
    set({ isUpdating: true });
    try {
      await updateFavAction(authToken, { action: "add", entity: "store", slug: storeId });
      const favorites = await fetchFavs(authToken);
      set({ allFavorites: normalizeFavorites(favorites), isUpdating: false });
    } catch {
      set({ error: "Failed to add store favorite", isUpdating: false });
    }
  },

  removeStoreFavorite: async (storeId, authToken) => {
    if (!authToken) return;
    const current = get().allFavorites;
    set({
      allFavorites: { ...current, stores: current.stores.filter((s) => s.id !== storeId) },
      isUpdating: true,
    });
    try {
      await updateFavAction(authToken, { action: "remove", entity: "store", slug: storeId });
      set({ isUpdating: false });
    } catch {
      try {
        const favorites = await fetchFavs(authToken);
        set({ allFavorites: normalizeFavorites(favorites), isUpdating: false });
      } catch {
        set({ error: "Failed to remove store favorite", isUpdating: false });
      }
    }
  },
}));
