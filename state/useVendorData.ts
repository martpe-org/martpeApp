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
  _id: string; // This is crucial for cart functionality
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

// Convert backend data to component format - File 2 style
const convertToVendorData = (
  storeDetails: FetchStoreDetailsResponseType,
  storeItems: FetchStoreItemsResponseType
): VendorData | null => {
  try {
    if (!storeDetails || !storeItems?.results) return null;

    const catalogItems: ComponentCatalogItem[] = storeItems.results.map(
      (item: StoreItem) => ({
        bpp_id: storeDetails._id, // Use storeDetails._id consistently
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
        id: item.slug || item._id || "",
        location_id: item.location_id || "",
        non_veg: item.diet_type === "non_veg",
        price: {
          maximum_value: item.price?.maximum_value ?? item.price?.value ?? 0,
          offer_percent: item.price?.offerPercent ?? null,
          offer_value: null,
          value: item.price?.value ?? 0,
        },
        quantity: {
          available: { count: item.quantity ?? 0 },
          maximum: { count: item.quantity ?? 0 },
        },
        provider_id: storeDetails._id, // Use storeDetails._id consistently
        veg: item.diet_type === "veg" || item.diet_type !== "non_veg",
      })
    );

    return {
      _id: storeDetails._id, // This _id is crucial for cart functionality
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

// Custom hook for fetching vendor data - File 2 style
export const useVendorData = (vendorSlug: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.vendorData(vendorSlug),
    queryFn: async (): Promise<VendorData | null> => {
      if (!vendorSlug) {
        throw new Error("Store ID is required");
      }

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

      console.log("Store details loaded successfully:", storeDetails.name);
      return convertedData;
    },
    enabled: !!vendorSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export { QUERY_KEYS, getErrorMessage, convertToVendorData };
export type { VendorData, ComponentCatalogItem };