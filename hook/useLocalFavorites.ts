import { useEffect, useState } from "react";
import {
  getAsyncStorageItem,
  removeAsyncStorageItem,
  setAsyncStorageItem,
} from "../utility/asyncStorage";
import { useFavoriteStore } from "../state/useFavoriteStore";

interface FavoriteItem {
  id: string;
  addedAt: string; // ISO timestamp
  [key: string]: any; // for additional product data
}

const FAVORITES_KEY = "localFavorites";

const useLocalFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { allFavorites } = useFavoriteStore(); // 🔗 connect to global store

  // Load from AsyncStorage on mount
  useEffect(() => {
    initializeFavorites();
  }, []);

  // Sync with store whenever allFavorites changes
  useEffect(() => {
    if (allFavorites?.products) {
      const syncedFavorites: FavoriteItem[] = allFavorites.products.map((p: any) => ({
        id: p.id || p.slug,
        addedAt: new Date().toISOString(),
        ...p,
      }));

      setFavorites(syncedFavorites);
      setFavoriteIds(syncedFavorites.map((f) => f.id));
      setAsyncStorageItem(FAVORITES_KEY, JSON.stringify(syncedFavorites));
    }
  }, [allFavorites]);

  // Keep favoriteIds updated
  useEffect(() => {
    setFavoriteIds(favorites.map((item) => item.id));
  }, [favorites]);

  const initializeFavorites = async () => {
    try {
      setIsLoading(true);
      const storedFavorites = await getAsyncStorageItem(FAVORITES_KEY);
      if (storedFavorites && typeof storedFavorites === "string") {
        const parsedFavorites = JSON.parse(storedFavorites) as FavoriteItem[];
        setFavorites(parsedFavorites);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error("Error initializing favorites:", error);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFavoritesToStorage = async (updatedFavorites: FavoriteItem[]) => {
    try {
      await setAsyncStorageItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error("Error saving favorites:", error);
      throw error;
    }
  };

  const addToFavorites = async (productId: string, productData?: any) => {
    if (favoriteIds.includes(productId)) return false;
    const newFavorite: FavoriteItem = {
      id: productId,
      addedAt: new Date().toISOString(),
      ...productData,
    };
    const updatedFavorites = [...favorites, newFavorite];
    await saveFavoritesToStorage(updatedFavorites);
    return true;
  };

  const removeFromFavorites = async (productId: string) => {
    const updatedFavorites = favorites.filter((item) => item.id !== productId);
    await saveFavoritesToStorage(updatedFavorites);
    return true;
  };

  const toggleFavorite = async (productId: string, productData?: any) => {
    if (favoriteIds.includes(productId)) {
      await removeFromFavorites(productId);
      return { action: "removed", isFavorite: false };
    } else {
      await addToFavorites(productId, productData);
      return { action: "added", isFavorite: true };
    }
  };

  const isFavorite = (productId: string): boolean =>
    favoriteIds.includes(productId);

  const getFavoriteById = (productId: string): FavoriteItem | undefined =>
    favorites.find((item) => item.id === productId);

  const clearAllFavorites = async () => {
    await removeAsyncStorageItem(FAVORITES_KEY);
    setFavorites([]);
  };

  const getFavoriteCount = (): number => favorites.length;

  const getFavoritesByDateAdded = (
    ascending: boolean = false
  ): FavoriteItem[] => {
    return [...favorites].sort((a, b) => {
      const dateA = new Date(a.addedAt).getTime();
      const dateB = new Date(b.addedAt).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  };

  return {
    favorites,
    favoriteIds,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    clearAllFavorites,
    refreshFavorites: initializeFavorites,
    isFavorite,
    getFavoriteById,
    getFavoriteCount,
    getFavoritesByDateAdded,
  };
};

export default useLocalFavorites;
