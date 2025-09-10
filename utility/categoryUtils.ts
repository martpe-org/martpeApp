import { useQuery } from "@tanstack/react-query";
import { fetchHomeByDomain } from "../hook/fetch-domain-data";
import { Store2 } from "../hook/fetch-domain-type";

// ✅ Slugify fallback - shared across all components
export const slugify = (name: string, fallback: string) =>
  name
    ? name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
    : fallback;

// ✅ Store transform - identical in all components
export const transformStoreData = (stores: Store2[]) => {
  return stores.map((store, index) => ({
    id: store.provider_id || `store-${index}`,
    slug:
      store.slug || slugify(store.name, store.provider_id || `store-${index}`),
    descriptor: {
      name: store.name,
      symbol: store.symbol,
      images: store.images,
    },
    address: {
      city: store.address?.city || "",
      state: store.address?.state || "",
    },
    geoLocation: {
      lat: store.gps?.lat,
      lng: store.gps?.lon,
    },
    calculated_max_offer: {
      percent: store.maxStoreItemOfferPercent || 0,
    },
    // Only Food.tsx uses this, but it's safe to include for all
    time_to_ship_in_hours: store.time_to_ship_in_hours,
  }));
};

// ✅ Domain fetch hook - shared logic with domain parameter
export const useDomainData = (
  domain: string,
  lat?: number,
  lng?: number,
  pincode?: string
) => {
  return useQuery({
    queryKey: ["domainData", domain, lat, lng, pincode],
    queryFn: async () => {
      if (!lat || !lng || !pincode) {
        throw new Error("Location data is required");
      }
      const response = await fetchHomeByDomain(
        lat,
        lng,
        pincode,
        domain,
        1,
        20
      );
      if (!response) throw new Error("Failed to fetch domain data");

      return {
        stores: transformStoreData(response.stores.items || []),
      };
    },
    enabled: !!lat && !!lng && !!pincode,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
  });
};

// ✅ Domain constants
export const DOMAINS = {
  FOOD: "ONDC:RET11",
  FASHION: "ONDC:RET12",
  PERSONAL_CARE: "ONDC:RET13",
  ELECTRONICS: "ONDC:RET14",
  GROCERY: "ONDC:RET10",
  HOME_DECOR: "ONDC:RET16",
} as const;