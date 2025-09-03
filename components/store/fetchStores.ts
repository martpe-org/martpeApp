'use server';

import { fetchHomeByDomain } from "@/hook/fetch-domain-data";
import { Store2 } from "../product/fetch-product-type";


export async function fetchStores(
  lat: number,
  lon: number,
  pincode: string,
  domain: string,
  page: number,
  limit: number
) {
  try {
    const response = await fetchHomeByDomain(
      lat,
      lon,
      pincode,
      domain,
      page,
      limit
    );

    if (!response) {
      throw new Error();
    }

    return {
      meta: {
        totalPages: response.stores.total
      },
      items: response?.stores.items,
      error: null
    };
  } catch (error) {
    console.error('Error fetching items:', error);
    return {
      meta: {
        totalPages: 0
      },
      items: [] as Store2[],
      error: 'Failed to load items'
    };
  }
}
