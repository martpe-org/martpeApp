import { ProductSearchResult } from "../search/search-products-type";
import { StoreSearchResult } from "../search/search-stores-type";

export interface FetchFavsResponseType {
  products: ProductSearchResult[];
  stores: StoreSearchResult[];
}

// If you still need FavoriteType somewhere else:
export type FavoriteType = Pick<FetchFavsResponseType, "products">;
