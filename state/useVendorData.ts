import { fetchStoreDetails } from "@/components/store/fetch-store-details";
import { FetchStoreDetailsResponseType } from "@/components/store/fetch-store-details-type";
import { fetchStoreItems } from "@/components/store/fetch-store-items";
import { FetchStoreItemsResponseType, StoreItem } from "@/components/store/fetch-store-items-type";
import { useQuery } from "@tanstack/react-query";

// Types
interface ComponentCatalogItem {
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
    maximum_value: number;
    offer_percent: number | null;
    offer_value: number | null;
    value: number;
  };
  quantity: {
    available: { count: number };
    maximum: { count: number };
  };
  provider_id: string;
  veg: boolean;
}

interface VendorData {
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
}

// Convert backend data to component format - OPTIMIZED
const convertToVendorData = (
  storeDetails: FetchStoreDetailsResponseType,
  storeItems: FetchStoreItemsResponseType
): VendorData | null => {
  try {
    if (!storeDetails || !storeItems?.results) return null;

    // Use a more efficient mapping approach
    const catalogItems: ComponentCatalogItem[] = storeItems.results.map((item: StoreItem) => {
      const isNonVeg = item.diet_type === "non_veg";
      const priceValue = item.price?.value ?? 0;
      const maxPriceValue = item.price?.maximum_value ?? priceValue;
      const quantity = item.quantity ?? 0;

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
        id: item.slug ||  "",
        location_id: item.location_id || "",
        non_veg: isNonVeg,
        price: {
          maximum_value: maxPriceValue,
          offer_percent: item.price?.offerPercent ?? null,
          offer_value: null,
          value: priceValue,
        },
        quantity: {
          available: { count: quantity },
          maximum: { count: quantity },
        },
        provider_id: storeDetails._id,
        veg: !isNonVeg,
        store_id: storeDetails._id,
        storeId: storeDetails._id,
      };
    });

    return {
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
    };
  } catch (error) {
    console.error("Error converting vendor data:", error);
    return null;
  }
};

// Query Keys
const QUERY_KEYS = {
  storeDetails: (vendorSlug: string) => ["storeDetails", vendorSlug],
  storeItems: (vendorSlug: string) => ["storeItems", vendorSlug],
  vendorData: (vendorSlug: string) => ["vendorData", vendorSlug],
} as const;

// Error message helper
const getErrorMessage = (error: Error | null): string => {
  if (!error) return "An unexpected error occurred";
  
  if (error.message.includes("Store ID is required")) {
    return "Store ID is required";
  }
  if (error.message.includes("Store not found")) {
    return "Store not found or unavailable";
  }
  if (error.message.includes("Failed to process")) {
    return "Failed to process store data";
  }
  
  return "Failed to load store details. Please check your connection.";
};

// OPTIMIZED custom hook for fetching vendor data
export const useVendorData = (vendorSlug: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.vendorData(vendorSlug),
    queryFn: async (): Promise<VendorData | null> => {
      if (!vendorSlug) {
        throw new Error("Store ID is required");
      }

      // Parallel fetch for better performance
      const [storeDetails, storeItems] = await Promise.all([
        fetchStoreDetails(vendorSlug),
        fetchStoreItems(vendorSlug),
      ]);

      if (!storeDetails || !storeItems) {
        throw new Error("Store not found or unavailable");
      }

      const convertedData = convertToVendorData(storeDetails, storeItems);
      if (!convertedData) {
        throw new Error("Failed to process store data");
      }

      console.log(`Store loaded: ${storeDetails.name} (${convertedData.catalogs.length} items)`);
      return convertedData;
    },
    enabled: !!vendorSlug,
    // AGGRESSIVE CACHING FOR STORE DATA
    staleTime: 1000 * 60 * 15, // 15 minutes (stores don't change frequently)
    gcTime: 1000 * 60 * 60, // 1 hour in cache
    refetchOnWindowFocus: false, // Don't refetch when returning to app
    refetchOnMount: false, // Don't refetch on mount if data exists
    refetchOnReconnect: true, // Only refetch on network reconnect
    retry: 2, // Reduced retry attempts
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Faster retry
    // Add network mode for offline support
    networkMode: 'online',
  });
};

// SEPARATE HOOK FOR STORE DETAILS ONLY (lighter payload)
export const useStoreDetails = (vendorSlug: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.storeDetails(vendorSlug),
    queryFn: () => fetchStoreDetails(vendorSlug),
    enabled: !!vendorSlug,
    staleTime: 1000 * 60 * 30, // 30 minutes for basic store info
    gcTime: 1000 * 60 * 60 * 2, // 2 hours in cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// SEPARATE HOOK FOR STORE ITEMS ONLY
export const useStoreItems = (vendorSlug: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.storeItems(vendorSlug),
    queryFn: () => fetchStoreItems(vendorSlug),
    enabled: !!vendorSlug,
    staleTime: 1000 * 60 * 10, // 10 minutes for items (may change more frequently)
    gcTime: 1000 * 60 * 30, // 30 minutes in cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export { QUERY_KEYS, getErrorMessage, convertToVendorData };
export type { VendorData, ComponentCatalogItem };