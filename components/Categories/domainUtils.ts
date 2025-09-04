import { useQuery } from "@tanstack/react-query";
import { HomeOfferType, Store2 } from "../homebydomain/fetch-domain-type";
import { fetchHomeByDomain } from "../homebydomain/fetch-domain-data";


// Transform API response to match component expectations
export const transformOfferData = (offers: HomeOfferType[]) => {
  return offers.map((offer) => ({
    id: offer.store_id,
    calculated_max_offer: {
      percent: offer.store.maxStoreItemOfferPercent || 0,
    },
    descriptor: {
      name: offer.store.name,
      images: offer.images || [],
      symbol: offer.store.symbol,
    },
  }));
};

// Generate URL-friendly slug from name
export const slugify = (name: string, fallback: string) =>
  name
    ? name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
    : fallback;

// Transform store data to match component expectations
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
      lat: store.gps.lat,
      lng: store.gps.lon,
    },
    calculated_max_offer: {
      percent: store.maxStoreItemOfferPercent || 0,
    },
    time_to_ship_in_hours: store.time_to_ship_in_hours,
   // catalogs: store.catalogs,
  }));
};

// Custom hook for fetching domain data
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

      if (!response) {
        throw new Error("Failed to fetch domain data");
      }

      // ✅ Correct shape: stores.items
      const rawStores = response.stores?.items || [];

      return {
        stores: transformStoreData(rawStores),
        offers: transformOfferData(response.offers || []),
      };
    },
    enabled: !!lat && !!lng && !!pincode,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
  });
};
