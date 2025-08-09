// state/homeDataStore.ts
import { create } from "zustand";
import { Store2 } from "../../hook/fetch-home-type";

interface HomeDataState {
  homeDataFetched: boolean;
  restaurantsData: Store2[];
  storesData: Store2[];
  setHomeDataFetched: (value: boolean) => void;
  setRestaurantsData: (data: Store2[]) => void;
  setStoresData: (data: Store2[]) => void;
}

export const useHomeDataStore = create<HomeDataState>((set) => ({
  homeDataFetched: false,
  restaurantsData: [],
  storesData: [],
  setHomeDataFetched: (value) => set({ homeDataFetched: value }),
  setRestaurantsData: (data) => set({ restaurantsData: data }),
  setStoresData: (data) => set({ storesData: data }),
}));
