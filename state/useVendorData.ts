import { fetchStoreDetails } from "@/components/store/fetch-store-details";
import { FetchStoreDetailsResponseType } from "@/components/store/fetch-store-details-type";
import { fetchStoreItems } from "@/components/store/fetch-store-items";
import { FetchStoreItemsResponseType, StoreItem } from "@/components/store/fetch-store-items-type";
import { useQuery } from "@tanstack/react-query";
export interface ComponentCatalogItem {
  bpp_id: string;
  bpp_uri: string;
  store_id: string;
  storeId: string;
  catalog_id: string;
  category_id: string;
  descriptor: {
    images: string[];
    long_desc: string;
    name: string;
    short_desc: string;
    symbol: string;
  };
  id: string;
  location_id: string;
  non_veg: boolean | null;
  price: {
    currency: string;
    value: number;
    maximum_value?: number;
    offerPercent: number | null;
  };
  quantity: {
    available: { count: number };
    maximum: { count: number };
  };
  provider_id: string;
  veg: boolean;
  // ✅ ADD THIS: Preserve the menu relationships
  custom_menu_id?: string[];
  customizable?: boolean;
  directlyLinkedCustomGroupIds?: string[];
    priceRangeDefault?: number;
}
export interface VendorData {
  _id: string;
  address?: {
    area_code?: string;
    city?: string;
    locality?: string;
    state?: string;
    street?: string;
  };
  catalogs: ComponentCatalogItem[];
  descriptor: {
    images: string[];
    name: string;
    symbol: string;
  };
  domain: string;
  geoLocation: {
    lat: number;
    lng: number;
  };
  storeSections: string[];
  panIndia: boolean;
  hyperLocal: boolean;
  /** ✅ Added: custom menus for F&B and others */
  custom_menus?: {
    name: string;
    short_desc?: string;
    long_desc?: string;
    images?: any[];
    type: string;
    display?: { rank?: string };
    custom_menu_id: string;
  }[];
}

const convertToVendorData = (
  storeDetails: FetchStoreDetailsResponseType,
  storeItems: FetchStoreItemsResponseType
): VendorData | null => {
  try {
    if (!storeDetails || !storeItems?.results) return null;

    const catalogItems: ComponentCatalogItem[] = storeItems.results.map(
      (item: StoreItem) => {
        const isNonVeg = item.diet_type === "non_veg";
        const priceValue = item.price?.value ?? 0;
        const maxPriceValue = item.price?.maximum_value ?? priceValue;
        const quantityCount =
          typeof item.quantity === "number"
            ? item.quantity
            : item.quantity ?? 0;

        const customMenuIds = item.custom_menu_id || [];

        return {
          bpp_id: storeDetails._id,
          bpp_uri: "",
          catalog_id: item.catalog_id || "",
          category_id: item.category_id || "",
          descriptor: {
            images: item.images || [],
            long_desc: item.short_desc || "",
            name: item.name || "",
            short_desc: item.short_desc || "",
            symbol: item.symbol || "",
          },
          id: item.slug || "",
          location_id: item.location_id || "",
          non_veg: isNonVeg,
          price: {
            value: priceValue,
            maximum_value: maxPriceValue,
            offerPercent: item.price?.offerPercent ?? null,
            currency: "INR",
          },
          quantity: {
            available: { count: quantityCount },
            maximum: { count: quantityCount },
          },
          provider_id: storeDetails._id,
          veg: !isNonVeg,
          store_id: storeDetails._id,
          storeId: storeDetails._id,
          customizable: item.customizable || false,
          directlyLinkedCustomGroupIds: item.directlyLinkedCustomGroupIds || [], // ✅ MAP THIS
          custom_menu_id: customMenuIds,
          priceRangeDefault: item.priceRangeDefault || priceValue
        };
      }
    );

    const converted: VendorData = {
      _id: storeDetails._id,
      address: {
        area_code: storeDetails.address?.area_code || "",
        city: storeDetails.address?.city || "",
        locality: storeDetails.address?.locality || "",
        state: storeDetails.address?.state || "",
        street: storeDetails.address?.street || "",
      },
      catalogs: catalogItems,
      descriptor: {
        images: storeDetails.images || [],
        name: storeDetails.name || "",
        symbol: storeDetails.symbol || "",
      },
      domain: storeDetails.domain || "",
      geoLocation: {
        lat: storeDetails.gps?.lat || 0,
        lng: storeDetails.gps?.lon || 0,
      },
      storeSections: storeDetails.store_categories || [],
      panIndia: !!storeDetails.isPanindia,
      hyperLocal: !!storeDetails.isHyperLocalOnly,
      custom_menus: storeDetails.custom_menus || [],
    };

    return converted;
  } catch (error) {
    console.error("❌ Error converting vendor data:", error);
    return null;
  }
};

export const QUERY_KEYS = {
  storeDetails: (vendorSlug: string) => ["storeDetails", vendorSlug],
  storeItems: (vendorSlug: string) => ["storeItems", vendorSlug],
  vendorData: (vendorSlug: string) => ["vendorData", vendorSlug],
} as const;


export const getErrorMessage = (error: Error | null): string => {
  if (!error) return "An unexpected error occurred";
  if (error.message.includes("Store ID is required"))
    return "Store ID is required";
  if (error.message.includes("Store not found"))
    return "Store not found or unavailable";
  if (error.message.includes("Failed to process"))
    return "Failed to process store data";
  return "Failed to load store details. Please check your connection.";
};

// 🧩 Fetch full vendor (store) data including items
export const useVendorData = (vendorSlug: string) =>
  useQuery({
    queryKey: QUERY_KEYS.vendorData(vendorSlug),
    queryFn: async (): Promise<VendorData | null> => {
      if (!vendorSlug) throw new Error("Store ID is required");

      const [storeDetails, storeItems] = await Promise.all([
        fetchStoreDetails(vendorSlug),
        fetchStoreItems(vendorSlug),
      ]);

      if (!storeDetails || !storeItems)
        throw new Error("Store not found or unavailable");

      const converted = convertToVendorData(storeDetails, storeItems);
      if (!converted) throw new Error("Failed to process store data");
      return converted;
    },
    enabled: !!vendorSlug,
    staleTime: 1000 * 60 * 15, // 15 min cache
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    networkMode: "online",
  });

// 🧩 Lighter fetch: store details only
export const useStoreDetails = (vendorSlug: string) =>
  useQuery({
    queryKey: QUERY_KEYS.storeDetails(vendorSlug),
    queryFn: () => fetchStoreDetails(vendorSlug),
    enabled: !!vendorSlug,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

// 🧩 Fetch only store items
export const useStoreItems = (vendorSlug: string) =>
  useQuery({
    queryKey: QUERY_KEYS.storeItems(vendorSlug),
    queryFn: () => fetchStoreItems(vendorSlug),
    enabled: !!vendorSlug,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

export { convertToVendorData };
