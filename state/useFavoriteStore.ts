import { create } from "zustand";
import { fetchFavs, FavoriteProduct, FavoriteStore } from "../components/fav/fetch-favs";
import { updateFavAction } from "../components/fav/updateFav";
import { getAsyncStorageItem, setAsyncStorageItem } from "../utility/asyncStorage";

export type Product = FavoriteProduct;
export type Store = FavoriteStore;

interface FavoriteState {
  allFavorites: { products: Product[]; stores: Store[] };
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  loadFavoritesFromStorage: () => Promise<void>;
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

const saveFavoritesToStorage = async (favorites: { products: Product[]; stores: Store[] }) => {
  try {
    await setAsyncStorageItem("userFavorites", JSON.stringify(favorites));
  } catch (error) {
    console.error("Failed to save favorites to storage:", error);
  }
};

const loadFavoritesFromStorage = async (): Promise<{ products: Product[]; stores: Store[] }> => {
  try {
    const stored = await getAsyncStorageItem("userFavorites");
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to load favorites from storage:", error);
  }
  return { products: [], stores: [] };
};

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  allFavorites: { products: [], stores: [] },
  isLoading: false,
  isUpdating: false,
  error: null,

  loadFavoritesFromStorage: async () => {
    const storedFavorites = await loadFavoritesFromStorage();
    set({ allFavorites: storedFavorites });
  },

 fetchFavs: async (authToken) => {
  if (!authToken) {
    set({ error: "Authentication required" });
    return;
  }
  set({ isLoading: true, error: null });
  try {
    const favorites = await fetchFavs(authToken);
    const normalizedFavorites = normalizeFavorites(favorites);
      
    // Save to AsyncStorage and update state
    await saveFavoritesToStorage(normalizedFavorites);
    set({
      allFavorites: normalizedFavorites,
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
    set({ isUpdating: true, error: null });

    const current = get().allFavorites;

    if (!current.products.some((p) => p.id === productId)) {
      const updatedFavorites = {
        ...current,
        products: [...current.products, { id: productId } as Product],
      };
      await saveFavoritesToStorage(updatedFavorites);
      set({ allFavorites: updatedFavorites });
    }

    try {
      await updateFavAction(authToken, { action: "add", entity: "product", slug: productId });
      await get().fetchFavs(authToken);
    } catch (error) {
      console.error("Failed to add favorite:", error);
      const reverted = {
        ...current,
        products: current.products.filter((p) => p.id !== productId),
      };
      await saveFavoritesToStorage(reverted);
      set({ allFavorites: reverted, error: "Failed to add favorite", isUpdating: false });
    } finally {
      set({ isUpdating: false });
    }
  },

  removeFavorite: async (productId, authToken) => {
    if (!authToken) return;
    set({ isUpdating: true, error: null });

    const current = get().allFavorites;
    const productToRestore = current.products.find((p) => p.id === productId);

    const updatedFavorites = {
      ...current,
      products: current.products.filter((p) => p.id !== productId),
    };
    await saveFavoritesToStorage(updatedFavorites);
    set({ allFavorites: updatedFavorites });

    try {
      await updateFavAction(authToken, { action: "remove", entity: "product", slug: productId });
      await get().fetchFavs(authToken);
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      if (productToRestore) {
        const reverted = { ...current, products: [...current.products, productToRestore] };
        await saveFavoritesToStorage(reverted);
        set({ allFavorites: reverted });
      }
      set({ error: "Failed to remove favorite", isUpdating: false });
    } finally {
      set({ isUpdating: false });
    }
  },

  addStoreFavorite: async (storeId, authToken) => {
    if (!authToken) return;
    set({ isUpdating: true, error: null });

    const current = get().allFavorites;

    if (!current.stores.some((s) => s.id === storeId)) {
      const updated = { ...current, stores: [...current.stores, { id: storeId } as Store] };
      await saveFavoritesToStorage(updated);
      set({ allFavorites: updated });
    }

    try {
      await updateFavAction(authToken, { action: "add", entity: "store", slug: storeId });
      await get().fetchFavs(authToken);
    } catch (error) {
      console.error("Failed to add store favorite:", error);
      const reverted = { ...current, stores: current.stores.filter((s) => s.id !== storeId) };
      await saveFavoritesToStorage(reverted);
      set({ allFavorites: reverted, error: "Failed to add store favorite", isUpdating: false });
    } finally {
      set({ isUpdating: false });
    }
  },

  removeStoreFavorite: async (storeId, authToken) => {
    if (!authToken) return;
    set({ isUpdating: true, error: null });

    const current = get().allFavorites;
    const storeToRestore = current.stores.find((s) => s.id === storeId);

    const updated = { ...current, stores: current.stores.filter((s) => s.id !== storeId) };
    await saveFavoritesToStorage(updated);
    set({ allFavorites: updated });

    try {
      await updateFavAction(authToken, { action: "remove", entity: "store", slug: storeId });
      await get().fetchFavs(authToken);
    } catch (error) {
      console.error("Failed to remove store favorite:", error);
      if (storeToRestore) {
        const reverted = { ...current, stores: [...current.stores, storeToRestore] };
        await saveFavoritesToStorage(reverted);
        set({ allFavorites: reverted });
      }
      set({ error: "Failed to remove store favorite", isUpdating: false });
    } finally {
      set({ isUpdating: false });
    }
  },
}));
