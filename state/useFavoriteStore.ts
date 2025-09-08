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
  addFavorite: (productId: string, authToken: string, productData?: Partial<Product>) => Promise<void>;
  removeFavorite: (productId: string, authToken: string) => Promise<void>;
  addStoreFavorite: (store: Store, authToken: string) => Promise<void>;
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
      console.log("📦 Raw favorites from API:", favorites);

      const normalizedFavorites = normalizeFavorites(favorites);
      console.log("✨ Normalized favorites:", normalizedFavorites);

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

  addFavorite: async (productId, authToken, productData) => {
    if (!authToken) return;
    
    const current = get().allFavorites;
    
    // Check if already exists
    if (current.products.some((p) => p.id === productId || p.slug === productId)) {
      console.log("Product already in favorites");
      return;
    }

    set({ isUpdating: true, error: null });

    // Create optimistic product with available data
    const optimisticProduct: Product = {
      id: productId,
      slug: productId,
      ...productData, // Merge any additional product data passed
    } as Product;

    // Optimistically update UI
    const optimisticFavorites = {
      ...current,
      products: [...current.products, optimisticProduct],
    };
    
    set({ allFavorites: optimisticFavorites });
    await saveFavoritesToStorage(optimisticFavorites);

    try {
      const result = await updateFavAction(authToken, { 
        action: "add", 
        entity: "product", 
        slug: productId 
      });
      
      if (!result.success) {
        throw new Error("Failed to add favorite on server");
      }
      
      console.log("✅ Successfully added product to favorites");
      
      // Fetch fresh data to get complete product info
      setTimeout(() => {
        get().fetchFavs(authToken);
      }, 1000);
      
    } catch (error) {
      console.error("Failed to add favorite:", error);
      
      // Revert on failure
      const revertedFavorites = {
        ...current,
        products: current.products.filter((p) => p.id !== productId && p.slug !== productId),
      };
      
      set({ 
        allFavorites: revertedFavorites, 
        error: "Failed to add favorite" 
      });
      await saveFavoritesToStorage(revertedFavorites);
      throw error; // Re-throw to handle in UI
    } finally {
      set({ isUpdating: false });
    }
  },

  removeFavorite: async (productId, authToken) => {
    if (!authToken) return;
    
    const current = get().allFavorites;
    const productToRestore = current.products.find((p) => p.id === productId || p.slug === productId);
    
    if (!productToRestore) {
      console.log("Product not in favorites");
      return;
    }

    set({ isUpdating: true, error: null });

    // Optimistically update UI
    const optimisticFavorites = {
      ...current,
      products: current.products.filter((p) => p.id !== productId && p.slug !== productId),
    };
    
    set({ allFavorites: optimisticFavorites });
    await saveFavoritesToStorage(optimisticFavorites);

    try {
      const result = await updateFavAction(authToken, { 
        action: "remove", 
        entity: "product", 
        slug: productId 
      });
      
      if (!result.success) {
        throw new Error("Failed to remove favorite on server");
      }
      
      console.log("✅ Successfully removed product from favorites");
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      
      // Revert on failure
      const revertedFavorites = { 
        ...current, 
        products: [...current.products, productToRestore] 
      };
      
      set({ 
        allFavorites: revertedFavorites, 
        error: "Failed to remove favorite" 
      });
      await saveFavoritesToStorage(revertedFavorites);
      throw error; // Re-throw to handle in UI
    } finally {
      set({ isUpdating: false });
    }
  },

  addStoreFavorite: async (store, authToken) => {
    console.log("🏪 Adding store favorite:", { store, authToken: authToken ? "✅" : "❌" });
    
    if (!authToken) {
      console.error("❌ No auth token provided");
      return;
    }
    
    const current = get().allFavorites;
    
    // Check if already exists (check both id and slug)
    if (current.stores.some((s) => s.id === store.id || s.slug === store.slug)) {
      console.log("Store already in favorites");
      return;
    }

    set({ isUpdating: true, error: null });

    // Ensure store has proper structure
    const optimisticStore: Store = {
      id: store.id || store.slug,
      slug: store.slug || store.id,
      descriptor: {
        name: store.descriptor?.name || store.name || "Unknown Store",
        short_desc: store.descriptor?.short_desc || store.short_desc || "",
        description: store.descriptor?.description || store.description || "",
        ...store.descriptor,
      },
      symbol: store.symbol || "",
      ...store,
    } as Store;

    // Optimistically update UI
    const optimisticFavorites = { 
      ...current, 
      stores: [...current.stores, optimisticStore] 
    };
    
    set({ allFavorites: optimisticFavorites });
    await saveFavoritesToStorage(optimisticFavorites);

    try {
      const result = await updateFavAction(authToken, { 
        action: "add", 
        entity: "store", 
        slug: store.id || store.slug 
      });
      
      if (!result.success) {
        throw new Error("Failed to add store favorite on server");
      }
      
      console.log("✅ Successfully added store to favorites");
      
      // Fetch fresh data to ensure we have complete store info
      setTimeout(() => {
        get().fetchFavs(authToken);
      }, 1000);
      
    } catch (error) {
      console.error("Failed to add store favorite:", error);
      
      // Revert on failure
      const revertedFavorites = { 
        ...current, 
        stores: current.stores.filter((s) => s.id !== store.id && s.slug !== store.slug) 
      };
      
      set({ 
        allFavorites: revertedFavorites, 
        error: "Failed to add store favorite" 
      });
      await saveFavoritesToStorage(revertedFavorites);
      throw error; // Re-throw to handle in UI
    } finally {
      set({ isUpdating: false });
    }
  },

  removeStoreFavorite: async (storeId, authToken) => {
    if (!authToken) return;
    
    const current = get().allFavorites;
    const storeToRestore = current.stores.find((s) => s.id === storeId || s.slug === storeId);
    
    if (!storeToRestore) {
      console.log("Store not in favorites");
      return;
    }

    set({ isUpdating: true, error: null });

    // Optimistically update UI
    const optimisticFavorites = { 
      ...current, 
      stores: current.stores.filter((s) => s.id !== storeId && s.slug !== storeId) 
    };
    
    set({ allFavorites: optimisticFavorites });
    await saveFavoritesToStorage(optimisticFavorites);

    try {
      const result = await updateFavAction(authToken, { 
        action: "remove", 
        entity: "store", 
        slug: storeId 
      });
      
      if (!result.success) {
        throw new Error("Failed to remove store favorite on server");
      }
      
      console.log("✅ Successfully removed store from favorites");
    } catch (error) {
      console.error("Failed to remove store favorite:", error);
      
      // Revert on failure
      const revertedFavorites = { 
        ...current, 
        stores: [...current.stores, storeToRestore] 
      };
      
      set({ 
        allFavorites: revertedFavorites, 
        error: "Failed to remove store favorite" 
      });
      await saveFavoritesToStorage(revertedFavorites);
      throw error; // Re-throw to handle in UI
    } finally {
      set({ isUpdating: false });
    }
  },
}));